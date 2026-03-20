/**
 * Google Sheets client for reading and writing data.
 * Used by Server Actions (admin) and the fetch-static-data script.
 */

import { GoogleAuth } from "google-auth-library";

let cachedToken: { token: string; expiry: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiry - 60_000) {
    return cachedToken.token;
  }

  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_KEY env var");

  const credentials = JSON.parse(keyJson);
  const auth = new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const client = await auth.getClient();
  const tokenResponse = await (client as any).getAccessToken();
  if (!tokenResponse.token) throw new Error("Failed to obtain access token");

  cachedToken = {
    token: tokenResponse.token,
    expiry: Date.now() + 3_600_000,
  };

  return cachedToken.token;
}

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!id) throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID env var");
  return id;
}

export async function readSheetAsObjects(
  tab: string
): Promise<Record<string, string>[]> {
  const spreadsheetId = getSpreadsheetId();
  const token = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tab)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets read error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const rows: string[][] = data.values ?? [];

  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = row[i] ?? "";
    }
    return obj;
  });
}

export async function appendRow(tab: string, row: string[]): Promise<void> {
  const spreadsheetId = getSpreadsheetId();
  const token = await getAccessToken();
  const range = encodeURIComponent(tab);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets append error (${res.status}): ${text}`);
  }
}

export async function findRowIndex(tab: string, id: string): Promise<number> {
  const spreadsheetId = getSpreadsheetId();
  const token = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tab)}!A:A`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets read error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const rows: string[][] = data.values ?? [];

  // Row 0 is headers; rows are 1-indexed in Sheets API
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) return i + 1; // 1-based sheet row number
  }

  throw new Error(`Row with id "${id}" not found in tab "${tab}"`);
}

export async function updateRow(
  tab: string,
  rowIndex: number,
  row: string[]
): Promise<void> {
  const spreadsheetId = getSpreadsheetId();
  const token = await getAccessToken();
  const range = `${tab}!A${rowIndex}:Z${rowIndex}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets update error (${res.status}): ${text}`);
  }
}

async function getSheetId(tab: string): Promise<number> {
  const spreadsheetId = getSpreadsheetId();
  const token = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets metadata error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const sheet = data.sheets?.find(
    (s: any) => s.properties?.title === tab
  );

  if (!sheet) throw new Error(`Sheet tab "${tab}" not found`);
  return sheet.properties.sheetId;
}

export async function deleteRow(tab: string, rowIndex: number): Promise<void> {
  const spreadsheetId = getSpreadsheetId();
  const token = await getAccessToken();
  const sheetId = await getSheetId(tab);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1, // 0-based, inclusive
              endIndex: rowIndex, // 0-based, exclusive
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets delete error (${res.status}): ${text}`);
  }
}

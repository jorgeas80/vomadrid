"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import Link from "next/link";
import type { Cinema } from "@/lib/types";
import "leaflet/dist/leaflet.css";

const MADRID_CENTER: [number, number] = [40.4168, -3.7038];

export function CinemaMap({ cinemas }: { cinemas: Cinema[] }) {
  const withCoords = cinemas.filter((c) => c.lat && c.lng);

  return (
    <MapContainer
      center={MADRID_CENTER}
      zoom={13}
      className="h-[480px] w-full rounded-lg border border-[var(--color-border)]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.map((cinema) => (
        <CircleMarker
          key={cinema.id}
          center={[cinema.lat!, cinema.lng!]}
          radius={8}
          pathOptions={{
            color: "#16213e",
            fillColor: "#e94560",
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{cinema.name}</p>
              {cinema.address && (
                <p className="mt-0.5 text-gray-500">{cinema.address}</p>
              )}
              <Link
                href={`/cinemas/${cinema.id}`}
                className="mt-1 block text-[#e94560] hover:underline"
              >
                View sessions →
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

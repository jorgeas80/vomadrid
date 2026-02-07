import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { PostHogProvider } from "@/components/PostHogProvider";

export const metadata: Metadata = {
  title: "VO Madrid — Original version cinema in Madrid",
  description:
    "Find movies in original version and buy tickets at cinemas in Madrid.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <PostHogProvider>
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </PostHogProvider>
      </body>
    </html>
  );
}

"use client";

import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/navbar";
import Blank from "@/app/blank";
import { AuthProvider } from "@/app/lib/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${robotoMono.variable}`}>
      <body
        className="text-text text-mono grid gap-10 p-10 bg-base w-screen h-screen overflow-y"
        style={{
          gridTemplateRows: "auto 1fr",
          gridTemplateColumns: "1fr minmax(auto, 800px) 1fr",
        }}
      >
        <QueryClientProvider client={queryClient}>
          {/* <ReactQueryDevtools /> */}
          <AuthProvider>
            <Blank />
            <Navbar />
            <Blank />
            <Blank />
            {children}
            <Blank />
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

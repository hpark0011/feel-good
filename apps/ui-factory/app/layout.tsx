import { InstrumentSerif, Inter } from "@/app/fonts/font";
import { AppSidebar } from "@/components/app-sidebar";
import { NavHeader } from "@/components/nav-header";
import { RootProvider } from "@/providers/root-provider";
import "@/styles/globals.css";
import {
  SidebarInset,
  SidebarProvider,
} from "@feel-good/ui/primitives/sidebar";
import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UI Factory",
  description: "Component design and preview tool for Feel Good apps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${Inter.variable} ${InstrumentSerif.variable} ${geistMono.variable} antialiased`}
      >
        <RootProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <NavHeader />
              <main>{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </RootProvider>
      </body>
    </html>
  );
}

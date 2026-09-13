import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClimaPro",
  description: "Sistema de gestão para empresas de climatização",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

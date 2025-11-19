import type { Metadata } from 'next';
import './globals.css';
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: 'Electoral Prediction System',
  description: 'Predict voting patterns with geospatial data.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased h-full flex flex-col bg-background text-foreground")}>
        <Header />
        <main className="flex-1 flex flex-col min-h-0">{children}</main>
      </body>
    </html>
  );
}

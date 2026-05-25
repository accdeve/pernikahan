import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Undangan Pernikahan Premium - Juliana & Muhammad",
  description: "Undangan Pernikahan Eksklusif & Elegan - Royal Javanese Heritage & Modern Editorial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load Google Fonts: Bodoni Moda, Cinzel, Great Vibes, Inter, Newsreader, Playfair Display */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Cinzel:wght@400..900&family=Great+Vibes&family=Inter:wght@100..900&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" 
          rel="stylesheet" 
        />
        {/* Load Material Symbols Outlined icons */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}


import './globals.css'; // To podłącza Tailwind CSS!

export const metadata = {
  title: 'GAZSTAR - Gazy Techniczne',
  description: 'Nowoczesny portal zamówień B2B dla przemysłu i gastronomii.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="antialiased">
        {/* Tu Next.js automatycznie wrzuci nasze podstrony (page.tsx) */}
        {children}
      </body>
    </html>
  );
}
import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'MeritView - ශිෂ්‍ය ශ්‍රේණිගත කිරීමේ පද්ධතිය',
  description: 'ශිෂ්‍ය ශ්‍රේණිගත කිරීමේ නිල පද්ධතිය. ලකුණු ඇතුළත් කරන්න සහ ප්‍රතිඵල බලන්න.',
  keywords: ['ශිෂ්‍ය', 'ශ්‍රේණිගත', 'ලකුණු', 'MeritView'],
  openGraph: {
    title: 'MeritView - ශිෂ්‍ය ශ්‍රේණිගත කිරීමේ පද්ධතිය',
    description: 'ශිෂ්‍ය ශ්‍රේණිගත කිරීමේ නිල පද්ධතිය',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f5f6fa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="si" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="page-wrapper">
          <Navbar />
          <main className="main-content">{children}</main>
          <footer className="footer">
            <p>© 2026 MeritView · Amarasri Herath Technical Team</p>
          </footer>
        </div>
      </body>
    </html>
  );
}

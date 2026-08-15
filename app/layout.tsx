import type { Metadata } from 'next';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="si">
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
            <p>© 2024 MeritView · ශිෂ්‍ය ශ්‍රේණිගත කිරීමේ පද්ධතිය</p>
          </footer>
        </div>
      </body>
    </html>
  );
}

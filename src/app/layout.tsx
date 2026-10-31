import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GadgetPulse | Is This Tech Gadget a Good Price Right Now?',
  description: 'We track 90-day tech gadget prices so you never have to guess whether a discount is real. Honest verdicts based on median price history.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

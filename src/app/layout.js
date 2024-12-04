import "./globals.css";
import { Nokora } from 'next/font/google';

export const metadata = {
  title: "Chirper",
  description: "A social media proof-of-concept app.",
};

const font = Nokora({
  weight: '400',
  subsets: ['latin'],
})

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={font.className}>
        <main className="w-full h-full min-h-screen min-w-screen bg-primary flex text-color">
          {children}
        </main>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Zombie Siege',
    description: 'Browser-based 3D wave survival game',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}

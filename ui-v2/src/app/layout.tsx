import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Dynamic Firewall Logic Builder',
    description: 'Visual flow-based firewall rule logic builder',
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

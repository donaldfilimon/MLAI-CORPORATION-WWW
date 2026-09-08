import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Shell } from '../components/chrome';
import { Enhance } from '../components/enhance';
import { themePrepaint } from '../lib/chrome-ui';
import './globals.css';
export const metadata: Metadata = {
    title: { default: 'MLAI — Intelligence, with integrity.', template: '%s · MLAI' },
    description: 'Explore MLAI projects, source-based documentation, and evidence boundaries. Independent website review.',
    robots: { index: false, follow: false },
    icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: {
    children: ReactNode;
}) {
    return <html lang="en" suppressHydrationWarning>
    <head>
    <script dangerouslySetInnerHTML={{ __html: themePrepaint }}/>
    </head>
    <body>
    <Shell>{children}</Shell>
    <Enhance />
    </body>
    </html>;
}

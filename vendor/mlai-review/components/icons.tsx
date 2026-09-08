import type { CSSProperties, ReactNode } from 'react';
export function Icon({ name = 'arrow', size = 20, className = '', style }: {
    name?: string;
    size?: number;
    className?: string;
    style?: CSSProperties;
}) {
    const paths: Record<string, ReactNode> = {
        arrow: <>
        <path d="M4 12h15m-6-6 6 6-6 6"/>
        </>, external: <>
        <path d="M7 17 17 7M7 7h10v10"/>
        </>,
        search: <>
        <circle cx="10.5" cy="10.5" r="6.5"/>
        <path d="m16 16 4.5 4.5"/>
        </>,
        close: <path d="m6 6 12 12M6 18 18 6"/>, menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
        sun: <>
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>
        </>,
        moon: <path d="M20.5 13.5A8.6 8.6 0 0 1 10.5 3 8.6 8.6 0 1 0 20.5 13.5Z"/>,
        layers: <>
        <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>
        </>,
        database: <>
        <ellipse cx="12" cy="5" rx="8" ry="3"/>
        <path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>
        </>,
        spark: <>
        <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>
        </>,
        command: <>
        <rect x="4" y="4" width="16" height="16" rx="4"/>
        <path d="m10 9-3 3 3 3m4-6 3 3-3 3"/>
        </>,
        code: <>
        <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>
        </>,
        copy: <>
        <rect x="8" y="8" width="12" height="13" rx="2"/>
        <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/>
        </>,
        check: <path d="m5 12 4 4L19 6"/>, book: <>
        <path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15"/>
        </>,
        github: <>
        <path d="M9 21v-4c-4 1-4-2-6-3m12 7v-4c0-1-.2-2-1-2 4-.4 6-2 6-5 0-1.5-.5-2.5-1.5-3.5.2-1 .2-2-.3-3-2 0-3 1-4 1a13 13 0 0 0-5 0C8 4.5 7 3.5 5 3.5c-.5 1-.5 2-.3 3C3.7 7.5 3.2 8.5 3.2 10c0 3 2 4.6 6 5-.8 0-1.2 1-1.2 2"/>
        </>,
        chevron: <path d="m9 5 7 7-7 7"/>, download: <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>
        </>,
        shield: <>
        <path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z"/>
        <path d="m8 11 3 3 5-5"/>
        </>,
        mark: <>
        <path d="M3 19V5l9 9 9-9v14M8 19v-5m8 5v-5"/>
        </>
    };
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">{paths[name] || paths.arrow}</svg>;
}

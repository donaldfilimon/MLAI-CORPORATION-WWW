'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initInteractions } from '../lib/interactions';
/** The only client boundary. Content remains server-rendered and links are native. */
export function Enhance() {
    const pathname = usePathname();
    useEffect(() => {
        document.querySelectorAll<HTMLAnchorElement>('.desktop-nav a').forEach(a => {
            if (pathname.startsWith(a.getAttribute('href') || '__none__'))
                a.setAttribute('aria-current', 'page');
            else
                a.removeAttribute('aria-current');
        });
        return initInteractions(document);
    }, [pathname]);
    return null;
}

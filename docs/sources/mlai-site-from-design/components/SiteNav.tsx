'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS: Array<[string, string]> = [
  ['/wdbx', 'WDBX'],
  ['/abi', 'ABI'],
  ['/abbey', 'Abbey'],
  ['/platform', 'Platform'],
  ['/services', 'Services'],
  ['/research', 'Research'],
  ['/architecture', 'Architecture'],
  ['/company', 'Company'],
  ['/investors', 'Investors'],
];

export function Brand() {
  return (
    <Link className="brand" href="/">
      <span className="mark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/mlai-logo-icon.svg" alt="MLAI mark" />
      </span>
      <span className="word">MLAI</span>
    </Link>
  );
}

export function SiteNav() {
  const path = usePathname();
  return (
    <header className="nav">
      <div className="nav-inner">
        <Brand />
        <nav className="nav-links">
          {LINKS.map(([href, label]) => (
            <Link key={href} className={path === href ? 'cur' : ''} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <Link className={'nav-cta' + (path === '/contact' ? ' cur' : '')} href="/contact">
          Contact
        </Link>
      </div>
    </header>
  );
}

import type { ReactNode } from 'react';
import { Icon } from './icons';
import { repoUrl, searchEntries, reviewedAt } from '../lib/content';
export function Brand() {
    return <a className="brand" href="/" aria-label="MLAI home">
    <span className="brand-mark">
    <Icon name="mark" size={26}/>
    </span>
    <span>MLAI<span className="brand-sub">Corporation</span>
    </span>
    </a>;
}
const navigation = [['/projects/', 'Projects'], ['/docs/', 'Documentation'], ['/trust/', 'Evidence'], ['/about/', 'About']];
export function Header({ route = '/' }: {
    route?: string;
}) {
    return <>
    <a className="skip" href="#main">Skip to content</a>
    <header className="header">
    <div className="container header-inner">
    <Brand />
    <nav className="desktop-nav" aria-label="Main navigation">{navigation.map(([href, title]) => <a key={href} href={href} aria-current={route.startsWith(href) ? 'page' : undefined}>{title}</a>)}</nav>
    <div className="header-actions">
    <button className="icon-button" data-search-open aria-label="Search documentation">
    <Icon name="search"/>
    </button>
    <button className="icon-button theme-toggle" data-theme-toggle aria-label="Switch to dark theme">
    <Icon name="sun"/>
    </button>
    <a className="button button-small source-cta" href={repoUrl} target="_blank" rel="noopener noreferrer">View source<Icon name="external" size={17}/>
    </a>
    <button className="icon-button mobile-trigger" data-menu-open aria-label="Open navigation" aria-haspopup="dialog" aria-controls="mobile-menu">
    <Icon name="menu"/>
    </button>
    </div>
    </div>
    </header>
    <dialog id="mobile-menu" className="mobile-dialog" aria-labelledby="menu-title">
    <div className="dialog-heading">
    <h2 id="menu-title">Explore MLAI</h2>
    <button className="icon-button" data-menu-close aria-label="Close navigation">
    <Icon name="close"/>
    </button>
    </div>
    <nav aria-label="Mobile navigation">{navigation.map(([href, title]) => <a key={href} href={href}>{title}<Icon name="arrow"/>
        </a>)}</nav>
    <a className="button" href={repoUrl}>View the source<Icon name="external"/>
    </a>
    </dialog>
    </>;
}
export function Footer() {
    return <footer className="footer">
    <div className="container footer-top">
    <div>
    <Brand />
    <p>Thoughtful tools.<br />Inspectable work.</p>
    </div>
    <div className="footer-links">
    <div>
    <span className="overline">Explore</span>
    <a href="/projects/">Project directory</a>
    <a href="/docs/">Documentation</a>
    <a href="/trust/">Evidence ledger</a>
    </div>
    <div>
    <span className="overline">Connect</span>
    <a href="/about/">Our approach</a>
    <a href="/brief/">Prepare a project brief</a>
    <a href={repoUrl} target="_blank" rel="noopener noreferrer">GitHub<Icon name="external" size={14}/>
    </a>
    </div>
    </div>
    </div>
    <div className="container appearance-row">
    <span>Make yourself comfortable.</span>
    <div className="appearance-controls" role="group" aria-label="Appearance">
    <button type="button" data-theme-choice="light" aria-pressed="false">Light</button>
    <button type="button" data-theme-choice="dark" aria-pressed="false">Dark</button>
    <button type="button" data-theme-choice="system" data-theme-system aria-pressed="true">System</button>
    </div>
    </div>
    <div className="container footer-bottom">
    <span>Independent review · Not the production site</span>
    <span>Source review: {reviewedAt}</span>
    </div>
    </footer>;
}
export function SearchDialog() {
    return <>
    <dialog id="search-dialog" className="search-dialog" aria-labelledby="search-title">
    <div className="search-heading">
    <Icon name="search" size={23}/>
    <h2 id="search-title" className="sr-only">Search documentation and projects</h2>
    <label className="sr-only" htmlFor="search-input">Search documentation and projects</label>
    <input id="search-input" autoComplete="off" placeholder="Search by topic, code, or concept…" maxLength={160} autoFocus role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="search-results" aria-describedby="search-count" spellCheck={false}/>
    <button type="button" className="search-clear" data-search-clear hidden aria-label="Clear search">Clear</button>
    <button className="icon-button" data-search-close aria-label="Close search">
    <Icon name="close" size={20}/>
    </button>
    </div>
    <div className="search-meta">
    <span id="search-count" role="status" aria-live="polite">Suggested reading</span>
    <span>Local search · No AI calls</span>
    </div>
    <div id="search-results" className="search-results" role="listbox" aria-label="Search results"/>
    <div className="search-help">
    <span>
    <kbd>↑</kbd>
    <kbd>↓</kbd> Navigate <kbd>Enter</kbd> Open</span>
    <span>
    <kbd>Esc</kbd> Close</span>
    </div>
    </dialog>
    <script type="application/json" id="search-index" dangerouslySetInnerHTML={{ __html: JSON.stringify(searchEntries).replace(/</g, '\\u003c') }}/>
    </>;
}
export function Shell({ children, route = '/' }: {
    children: ReactNode;
    route?: string;
}) {
    return <>
    <Header route={route}/>
    <main id="main" tabIndex={-1}>{children}</main>
    <Footer />
    <SearchDialog />
    <div id="toast" className="toast" role="status" aria-live="polite"/>
    </>;
}
export function SourceLink({ href, children }: {
    href: string;
    children: ReactNode;
}) {
    return <a className="text-link" href={href} target="_blank" rel="noopener noreferrer">{children}<Icon name="external" size={16}/>
    </a>;
}
export function ButtonLink({ href, children, secondary = false }: {
    href: string;
    children: ReactNode;
    secondary?: boolean;
}) {
    return <a href={href} className={'button ' + (secondary ? 'button-secondary' : '')}>{children}<Icon name="arrow" size={18}/>
    </a>;
}

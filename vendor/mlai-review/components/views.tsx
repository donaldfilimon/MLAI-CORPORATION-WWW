import { Home } from './home';
import { ProjectsPage, ProjectPage } from './projects';
import { DocsPage } from './docs';
import { TrustPage, AboutPage, BriefPage, NotFound } from './other';
import { getProject, getArticle } from '../lib/content';
export function normalizedRoute(path: string) { return path === '/' ? '/' : '/' + path.split('/').filter(Boolean).join('/') + '/'; }
export function routeTitle(path: string): string { const route = normalizedRoute(path); if (route === '/')
    return 'MLAI — Intelligence, with integrity.'; if (route === '/projects/')
    return 'Explore the projects · MLAI'; if (route.startsWith('/projects/'))
    return (getProject(route.split('/')[2])?.name || 'Not found') + ' · MLAI'; if (route.startsWith('/docs/'))
    return (getArticle(route.slice(6, -1))?.title || 'Documentation') + ' · MLAI'; return (({ '/trust/': 'Evidence ledger', '/about/': 'Our approach', '/brief/': 'Prepare a project brief' } as Record<string, string>)[route] || 'Page not found') + ' · MLAI'; }
export function View({ route }: {
    route: string;
}) { route = normalizedRoute(route); if (route === '/')
    return <Home />; if (route === '/projects/')
    return <ProjectsPage />; if (route.startsWith('/projects/')) {
    const p = getProject(route.split('/')[2]);
    return p ? <ProjectPage project={p}/> : <NotFound />;
} ; if (route.startsWith('/docs/')) {
    const article = getArticle(route === '/docs/' ? '' : route.slice(6, -1));
    return article ? <DocsPage article={article}/> : <NotFound />;
} ; if (route === '/trust/')
    return <TrustPage />; if (route === '/about/')
    return <AboutPage />; if (route === '/brief/')
    return <BriefPage />; return <NotFound />; }

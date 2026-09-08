import { notFound } from 'next/navigation';
import { projects, getProject } from '../../../lib/content';
import { ProjectPage } from '../../../components/projects';
type Props = {
    params: Promise<{
        slug: string;
    }>;
};
export function generateStaticParams() { return projects.map(p => ({ slug: p.id })); }
export async function generateMetadata({ params }: Props) { const p = getProject((await params).slug); return { title: p?.name || 'Project not found', description: p?.description }; }
export default async function Page({ params }: Props) { const p = getProject((await params).slug); if (!p)
    notFound(); return <ProjectPage project={p}/>; }

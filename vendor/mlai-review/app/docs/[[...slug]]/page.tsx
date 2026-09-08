import { notFound } from 'next/navigation';
import { articles, getArticle } from '../../../lib/content';
import { source } from '../../../lib/source';
import { DocsPage, CodeBlock } from '../../../components/docs';
type Props = {
    params: Promise<{
        slug?: string[];
    }>;
};
export function generateStaticParams() { return articles.map(a => ({ slug: a.slug ? [a.slug] : [] })); }
export async function generateMetadata({ params }: Props) { const a = getArticle(((await params).slug || []).join('/')); return { title: a?.title || 'Guide not found', description: a?.description }; }
export default async function Page({ params }: Props) {
    const { slug = [] } = await params;
    const article = getArticle(slug.join('/'));
    const page = source.getPage(slug);
    if (!article || !page)
        notFound();
    const Body = page.data.body;
    return <DocsPage article={article}>
    <Body components={{ CodeBlock }}/>
    </DocsPage>;
}

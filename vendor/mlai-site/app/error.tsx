'use client';
export default function ErrorPage({reset}:{reset:()=>void}){
 return <main className="container not-found"><p className="section-number">PAGE ERROR</p><h1>Something did not load.</h1><p>Retry this page or return to the project directory.</p><div className="hero-actions"><button className="button" onClick={reset}>Try again</button><a href="/projects/" className="text-link">Project directory</a></div></main>;
}

'use client';

import { useEffect } from 'react';

/** Copy buttons + TOC scroll-spy for the docs page. */
export default function DocsInteractions() {
  useEffect(() => {
    const copyHandlers: Array<[Element, EventListener]> = [];
    document.querySelectorAll('.cb-copy').forEach((btn) => {
      const fn: EventListener = () => {
        const pre = btn.closest('.codeblock')?.querySelector('pre');
        if (!pre) return;
        navigator.clipboard.writeText(pre.textContent || '').then(() => {
          btn.textContent = 'Copied ✓';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1400);
        });
      };
      btn.addEventListener('click', fn);
      copyHandlers.push([btn, fn]);
    });

    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.docs-toc a'));
    const secs = links.map((a) => document.querySelector<HTMLElement>(a.getAttribute('href') || ''));
    const spy = () => {
      const y = window.scrollY + 140;
      let on = 0;
      secs.forEach((s, i) => { if (s && s.offsetTop <= y) on = i; });
      links.forEach((a, i) => a.classList.toggle('on', i === on));
    };
    window.addEventListener('scroll', spy, { passive: true });
    spy();

    return () => {
      copyHandlers.forEach(([el, fn]) => el.removeEventListener('click', fn));
      window.removeEventListener('scroll', spy);
    };
  }, []);
  return null;
}

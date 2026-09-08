try { const t=localStorage.getItem('mlai-theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'; } catch {}

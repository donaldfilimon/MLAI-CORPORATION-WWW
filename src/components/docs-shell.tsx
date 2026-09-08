"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@mlai/ui";
import { groupDocsNavItems, type DocsNavItem } from "@/lib/docs";

export type { DocsNavItem };

export function DocsShell({
  items,
  children,
}: {
  items: DocsNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const groups = useMemo(() => groupDocsNavItems(items), [items]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="docs-shell">
      <aside className="docs-sidebar" aria-label="Documentation">
        <button
          type="button"
          className="docs-search-trigger"
          onClick={() => setOpen(true)}
        >
          <Search size={14} aria-hidden="true" />
          <span>Search docs</span>
          <kbd>⌘K</kbd>
        </button>
        <nav>
          {groups.map(([category, entries]) => (
            <div className="docs-nav-group" key={category}>
              <span className="docs-nav-label">{category}</span>
              {entries.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={active ? "active" : undefined}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <div className="docs-content">{children}</div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search documentation…" />
        <CommandList>
          <CommandEmpty>
            Nothing matches — try another title or topic.
          </CommandEmpty>
          {groups.map(([category, entries]) => (
            <CommandGroup heading={category} key={category}>
              {entries.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.title} ${item.description} ${item.category}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(item.href);
                  }}
                >
                  <div className="docs-command-item">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  );
}

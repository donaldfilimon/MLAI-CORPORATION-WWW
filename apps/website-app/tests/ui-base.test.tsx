import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Badge } from "../packages/ui/src/components/ui/badge";
import { Button } from "../packages/ui/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../packages/ui/src/components/ui/dialog";
import {
  NavigationMenu,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../packages/ui/src/components/ui/navigation-menu";
import { Separator } from "../packages/ui/src/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../packages/ui/src/components/ui/sheet";

function sourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...sourceFiles(path));
    else if (/\.(tsx?|css)$/.test(entry.name)) files.push(path);
  }
  return files;
}

const uiPackage = fileURLToPath(new URL("../packages/ui/", import.meta.url));

describe("@mlai/ui Base UI primitives", () => {
  it("renders the shipped button, badge, separator, dialog, sheet, and navigation menu", () => {
    expect(typeof Button).toBe("function");
    expect(typeof Badge).toBe("function");
    expect(typeof Separator).toBe("function");
    expect(typeof Dialog).toBe("function");
    expect(typeof DialogTrigger).toBe("function");
    expect(typeof DialogContent).toBe("function");
    expect(typeof DialogTitle).toBe("function");
    expect(typeof DialogDescription).toBe("function");
    expect(typeof Sheet).toBe("function");
    expect(typeof SheetTrigger).toBe("function");
    expect(typeof SheetContent).toBe("function");
    expect(typeof SheetTitle).toBe("function");
    expect(typeof NavigationMenu).toBe("function");
    expect(typeof NavigationMenuList).toBe("function");
    expect(typeof NavigationMenuItem).toBe("function");
    expect(typeof NavigationMenuTrigger).toBe("function");
    expect(typeof NavigationMenuLink).toBe("function");

    expect(renderToStaticMarkup(<Button>Open</Button>)).toContain("Open");
    const linkButton = renderToStaticMarkup(
      <Button asChild>
        <a href="/docs">Docs</a>
      </Button>,
    );
    expect(linkButton).toContain('href="/docs"');
    expect(linkButton).toContain(">Docs</a>");
    expect(linkButton).not.toContain('type="button"');
    expect(linkButton).not.toContain('role="button"');
    const forcedNative = renderToStaticMarkup(
      <Button asChild nativeButton>
        <a href="/forced">Forced</a>
      </Button>,
    );
    expect(forcedNative).toContain('type="button"');
    expect(forcedNative).toContain('href="/forced"');
    expect(renderToStaticMarkup(<Badge>Live</Badge>)).toContain("Live");
    const separator = renderToStaticMarkup(
      <Separator orientation="vertical" />,
    );
    expect(separator).toContain('data-orientation="vertical"');
    expect(separator).toContain('data-slot="separator"');

    const dialog = renderToStaticMarkup(
      <Dialog defaultOpen>
        <DialogTrigger>Show</DialogTrigger>
        <DialogContent>
          <DialogTitle>Memory</DialogTitle>
          <DialogDescription>Stored with the record.</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(dialog).toContain("Show");
    expect(dialog).toContain('data-slot="dialog-trigger"');

    const sheet = renderToStaticMarkup(
      <Sheet defaultOpen>
        <SheetTrigger>Menu</SheetTrigger>
        <SheetContent>
          <SheetTitle>Sections</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(sheet).toContain("Menu");
    expect(sheet).toContain('data-slot="sheet-trigger"');

    const nav = renderToStaticMarkup(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/docs">Docs</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(nav).toContain("Docs");
    expect(nav).toContain('data-slot="navigation-menu"');
    const indicator = renderToStaticMarkup(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuIndicator />
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(indicator).toContain('data-slot="navigation-menu-indicator"');
  });

  it("rejects a radix-ui import or direct dependency in @mlai/ui", () => {
    const manifest = JSON.parse(
      readFileSync(join(uiPackage, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };
    const declared = [
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.devDependencies ?? {}),
      ...Object.keys(manifest.peerDependencies ?? {}),
    ];
    expect(declared.filter((name) => name.includes("radix-ui"))).toEqual([]);

    const offenders = sourceFiles(join(uiPackage, "src")).filter((file) =>
      readFileSync(file, "utf8").includes("radix-ui"),
    );
    expect(offenders).toEqual([]);
  });
});

"use client";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { PublicNav as DesignSystemPublicNav } from "@mlai/ui";
export function PublicNav() {
  return <DesignSystemPublicNav Link={NextLink} currentPath={usePathname()} />;
}

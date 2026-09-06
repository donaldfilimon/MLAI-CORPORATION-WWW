"use client";
import NextLink from "next/link";
import {
  ContentIndex as DesignSystemContentIndex,
  type ContentIndexProps,
} from "@mlai/ui";
export function ContentIndex(props: Omit<ContentIndexProps, "Link">) {
  return <DesignSystemContentIndex Link={NextLink} {...props} />;
}

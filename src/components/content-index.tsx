"use client";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  ContentIndex as DesignSystemContentIndex,
  type ContentIndexProps,
} from "@mlai/ui";
type Props = Omit<ContentIndexProps, "Link" | "query" | "onQueryChange">;
function SearchableContentIndex(props: Props) {
  const searchParams = useSearchParams();
  return (
    <DesignSystemContentIndex
      {...props}
      Link={NextLink}
      query={searchParams.get("q") ?? ""}
      onQueryChange={(query) => {
        const url = new URL(window.location.href);
        if (query) url.searchParams.set("q", query);
        else url.searchParams.delete("q");
        window.history.replaceState(null, "", url);
      }}
    />
  );
}
export function ContentIndex(props: Props) {
  return (
    <Suspense
      fallback={<DesignSystemContentIndex Link={NextLink} {...props} />}
    >
      <SearchableContentIndex {...props} />
    </Suspense>
  );
}

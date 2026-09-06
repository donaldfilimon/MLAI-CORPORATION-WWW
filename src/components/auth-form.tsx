"use client";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthForm as DesignSystemAuthForm,
  type AuthFormValues,
} from "@mlai/ui";
export function AuthForm({ signup = false }: { signup?: boolean }) {
  const router = useRouter();
  return (
    <DesignSystemAuthForm
      signup={signup}
      Link={NextLink}
      onSubmit={async (fields: AuthFormValues) => {
        const response = await fetch(
          `/api/auth/${signup ? "sign-up/email" : "sign-in/email"}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...fields, callbackURL: "/app" }),
          },
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Sign-in failed.");
        const requested = new URLSearchParams(window.location.search).get(
          "returnTo",
        );
        router.push(
          requested?.startsWith("/app") && !requested.startsWith("//")
            ? requested
            : "/app",
        );
        router.refresh();
      }}
    />
  );
}

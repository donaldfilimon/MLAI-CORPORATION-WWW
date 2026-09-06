"use client";
import {
  ContactForm as DesignSystemContactForm,
  type ContactFormValues,
} from "@mlai/ui";
export function ContactForm() {
  return (
    <DesignSystemContactForm
      onSubmit={async (values: ContactFormValues) => {
        const response = await fetch("/api/v1/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.error?.message || "Unable to save your inquiry.",
          );
        return { message: result.message as string };
      }}
    />
  );
}

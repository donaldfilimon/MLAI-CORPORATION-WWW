"use client";
import { useState, type ReactNode } from "react";
export type ContactFormValues = Record<string, FormDataEntryValue>;
export interface ContactFormProps {
  /**
   * Performs the submission and returns the message to display. There is no
   * default that reports success: an unwired form says so rather than
   * pretending the inquiry was saved.
   */
  onSubmit?: (values: ContactFormValues) => Promise<{ message: string }>;
  note?: ReactNode;
}
async function unconfigured(): Promise<{ message: string }> {
  throw new Error("This form has no submit handler configured.");
}
export function ContactForm({
  onSubmit = unconfigured,
  note = "Your inquiry is saved in this local installation for MLAI staff to review.",
}: ContactFormProps) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  return (
    <form
      className="form-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        const form = e.currentTarget;
        try {
          const result = await onSubmit(
            Object.fromEntries(new FormData(form)) as ContactFormValues,
          );
          setOk(true);
          setMessage(result.message);
          form.reset();
        } catch (err) {
          setOk(false);
          setMessage((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="two-columns">
        <label>
          Name
          <input name="name" required maxLength={100} autoComplete="name" />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
          />
        </label>
      </div>
      <label>
        Company <span className="muted">(optional)</span>
        <input name="company" maxLength={200} autoComplete="organization" />
      </label>
      <label>
        What would you like to work on?
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={8000}
          rows={6}
        />
      </label>
      <button className="button primary" disabled={busy}>
        {busy ? "Saving…" : "Send inquiry"}
      </button>
      {message && (
        <p role="status" className={ok ? "success" : "error"}>
          {message}
        </p>
      )}
      {note && <p className="small muted">{note}</p>}
    </form>
  );
}

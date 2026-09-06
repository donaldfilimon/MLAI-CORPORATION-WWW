"use client";
import { useState } from "react";
export function ContactForm() {
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
        const data = Object.fromEntries(new FormData(form));
        try {
          const r = await fetch("/api/v1/inquiries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const result = await r.json();
          if (!r.ok)
            throw new Error(
              result.error?.message || "Unable to save your inquiry.",
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
      <p className="small muted">
        Your inquiry is saved in this local installation for MLAI staff to
        review.
      </p>
    </form>
  );
}

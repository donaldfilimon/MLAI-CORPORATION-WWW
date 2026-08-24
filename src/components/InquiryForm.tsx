import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { track } from "@/lib/telemetry";
import { Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Callout } from "@/components/site";
import { TurnstileWidget, type TurnstileWidgetHandle } from "@/components/TurnstileWidget";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

type InquiryFormState = {
  success: boolean;
  errors: Record<string, string[]>;
  message: string;
};

// React 19 Server Action signature (mocked as client action here)
async function submitInquiry(
  _prevState: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  const data = Object.fromEntries(formData.entries());
  const errors: Record<string, string[]> = {};

  if (!data.name || String(data.name).length < 2)
    errors.name = ["Name must be at least 2 characters"];
  if (!data.email || !String(data.email).includes("@"))
    errors.email = ["Invalid email address"];
  if (!data.company || String(data.company).length < 2)
    errors.company = ["Company name is required"];
  if (!data.message || String(data.message).length < 10)
    errors.message = ["Message must be at least 10 characters"];

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: "Please fix the errors in the form.",
    };
  }

  try {
    track("inquiry_submit");
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        company: data.company,
        projectType: data.projectType,
        turnstileToken: data.turnstileToken,
        // The API accepts exactly name/email/company/projectType/message and
        // silently drops unknown fields, so the optional data-locality chip is
        // folded into the message as a prefix line rather than sent separately.
        message: data.dataLocality
          ? `Data locality: ${data.dataLocality}\n\n${data.message}`
          : data.message,
      }),
    });

    const result = await response.json();
    if (response.ok && result.ok) {
      track("inquiry_success");
      return {
        success: true,
        errors: {},
        message:
          "Your inquiry has been stored securely. Our partnerships team will review your specifications and contact you shortly.",
      };
    } else {
      return {
        success: false,
        errors: {},
        message: result.error || "Failed to submit inquiry to the server.",
      };
    }
  } catch (err) {
    return {
      success: false,
      errors: {},
      message:
        "A network error occurred. Please verify your connection and try again.",
    };
  }
}

function SubmitButton({ verified }: { verified: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending || !verified}
      type="submit"
      className="w-full py-6 flex items-center justify-center gap-3 text-md"
    >
      {pending ? "Checking..." : "Check Inquiry Details"}
      {!pending && <Send className="w-4 h-4" />}
    </Button>
  );
}

const DATA_LOCALITY_OPTIONS = ["On-device only", "Hybrid", "Not sure yet"];

export const InquiryForm = ({ isOpen, onClose }: InquiryFormProps) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  // Optional chip selection; carried into the FormData via a hidden input and
  // folded into the message payload (the API has no dataLocality field).
  const [dataLocality, setDataLocality] = useState("");
  const [state, formAction] = useActionState(async (previousState: InquiryFormState, formData: FormData) => {
    try {
      return await submitInquiry(previousState, formData);
    } finally {
      turnstileRef.current?.reset();
    }
  }, {
    success: false,
    errors: {} as Record<string, string[]>,
    message: "",
  });

  // Auto-focus the first field when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to let framer-motion animate in
      const timer = setTimeout(() => nameInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-surface border-white/10 rounded-3xl p-8">
        <DialogHeader className="sr-only">
          <DialogTitle>Inquiry Form</DialogTitle>
          <DialogDescription>
            Submit your inquiry to the MLAI team.
          </DialogDescription>
        </DialogHeader>

        {state.success ? (
          <div className="text-center py-6 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold text-white">
                Inquiry Received
              </h3>
              <p className="text-text-dim text-sm max-w-sm mx-auto leading-relaxed">
                {state.message}
              </p>
            </div>
            <Button
              onClick={onClose}
              className="w-full py-4 rounded-xl font-bold"
            >
              Dismiss
            </Button>
          </div>
        ) : (
          <form action={formAction} className="space-y-8">
            <div className="space-y-2 pb-2">
              <h3
                id="inquiry-form-title"
                className="text-3xl font-display font-bold text-white"
              >
                Start an Inquiry
              </h3>
              <p className="text-text-dim">
                Define your requirements for neural orchestration.
              </p>
            </div>

            {state.message && !state.success && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="inquiry-name"
                    className="text-xs font-bold text-text-dim uppercase tracking-widest"
                  >
                    Full Name
                  </Label>
                  <Input
                    ref={nameInputRef}
                    id="inquiry-name"
                    name="name"
                    type="text"
                    defaultValue=""
                    className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-12 rounded-xl"
                    placeholder="Jane Doe"
                  />
                  {state.errors?.name && (
                    <p className="text-xs text-red-400">
                      {state.errors.name[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="inquiry-email"
                    className="text-xs font-bold text-text-dim uppercase tracking-widest"
                  >
                    Work Email
                  </Label>
                  <Input
                    id="inquiry-email"
                    name="email"
                    type="email"
                    defaultValue=""
                    className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-12 rounded-xl"
                    placeholder="jane@company.com"
                  />
                  {state.errors?.email && (
                    <p className="text-xs text-red-400">
                      {state.errors.email[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="inquiry-company"
                  className="text-xs font-bold text-text-dim uppercase tracking-widest"
                >
                  Organization
                </Label>
                <Input
                  id="inquiry-company"
                  name="company"
                  type="text"
                  defaultValue=""
                  className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-12 rounded-xl"
                  placeholder="Organization Name"
                />
                {state.errors?.company && (
                  <p className="text-xs text-red-400">
                    {state.errors.company[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                {/*
                  The other fields associate label→control with htmlFor/id, but
                  that does not work here: Base UI's Select.Trigger renders a
                  `<button role="combobox">`, and HTML-AAM does not feed a
                  `<label for>` into a button's accessible-name computation — the
                  association would exist in the DOM and still leave the control
                  nameless in a screen reader. Base UI's own guidance is to name
                  the trigger instead (docs: "provide an aria-label on
                  <Select.Trigger>"), and its `Select.Label` part does exactly
                  this internally by feeding `aria-labelledby`. We do the same by
                  hand, since `ui/select.tsx` maps `SelectLabel` to the in-popup
                  group label, not the field label. Our `aria-labelledby` wins:
                  SelectTrigger merges `elementProps` after its own defaults.
                */}
                <Label
                  id="inquiry-project-type-label"
                  className="text-xs font-bold text-text-dim uppercase tracking-widest"
                >
                  Focus Area
                </Label>
                <Select name="projectType" defaultValue="research">
                  <SelectTrigger
                    id="inquiry-project-type"
                    aria-labelledby="inquiry-project-type-label"
                    className="bg-black/50 border-white/10 text-white h-12 rounded-xl"
                  >
                    <SelectValue placeholder="Select a focus area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="research">Academic Research</SelectItem>
                    <SelectItem value="industrial">
                      Industrial Deployment
                    </SelectItem>
                    <SelectItem value="compliance">
                      Safety & Compliance Audit
                    </SelectItem>
                    <SelectItem value="licensing">
                      Framework Licensing
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <span
                  id="inquiry-data-locality-label"
                  className="block text-xs font-bold text-text-dim uppercase tracking-widest"
                >
                  Where does the data have to live?
                </span>
                <div
                  role="group"
                  aria-labelledby="inquiry-data-locality-label"
                  className="flex flex-wrap gap-2"
                >
                  {DATA_LOCALITY_OPTIONS.map((opt) => {
                    const on = dataLocality === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setDataLocality(on ? "" : opt)}
                        className={`rounded-xl border px-4 py-2.5 text-xs font-mono tracking-wider transition-colors ${
                          on
                            ? "border-cyan-400 bg-cyan-500/10 text-cyan-400"
                            : "border-white/10 bg-black/50 text-text-dim hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" name="dataLocality" value={dataLocality} />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="inquiry-message"
                  className="text-xs font-bold text-text-dim uppercase tracking-widest"
                >
                  Message
                </Label>
                <Textarea
                  id="inquiry-message"
                  name="message"
                  rows={4}
                  defaultValue=""
                  className="w-full bg-black/50 border-white/10 rounded-xl px-4 py-3 text-white focus-visible:ring-primary transition-all resize-none"
                  placeholder="How can we help architect your future?"
                />
                {state.errors?.message && (
                  <p className="text-xs text-red-400">
                    {state.errors.message[0]}
                  </p>
                )}
              </div>
            </div>

            <Callout label="What happens next">
              We read every request against one question: does the data
              genuinely have to stay on-device? If yes, you&apos;ll hear from us
              with a scoping call. If a cloud vector store already fits,
              we&apos;ll tell you that too.
              <span className="font-mono mt-2 block text-[11px] text-text-dim/80">
                No sequence. No CRM drip. One reply.
              </span>
            </Callout>

            <input type="hidden" name="turnstileToken" value={turnstileToken} />
            <TurnstileWidget ref={turnstileRef} action="inquiry" onTokenChange={setTurnstileToken} />
            <SubmitButton verified={Boolean(turnstileToken)} />
            <p className="text-xs text-text-dim text-center">
              Prefer direct contact? Email{" "}
              <a
                href="mailto:partnerships@mlai-corp.com"
                className="text-cyan-400 hover:text-white transition-colors"
              >
                partnerships@mlai-corp.com
              </a>
              .
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

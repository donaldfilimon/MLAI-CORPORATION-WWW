import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
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
        message: data.message,
      }),
    });

    const result = await response.json();
    if (response.ok && result.ok) {
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending}
      type="submit"
      className="w-full py-6 flex items-center justify-center gap-3 text-md"
    >
      {pending ? "Checking..." : "Check Inquiry Details"}
      {!pending && <Send className="w-4 h-4" />}
    </Button>
  );
}

export const InquiryForm = ({ isOpen, onClose }: InquiryFormProps) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [state, formAction] = useActionState(submitInquiry, {
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
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
                <Label className="text-xs font-bold text-text-dim uppercase tracking-widest">
                  Focus Area
                </Label>
                <Select name="projectType" defaultValue="research">
                  <SelectTrigger className="bg-black/50 border-white/10 text-white h-12 rounded-xl">
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
                <Label className="text-xs font-bold text-text-dim uppercase tracking-widest">
                  Message
                </Label>
                <Textarea
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

            <SubmitButton />
            <p className="text-xs text-text-dim text-center">
              Prefer direct contact? Email{" "}
              <a
                href="mailto:partnerships@mlai-corp.com"
                className="text-indigo-400 hover:text-white transition-colors"
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

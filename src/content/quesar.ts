/** Quesar — private AI operations. Brand split 2026-09-02: this surface NEVER carries "Intelligence Without Limits". */
export const quesar = {
  tagline: "Private AI operations.",
  lede: "Only invited organization members can generate. Traffic crosses a metadata-only gateway — no payload logging, no user email to the provider — and becomes a KMS-wrapped audit you can consent to, export, or delete.",
  pillars: [
    {
      title: "Membership, not signup",
      body: "WorkOS organization membership is revalidated before every protected generation. There is no public account creation.",
    },
    {
      title: "A gateway that forgets",
      body: "Requests cross an authenticated, metadata-only gateway with payload logging and caching disabled per request. Account email never reaches the provider.",
    },
    {
      title: "An audit you own",
      body: "Each conversation is envelope-encrypted with a per-record AES-256-GCM key wrapped by Cloud KMS, retained 365 days, and readable, exportable, or deletable by you.",
    },
  ],
  trustBoundary: [
    {
      k: "Identity",
      v: "WorkOS AuthKit · org membership revalidated per generation",
    },
    {
      k: "Edge",
      v: "Cloudflare + Google external HTTPS LB · Cloud Armor allows Cloudflare ranges only",
    },
    {
      k: "Gateway",
      v: "Metadata-only · payload logging + caching disabled · no user email",
    },
    {
      k: "Audit",
      v: "AES-256-GCM per record · Cloud KMS wrapped · 365-day expiry",
    },
    {
      k: "Admin reads",
      v: "MFA + logged reason · requested/success/failure recorded",
    },
  ],
  consent: {
    title: "Before your first chat",
    version: "audit-policy v3 · 2026-08-24",
    points: [
      "Prompts and responses are processed by the configured model through an authenticated gateway. Providers still process the request under their own terms.",
      "Each conversation record is encrypted with a random per-record key wrapped by Cloud KMS and scheduled to expire after 365 days.",
      "You can read, export, or delete your live ciphertext at any time. Deletion from live storage can precede physical backup expiry.",
      "MFA-gated administrators may decrypt a record only with a stated reason; requested, successful, and failed access outcomes are logged.",
      "Withdrawing consent stops future chats. It does not retroactively erase records you have not deleted or processing already completed.",
    ],
  },
  /** Mocked audit records — shapes only. Ciphertext is never displayed decrypted in the viewer. */
  records: [
    {
      id: "aud_7f2c9a11",
      created: "2026-09-04T22:14:09Z",
      model: "gateway/metadata-only",
      turns: 6,
      bytes: 18_442,
      key: "kms:projects/…/cryptoKeys/quesar-audit/v3",
      expires: "2027-09-04",
      adminReads: 0,
      status: "live",
    },
    {
      id: "aud_5b81d0e4",
      created: "2026-09-02T15:40:51Z",
      model: "gateway/metadata-only",
      turns: 2,
      bytes: 4_120,
      key: "kms:projects/…/cryptoKeys/quesar-audit/v3",
      expires: "2027-09-02",
      adminReads: 1,
      status: "live",
    },
    {
      id: "aud_1a0e33c7",
      created: "2026-08-27T09:03:12Z",
      model: "gateway/metadata-only",
      turns: 14,
      bytes: 61_908,
      key: "kms:projects/…/cryptoKeys/quesar-audit/v2",
      expires: "2027-08-27",
      adminReads: 0,
      status: "live",
    },
  ],
  adminReadLog: [
    {
      record: "aud_5b81d0e4",
      at: "2026-09-03T11:20:00Z",
      outcome: "success",
      reason: "Support ticket #418 — user-requested export verification",
      actor: "mfa:admin-02",
    },
  ],
} as const;

export type QuesarRecord = (typeof quesar.records)[number];

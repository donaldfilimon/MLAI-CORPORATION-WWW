"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Download,
  KeyRound,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@mlai/ui";
import { quesar, type QuesarRecord } from "@/content/quesar";

/** Mock-only consent gate — labelled in UI. Not a production auth boundary. */
const CONSENT_KEY = "quesar.consent.v3";

/** /quesar — landing. Tagline is "Private AI operations." — never IWL. */
export function QuesarLanding() {
  return (
    <div className="public-container marketing-page quesar-page">
      <section className="marketing-hero">
        <div>
          <span className="eyeline wdbx">
            Quesar by MLAI · invite-only beta
          </span>
          <h1>{quesar.tagline}</h1>
          <p className="hero-description">{quesar.lede}</p>
          <div className="button-row">
            <Link className="button primary" href="/quesar/consent">
              Enter Quesar <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href="/contact">
              Request access
            </Link>
          </div>
        </div>
        <aside className="callout-card wdbx" aria-label="Private-ops scope">
          <strong>Private-ops only</strong>
          <p>
            Invite membership, metadata-only gateway, KMS-wrapped audit. This
            surface does not carry Abbey product naming.
          </p>
        </aside>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline wdbx">How it holds</span>
          <h2>Three controls, stated as implemented.</h2>
        </div>
        <div className="feature-grid three">
          {quesar.pillars.map((pillar) => (
            <article className="feature-card wdbx" key={pillar.title}>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abi">Trust boundary</span>
          <h2>What crosses, what doesn&apos;t.</h2>
        </div>
        <div className="formal-model-grid">
          <dl className="spec-list">
            {quesar.trustBoundary.map((row) => (
              <div key={row.k}>
                <dt>{row.k}</dt>
                <dd>{row.v}</dd>
              </div>
            ))}
          </dl>
          <aside className="callout-card abi">
            <strong>Not a certification</strong>
            <p>
              These are implemented controls, not a compliance claim. No
              third-party audit has been engaged; that status is stated, not
              implied.{" "}
              <Link className="text-link" href="/privacy">
                Privacy &amp; processing <ArrowRight size={14} />
              </Link>
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}

/** /quesar/consent — explicit consent before the first protected generation. */
export function QuesarConsent() {
  const [agreed, setAgreed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(() =>
    quesar.consent.points.map(() => false),
  );
  const all = checked.every(Boolean);

  useEffect(() => {
    setAgreed(localStorage.getItem(CONSENT_KEY) === "1");
    setHydrated(true);
  }, []);

  const withdraw = () => {
    localStorage.removeItem(CONSENT_KEY);
    setAgreed(false);
    setChecked(quesar.consent.points.map(() => false));
  };

  const agree = () => {
    localStorage.setItem(CONSENT_KEY, "1");
    setAgreed(true);
  };

  return (
    <div className="public-container marketing-page quesar-page quesar-narrow">
      <section className="marketing-hero quesar-hero-single">
        <div>
          <span className="eyeline wdbx">{quesar.consent.version}</span>
          <h1>{quesar.consent.title}</h1>
          <p className="hero-description">
            Protected generation requires explicit consent to the one-year
            encrypted-audit policy. Read each line; you agree to all or none.
          </p>
          <p className="quesar-mock-label">
            Mock · consent stored in localStorage (<code>{CONSENT_KEY}</code>) —
            not a production auth gate.
          </p>
        </div>
      </section>

      {hydrated && agreed ? (
        <aside className="callout-card abbey quesar-consent-status">
          <strong>Consent recorded</strong>
          <p className="quesar-consent-recorded">
            <Check size={16} aria-hidden="true" /> This browser agreed to{" "}
            {quesar.consent.version}.
            <Button
              variant="link"
              className="quesar-withdraw"
              onClick={withdraw}
            >
              Withdraw
            </Button>
          </p>
        </aside>
      ) : (
        <Card className="quesar-consent-card">
          <CardContent className="quesar-consent-points">
            {quesar.consent.points.map((point, index) => (
              <label key={point} className="quesar-consent-row">
                <input
                  type="checkbox"
                  checked={checked[index]}
                  disabled={!hydrated}
                  onChange={(event) =>
                    setChecked((prev) =>
                      prev.map((value, j) =>
                        j === index ? event.target.checked : value,
                      ),
                    )
                  }
                />
                <span>{point}</span>
              </label>
            ))}
            <div className="quesar-consent-actions">
              <p className="quesar-hint">
                Withdrawal is one click, any time, from the audit viewer.
              </p>
              <Button disabled={!hydrated || !all} onClick={agree}>
                <ShieldCheck size={16} aria-hidden="true" /> I agree — enable
                generation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="button-row quesar-followups">
        <Link className="button secondary" href="/quesar/audit">
          Open audit viewer
        </Link>
        <Link className="button secondary" href="/app">
          Console
        </Link>
      </div>
    </div>
  );
}

/** /quesar/audit — encrypted records: metadata, export, delete. Ciphertext never decrypts client-side. */
export function QuesarAudit() {
  const [records, setRecords] = useState<QuesarRecord[]>([...quesar.records]);
  const [tab, setTab] = useState<"records" | "admin">("records");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [exported, setExported] = useState<string | null>(null);

  const exportRecord = (id: string) => {
    const record = records.find((item) => item.id === id);
    if (!record) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            ...record,
            ciphertext: "<opaque — decrypt with your KMS-wrapped key>",
            mock: true,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${id}.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    setExported(id);
  };

  return (
    <div className="public-container marketing-page quesar-page">
      <section className="marketing-hero quesar-hero-single">
        <div>
          <span className="eyeline abi">Audit viewer · your records</span>
          <h1>Every conversation, sealed and yours.</h1>
          <p className="hero-description">
            Metadata is shown in the clear; payloads stay ciphertext. Export
            gives you the sealed record and its key reference. Delete removes
            live ciphertext now; backups age out on the production schedule.
          </p>
          <p className="quesar-mock-label">
            Mock · sample records from handoff shapes — not live KMS data.
          </p>
        </div>
      </section>

      <div className="quesar-tabs" role="tablist" aria-label="Audit views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "records"}
          className={tab === "records" ? "active" : undefined}
          onClick={() => setTab("records")}
        >
          Records{" "}
          <Badge variant="outline" className="quesar-count">
            {records.length}
          </Badge>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "admin"}
          className={tab === "admin" ? "active" : undefined}
          onClick={() => setTab("admin")}
        >
          Admin read log
        </button>
      </div>

      {tab === "records" ? (
        <div className="quesar-record-list" role="tabpanel">
          {records.length === 0 ? (
            <aside className="callout-card wdbx">
              <strong>Empty</strong>
              <p>
                No live records. Deleted ciphertext leaves backups on the
                production retention schedule.
              </p>
            </aside>
          ) : null}
          {records.map((record) => (
            <Card key={record.id} className="quesar-record-card">
              <CardHeader className="quesar-record-header">
                <div>
                  <CardTitle className="quesar-record-id">
                    {record.id}
                  </CardTitle>
                  <CardDescription>
                    {new Date(record.created).toLocaleString()} · {record.turns}{" "}
                    turns · {(record.bytes / 1024).toFixed(1)} KiB ciphertext ·
                    expires {record.expires}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="quesar-status">
                  {record.status}
                </Badge>
              </CardHeader>
              <CardContent className="quesar-record-body">
                <span className="quesar-key">
                  <KeyRound size={14} aria-hidden="true" /> {record.key} · admin
                  reads {record.adminReads}
                </span>
                <div className="quesar-record-actions">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportRecord(record.id)}
                  >
                    <Download size={16} aria-hidden="true" />{" "}
                    {exported === record.id ? "Exported" : "Export"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setPendingDelete(record.id)}
                  >
                    <Trash2 size={16} aria-hidden="true" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="quesar-admin-panel" role="tabpanel">
          <div className="quesar-admin-table" role="table">
            <div className="quesar-admin-head" role="row">
              <span role="columnheader">Record</span>
              <span role="columnheader">At</span>
              <span role="columnheader">Outcome</span>
              <span role="columnheader">Stated reason</span>
              <span role="columnheader">Actor</span>
            </div>
            {quesar.adminReadLog.map((entry) => (
              <div className="quesar-admin-row" role="row" key={entry.at}>
                <span role="cell" className="quesar-mono">
                  {entry.record}
                </span>
                <span role="cell" className="quesar-mono muted">
                  {new Date(entry.at).toLocaleString()}
                </span>
                <span role="cell" className="quesar-outcome">
                  {entry.outcome}
                </span>
                <span role="cell">{entry.reason}</span>
                <span role="cell" className="quesar-mono muted">
                  {entry.actor}
                </span>
              </div>
            ))}
          </div>
          <p className="quesar-hint">
            Requested, successful, and failed decryptions are all logged. An
            entry here is a fact about access, not about content.
          </p>
        </div>
      )}

      <Dialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {pendingDelete}?</DialogTitle>
            <DialogDescription>
              Removes the live ciphertext now. Encrypted backups age out on the
              production backup schedule, so physical expiry can lag. Provider
              processing already completed is not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Keep
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setRecords((prev) =>
                  prev.filter((item) => item.id !== pendingDelete),
                );
                setPendingDelete(null);
              }}
            >
              Delete live record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

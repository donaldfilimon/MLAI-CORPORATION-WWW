import { useMemo, useState } from "react";
import { CircleCheck, CircleAlert } from "lucide-react";

/**
 * Interactive 3-statement model — Income Statement, Balance Sheet, and Cash
 * Flow Statement integrated by live derivation, with a Base/Upside/Downside
 * scenario toggle, margin analysis, and credit metrics.
 *
 * ILLUSTRATIVE ONLY. The figures describe a fictional SaaS company ("Meridian
 * Analytics"), not MLAI Corporation. Nothing here is a financial claim about
 * MLAI — it is a demonstration of an integrated financial model rendered in the
 * browser, the same way the WDBX demo is a miniature, "not the engine itself".
 *
 * Formulas over hardcodes: only the historical anchor (FY2024A) and each
 * scenario's assumption drivers are constants. Every projected line — revenue,
 * COGS, working capital, PP&E and retained-earnings roll-forwards, the cash-flow
 * statement, margins, and credit ratios — is *derived*. Flipping the scenario
 * re-derives all three statements. Cash is the balancing plug taken from the
 * cash-flow statement, so Assets = Liabilities + Equity holds by construction.
 */

type Scenario = "base" | "upside" | "downside";

// Ramped drivers are 5-element paths (FY2025E..FY2029E) so margins/growth can
// evolve over the horizon; the rest are constant across the projection.
interface Drivers {
  revenueGrowth: number[]; // YoY, per year
  grossMargin: number[]; // gross profit / revenue, per year
  sm: number[]; // S&M as % of revenue, per year
  rd: number[]; // R&D as % of revenue, per year
  ga: number[]; // G&A as % of revenue, per year
  da: number; // D&A as % of revenue
  capex: number; // CapEx as % of revenue
  taxRate: number;
  interestRate: number; // on (flat) debt
  dso: number; // days sales outstanding -> AR
  dio: number; // days inventory outstanding -> Inventory
  dpo: number; // days payable outstanding -> AP
  accruedPctRev: number; // accrued liabilities as % of revenue
  dividendPayout: number; // dividends / net income
}

// Post-2017 U.S. federal limit: an NOL can offset at most 80% of taxable income.
const NOL_LIMIT = 0.8;

// Per-scenario assumption drivers. Hierarchy is intentional and holds per-year:
// Upside > Base > Downside for growth/margins; inverted for cost ratios.
const DRIVERS: Record<Scenario, Drivers> = {
  // Base — gentle margin expansion, steady growth. Profitable throughout.
  base: {
    revenueGrowth: [0.16, 0.17, 0.18, 0.18, 0.18],
    grossMargin: [0.65, 0.66, 0.66, 0.67, 0.67],
    sm: [0.25, 0.24, 0.24, 0.23, 0.23],
    rd: [0.15, 0.15, 0.15, 0.14, 0.14],
    ga: [0.1, 0.09, 0.09, 0.09, 0.09],
    da: 0.05, capex: 0.06, taxRate: 0.25, interestRate: 0.06,
    dso: 45, dio: 30, dpo: 35, accruedPctRev: 0.05, dividendPayout: 0,
  },
  // Upside — faster growth, stronger margin expansion. Profitable throughout.
  upside: {
    revenueGrowth: [0.22, 0.25, 0.27, 0.28, 0.28],
    grossMargin: [0.67, 0.68, 0.69, 0.7, 0.7],
    sm: [0.23, 0.22, 0.21, 0.2, 0.2],
    rd: [0.15, 0.14, 0.14, 0.13, 0.13],
    ga: [0.09, 0.08, 0.08, 0.08, 0.08],
    da: 0.05, capex: 0.07, taxRate: 0.25, interestRate: 0.06,
    dso: 40, dio: 28, dpo: 40, accruedPctRev: 0.05, dividendPayout: 0,
  },
  // Downside — a revenue dip + margin compression drives two early loss years
  // (FY2025E–FY2026E) that bank an NOL; the recovery years then utilize it.
  downside: {
    revenueGrowth: [-0.06, 0.02, 0.06, 0.09, 0.1],
    grossMargin: [0.56, 0.58, 0.6, 0.62, 0.63],
    sm: [0.3, 0.28, 0.26, 0.25, 0.24],
    rd: [0.17, 0.16, 0.15, 0.15, 0.15],
    ga: [0.13, 0.12, 0.11, 0.1, 0.1],
    da: 0.05, capex: 0.04, taxRate: 0.25, interestRate: 0.06,
    dso: 55, dio: 38, dpo: 28, accruedPctRev: 0.05, dividendPayout: 0,
  },
};

// Historical anchor (FY2024A, $ in millions). These are the only Income/Balance
// constants; AR/Inventory/AP/Accrued derive from the actual ratios below and
// cash is the balancing plug, so the opening balance sheet ties out on its own.
const HIST_ANCHOR = { revenue: 120, ppe: 50, debt: 40, commonStock: 30, retainedEarnings: 25 };
const HIST = {
  grossMargin: 0.65, sm: 0.25, rd: 0.15, ga: 0.1,
  da: 0.05, taxRate: 0.25, interestRate: 0.06,
  dso: 45, dio: 30, dpo: 35, accruedPctRev: 0.05,
};

const PERIODS = ["FY2024A", "FY2025E", "FY2026E", "FY2027E", "FY2028E", "FY2029E"];

interface Period {
  label: string;
  isActual: boolean;
  // Income statement
  revenue: number; cogs: number; grossProfit: number;
  sm: number; rd: number; ga: number; opex: number;
  ebitda: number; da: number; ebit: number;
  interest: number; ebt: number; tax: number; netIncome: number;
  // NOL / deferred-tax schedule
  nolBalance: number; dta: number; deferredTax: number | null;
  // Balance sheet
  cash: number; ar: number; inventory: number; ppe: number; totalAssets: number;
  ap: number; accrued: number; debt: number; totalLiabilities: number;
  commonStock: number; retainedEarnings: number; totalEquity: number;
  // Cash flow (null for the actual anchor — no prior period)
  cfo: number | null; cfi: number | null; cff: number | null;
  capex: number | null; dividends: number | null;
  beginningCash: number | null; netChangeCash: number | null;
}

function buildModel(scenario: Scenario): Period[] {
  const d = DRIVERS[scenario];
  const periods: Period[] = [];

  // ---- Historical anchor (FY2024A) ----
  const a = HIST_ANCHOR;
  const h0 = {} as Period;
  h0.label = PERIODS[0]!;
  h0.isActual = true;
  h0.revenue = a.revenue;
  h0.cogs = a.revenue * (1 - HIST.grossMargin);
  h0.grossProfit = h0.revenue - h0.cogs;
  h0.sm = a.revenue * HIST.sm;
  h0.rd = a.revenue * HIST.rd;
  h0.ga = a.revenue * HIST.ga;
  h0.opex = h0.sm + h0.rd + h0.ga;
  h0.ebitda = h0.grossProfit - h0.opex;
  h0.da = a.revenue * HIST.da;
  h0.ebit = h0.ebitda - h0.da;
  h0.interest = a.debt * HIST.interestRate;
  h0.ebt = h0.ebit - h0.interest;
  h0.tax = h0.ebt * HIST.taxRate; // anchor is profitable; no NOL
  h0.netIncome = h0.ebt - h0.tax;
  h0.nolBalance = 0;
  h0.dta = 0;
  h0.deferredTax = null;
  h0.ar = (HIST.dso / 365) * h0.revenue;
  h0.inventory = (HIST.dio / 365) * h0.cogs;
  h0.ppe = a.ppe;
  h0.ap = (HIST.dpo / 365) * h0.cogs;
  h0.accrued = HIST.accruedPctRev * h0.revenue;
  h0.debt = a.debt;
  h0.commonStock = a.commonStock;
  h0.retainedEarnings = a.retainedEarnings;
  h0.totalEquity = h0.commonStock + h0.retainedEarnings;
  h0.totalLiabilities = h0.ap + h0.accrued + h0.debt;
  // Cash is the plug that makes the opening balance sheet balance (DTA = 0 here).
  h0.cash = h0.totalLiabilities + h0.totalEquity - (h0.ar + h0.inventory + h0.ppe + h0.dta);
  h0.totalAssets = h0.cash + h0.ar + h0.inventory + h0.ppe + h0.dta;
  h0.cfo = h0.cfi = h0.cff = h0.capex = h0.dividends = null;
  h0.beginningCash = h0.netChangeCash = null;
  periods.push(h0);

  // ---- Projections (FY2025E .. FY2029E) ----
  let prior = h0;
  for (let i = 1; i < PERIODS.length; i++) {
    const y = i - 1; // index into the 5-element ramped-driver paths
    const p = {} as Period;
    p.label = PERIODS[i]!;
    p.isActual = false;

    // Income statement (ramped drivers vary by year)
    p.revenue = prior.revenue * (1 + d.revenueGrowth[y]!);
    p.cogs = p.revenue * (1 - d.grossMargin[y]!);
    p.grossProfit = p.revenue - p.cogs;
    p.sm = p.revenue * d.sm[y]!;
    p.rd = p.revenue * d.rd[y]!;
    p.ga = p.revenue * d.ga[y]!;
    p.opex = p.sm + p.rd + p.ga;
    p.ebitda = p.grossProfit - p.opex;
    p.da = p.revenue * d.da;
    p.ebit = p.ebitda - p.da;
    p.interest = prior.debt * d.interestRate; // debt held flat -> no circularity
    p.ebt = p.ebit - p.interest;

    // NOL / deferred-tax engine. Book tax = EBT × rate with full DTA
    // recognition (NI = EBT × (1 − rate) every year). A loss banks an NOL and a
    // matching DTA; a profit utilizes the NOL up to 80% of EBT. Cash tax falls
    // below book tax by the deferred portion, which is the CFO add-back below.
    const nolGenerated = p.ebt < 0 ? -p.ebt : 0;
    const nolUtilized = p.ebt > 0 ? Math.min(prior.nolBalance, NOL_LIMIT * p.ebt) : 0;
    p.nolBalance = prior.nolBalance + nolGenerated - nolUtilized;
    p.dta = p.nolBalance * d.taxRate;
    p.tax = p.ebt * d.taxRate; // book tax expense (negative = benefit in loss years)
    const currentTax = p.ebt > 0 ? (p.ebt - nolUtilized) * d.taxRate : 0;
    p.deferredTax = p.tax - currentTax; // non-cash portion (= −ΔDTA exactly)
    p.netIncome = p.ebt - p.tax;

    // Working capital (drives both the balance sheet and CFO deltas)
    p.ar = (d.dso / 365) * p.revenue;
    p.inventory = (d.dio / 365) * p.cogs;
    p.ap = (d.dpo / 365) * p.cogs;
    p.accrued = d.accruedPctRev * p.revenue;
    p.capex = p.revenue * d.capex;

    // Roll-forwards
    p.ppe = prior.ppe + p.capex - p.da; // PP&E: + CapEx − D&A
    p.debt = prior.debt; // flat
    p.commonStock = prior.commonStock;
    p.dividends = p.netIncome > 0 ? p.netIncome * d.dividendPayout : 0;
    p.retainedEarnings = prior.retainedEarnings + p.netIncome - p.dividends;

    // Cash flow statement. Deferred tax is a non-cash add-back: the +ΔDTA on the
    // asset side and the −ΔDTA carried by deferredTax here cancel, so the sheet
    // still balances by construction.
    p.cfo =
      p.netIncome + p.da + p.deferredTax
      - (p.ar - prior.ar) // ΔAR increase = use of cash
      - (p.inventory - prior.inventory)
      + (p.ap - prior.ap) // ΔAP increase = source of cash
      + (p.accrued - prior.accrued);
    p.cfi = -p.capex;
    p.cff = (p.debt - prior.debt) - p.dividends; // Δdebt (0) − dividends
    p.netChangeCash = p.cfo + p.cfi + p.cff;
    p.beginningCash = prior.cash;
    p.cash = p.beginningCash + p.netChangeCash; // ending cash feeds the BS

    // Balance sheet totals (DTA included in assets)
    p.totalEquity = p.commonStock + p.retainedEarnings;
    p.totalLiabilities = p.ap + p.accrued + p.debt;
    p.totalAssets = p.cash + p.ar + p.inventory + p.ppe + p.dta;

    periods.push(p);
    prior = p;
  }
  return periods;
}

// ---- Integrity checks (rendered live, must read ~0) ----
function balanceCheck(p: Period): number {
  return p.totalAssets - p.totalLiabilities - p.totalEquity;
}
function cashTieCheck(p: Period): number | null {
  // CF ending cash vs BS cash. Equal by construction; surfaced for honesty.
  if (p.netChangeCash === null || p.beginningCash === null) return null;
  return p.beginningCash + p.netChangeCash - p.cash;
}

// ---- Formatting ----
const money = (v: number) =>
  // Collapse negative zero and sub-rounding float dust to a clean 0.0.
  (Math.abs(v) < 0.05 ? 0 : v).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const mult = (v: number) => `${v.toFixed(1)}x`;

type RowKind = "money" | "pct" | "mult";
type RowStyle = "normal" | "subtotal" | "muted";

interface RowProps {
  label: string;
  periods: Period[];
  get: (p: Period) => number | null;
  kind?: RowKind;
  style?: RowStyle;
  indent?: boolean;
}

function fmt(v: number, kind: RowKind): string {
  if (kind === "pct") return pct(v);
  if (kind === "mult") return mult(v);
  return money(v);
}

function DataRow({ label, periods, get, kind = "money", style = "normal", indent }: RowProps) {
  const labelCls =
    style === "subtotal"
      ? "font-semibold text-white"
      : style === "muted"
        ? "text-text-dim/70"
        : "text-text-dim";
  const valCls = style === "subtotal" ? "font-semibold text-white" : "text-slate-200";
  return (
    <tr className={style === "subtotal" ? "border-t border-white/10" : undefined}>
      <th
        scope="row"
        className={`sticky left-0 z-10 bg-bg py-1.5 pr-4 text-left text-xs font-normal ${labelCls} ${indent ? "pl-6" : "pl-2"}`}
      >
        {label}
      </th>
      {periods.map((p) => {
        const v = get(p);
        return (
          <td
            key={p.label}
            className={`whitespace-nowrap px-3 py-1.5 text-right font-mono text-xs tabular-nums ${valCls} ${p.isActual ? "bg-cyan-500/[0.04]" : ""}`}
          >
            {v === null ? <span className="text-text-dim/40">—</span> : fmt(v, kind)}
          </td>
        );
      })}
    </tr>
  );
}

function SectionRow({ title, span }: { title: string; span: number }) {
  return (
    <tr>
      <td
        colSpan={span}
        className="sticky left-0 bg-cyan-500/10 px-2 py-1.5 text-left text-[11px] font-bold uppercase tracking-widest text-cyan-200"
      >
        {title}
      </td>
    </tr>
  );
}

const SCENARIOS: { id: Scenario; label: string }[] = [
  { id: "downside", label: "Downside" },
  { id: "base", label: "Base" },
  { id: "upside", label: "Upside" },
];

// The assumption drivers surfaced to the reader, in display order. These are
// the *inputs* — everything in the statements below is derived from them, so
// toggling the scenario shows exactly which knobs move.
const DRIVER_VIEW: { key: keyof Drivers; label: string; kind: "pct" | "days" }[] = [
  { key: "revenueGrowth", label: "Revenue growth", kind: "pct" },
  { key: "grossMargin", label: "Gross margin", kind: "pct" },
  { key: "sm", label: "S&M % rev", kind: "pct" },
  { key: "rd", label: "R&D % rev", kind: "pct" },
  { key: "ga", label: "G&A % rev", kind: "pct" },
  { key: "capex", label: "CapEx % rev", kind: "pct" },
  { key: "taxRate", label: "Tax rate", kind: "pct" },
  { key: "interestRate", label: "Interest rate", kind: "pct" },
  { key: "dso", label: "DSO (days)", kind: "days" },
  { key: "dio", label: "DIO (days)", kind: "days" },
  { key: "dpo", label: "DPO (days)", kind: "days" },
];

// A driver value is either a constant or a ramped path; ramps display Y1→Y5.
function driverDisplay(raw: number | number[], kind: "pct" | "days"): string {
  const one = (v: number) => (kind === "pct" ? pct(v) : `${v.toFixed(0)}d`);
  if (Array.isArray(raw)) {
    const first = raw[0]!;
    const lastV = raw[raw.length - 1]!;
    return first === lastV ? one(first) : `${one(first)}→${one(lastV)}`;
  }
  return one(raw);
}

export function ThreeStatementModelDemo() {
  const [scenario, setScenario] = useState<Scenario>("base");
  const periods = useMemo(() => buildModel(scenario), [scenario]);
  const drivers = DRIVERS[scenario];
  const cols = periods.length + 1;

  // Worst-case integrity across all visible periods (epsilon-tolerant).
  const maxImbalance = Math.max(...periods.map((p) => Math.abs(balanceCheck(p))));
  const balanced = maxImbalance < 1e-6;
  const last = periods[periods.length - 1]!;

  return (
    <div className="glass-card p-5 sm:p-6">
      {/* Header: title, illustrative disclaimer, scenario toggle */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              Integrated 3-statement model — live recalc
            </span>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
              Illustrative
            </span>
          </div>
          <p className="mt-1 max-w-xl text-xs text-text-dim">
            Sample figures for a fictional company (Meridian Analytics), $ in millions — not
            MLAI financials. Every projected line is derived from the scenario drivers; cash is
            the cash-flow plug, so the balance sheet ties out by construction.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Scenario"
          className="inline-flex shrink-0 rounded-xl border border-white/10 bg-black/30 p-1"
        >
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              role="radio"
              aria-checked={scenario === s.id}
              onClick={() => setScenario(s.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                scenario === s.id
                  ? "bg-cyan-500/20 text-cyan-200"
                  : "text-text-dim hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label={`${last.label} revenue`} value={`$${money(last.revenue)}M`} />
        <Kpi label="EBITDA margin" value={pct(last.ebitda / last.revenue)} />
        <Kpi label={`${last.label} net income`} value={`$${money(last.netIncome)}M`} />
        <Kpi
          label="Balance check"
          value={balanced ? "Balanced" : "Imbalanced"}
          tone={balanced ? "ok" : "bad"}
          icon={balanced ? <CircleCheck className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Scenario assumptions — the inputs everything below is derived from */}
      <div className="mb-5 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-cyan-200/80">
          Scenario drivers — inputs <span className="text-text-dim/50">(ramps shown Y1→Y5)</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4 lg:grid-cols-6">
          {DRIVER_VIEW.map((dv) => (
            <div key={dv.key} className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-text-dim/80">{dv.label}</span>
              <span className="font-mono text-xs font-semibold tabular-nums text-slate-200">
                {driverDisplay(drivers[dv.key], dv.kind)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Statement table */}
      <div className="-mx-5 overflow-x-auto sm:-mx-6">
        <table className="w-full min-w-[640px] border-collapse px-5 sm:px-6">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-bg px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-widest text-text-dim/60">
                $ millions
              </th>
              {periods.map((p) => (
                <th
                  key={p.label}
                  className={`whitespace-nowrap px-3 py-2 text-right text-xs font-bold ${p.isActual ? "text-cyan-200" : "text-white"}`}
                >
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Income statement */}
            <SectionRow title="Income Statement" span={cols} />
            <DataRow label="Revenue" periods={periods} get={(p) => p.revenue} />
            <DataRow label="Cost of revenue" periods={periods} get={(p) => -p.cogs} indent />
            <DataRow label="Gross profit" periods={periods} get={(p) => p.grossProfit} style="subtotal" />
            <DataRow label="Gross margin" periods={periods} get={(p) => p.grossProfit / p.revenue} kind="pct" style="muted" indent />
            <DataRow label="Sales & marketing" periods={periods} get={(p) => -p.sm} indent />
            <DataRow label="Research & development" periods={periods} get={(p) => -p.rd} indent />
            <DataRow label="General & administrative" periods={periods} get={(p) => -p.ga} indent />
            <DataRow label="EBITDA" periods={periods} get={(p) => p.ebitda} style="subtotal" />
            <DataRow label="EBITDA margin" periods={periods} get={(p) => p.ebitda / p.revenue} kind="pct" style="muted" indent />
            <DataRow label="Depreciation & amortization" periods={periods} get={(p) => -p.da} indent />
            <DataRow label="EBIT" periods={periods} get={(p) => p.ebit} style="subtotal" />
            <DataRow label="EBIT margin" periods={periods} get={(p) => p.ebit / p.revenue} kind="pct" style="muted" indent />
            <DataRow label="Interest expense" periods={periods} get={(p) => -p.interest} indent />
            <DataRow label="Pre-tax income (EBT)" periods={periods} get={(p) => p.ebt} style="subtotal" />
            <DataRow label="Income taxes" periods={periods} get={(p) => -p.tax} indent />
            <DataRow label="Net income" periods={periods} get={(p) => p.netIncome} style="subtotal" />
            <DataRow label="Net income margin" periods={periods} get={(p) => p.netIncome / p.revenue} kind="pct" style="muted" indent />

            {/* Balance sheet */}
            <SectionRow title="Balance Sheet" span={cols} />
            <DataRow label="Cash & equivalents" periods={periods} get={(p) => p.cash} indent />
            <DataRow label="Accounts receivable" periods={periods} get={(p) => p.ar} indent />
            <DataRow label="Inventory" periods={periods} get={(p) => p.inventory} indent />
            <DataRow label="PP&E, net" periods={periods} get={(p) => p.ppe} indent />
            <DataRow label="Deferred tax asset (NOL)" periods={periods} get={(p) => p.dta} indent />
            <DataRow label="Total assets" periods={periods} get={(p) => p.totalAssets} style="subtotal" />
            <DataRow label="Accounts payable" periods={periods} get={(p) => p.ap} indent />
            <DataRow label="Accrued liabilities" periods={periods} get={(p) => p.accrued} indent />
            <DataRow label="Debt" periods={periods} get={(p) => p.debt} indent />
            <DataRow label="Total liabilities" periods={periods} get={(p) => p.totalLiabilities} style="subtotal" />
            <DataRow label="Common stock & APIC" periods={periods} get={(p) => p.commonStock} indent />
            <DataRow label="Retained earnings" periods={periods} get={(p) => p.retainedEarnings} indent />
            <DataRow label="Total equity" periods={periods} get={(p) => p.totalEquity} style="subtotal" />
            <DataRow label="Check: Assets − Liab − Equity" periods={periods} get={balanceCheck} style="muted" indent />
            <DataRow label="Memo — NOL carryforward" periods={periods} get={(p) => p.nolBalance} style="muted" indent />

            {/* Cash flow */}
            <SectionRow title="Cash Flow Statement" span={cols} />
            <DataRow label="Net income" periods={periods} get={(p) => p.netIncome} indent />
            <DataRow label="(+) D&A" periods={periods} get={(p) => (p.isActual ? null : p.da)} indent />
            <DataRow label="(+) Deferred taxes" periods={periods} get={(p) => p.deferredTax} indent />
            <DataRow label="(−) Δ working capital" periods={periods} get={(p) => (p.cfo === null ? null : p.cfo - p.netIncome - p.da - (p.deferredTax ?? 0))} indent />
            <DataRow label="Cash from operations" periods={periods} get={(p) => p.cfo} style="subtotal" />
            <DataRow label="(−) CapEx" periods={periods} get={(p) => (p.capex === null ? null : -p.capex)} indent />
            <DataRow label="Cash from investing" periods={periods} get={(p) => p.cfi} style="subtotal" />
            <DataRow label="(−) Dividends" periods={periods} get={(p) => (p.dividends === null ? null : -p.dividends)} indent />
            <DataRow label="Cash from financing" periods={periods} get={(p) => p.cff} style="subtotal" />
            <DataRow label="Net change in cash" periods={periods} get={(p) => p.netChangeCash} />
            <DataRow label="Beginning cash" periods={periods} get={(p) => p.beginningCash} indent />
            <DataRow label="Ending cash" periods={periods} get={(p) => (p.netChangeCash === null ? null : p.cash)} style="subtotal" />
            <DataRow label="Check: CF cash − BS cash" periods={periods} get={cashTieCheck} style="muted" indent />

            {/* Credit metrics */}
            <SectionRow title="Credit & Liquidity Metrics" span={cols} />
            <DataRow label="Debt / EBITDA" periods={periods} get={(p) => p.debt / p.ebitda} kind="mult" indent />
            <DataRow label="Net debt / EBITDA" periods={periods} get={(p) => (p.debt - p.cash) / p.ebitda} kind="mult" indent />
            <DataRow label="EBITDA / interest (coverage)" periods={periods} get={(p) => p.ebitda / p.interest} kind="mult" indent />
            <DataRow label="Debt / total capital" periods={periods} get={(p) => p.debt / (p.debt + p.totalEquity)} kind="pct" indent />
            <DataRow label="Debt / equity" periods={periods} get={(p) => p.debt / p.totalEquity} kind="mult" indent />
            <DataRow label="Current ratio" periods={periods} get={(p) => (p.cash + p.ar + p.inventory) / (p.ap + p.accrued)} kind="mult" indent />
            <DataRow label="Quick ratio" periods={periods} get={(p) => (p.cash + p.ar) / (p.ap + p.accrued)} kind="mult" indent />
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-mono text-[11px] text-text-dim/70">
        Δassets = NI + Δpayables + Δaccrued + Δdebt − dividends = Δliabilities + Δequity
        &nbsp;→&nbsp; balance = 0 every period. Loss years bank an NOL + deferred-tax asset
        (post-2017 80% cap); the deferred-tax add-back keeps cash tied.
      </p>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "ok" | "bad";
  icon?: React.ReactNode;
}) {
  const toneCls =
    tone === "ok" ? "text-emerald-300" : tone === "bad" ? "text-red-300" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-widest text-text-dim/70">{label}</div>
      <div className={`mt-0.5 flex items-center gap-1.5 text-lg font-bold tabular-nums ${toneCls}`}>
        {icon}
        {value}
      </div>
    </div>
  );
}

import { ThreeStatementModelDemo } from "@/components/demos/ThreeStatementModelDemo";
import { PageHeader } from "@/components/PageHeader";

export const FinancialModel = () => {
  return (
    <section
      id="financial-model"
      className="min-h-screen section-y bg-bg relative font-sans"
      aria-labelledby="financial-model-heading"
    >
      <div className="container-custom pt-10">
        <PageHeader
          id="financial-model-heading"
          tag="INTERACTIVE TOOL"
          title="The model recalculates itself."
          subtitle="An integrated three-statement model — Income Statement, Balance Sheet, and Cash Flow — wired together in the browser. Flip the scenario and every projected line re-derives from the assumption drivers; cash is the cash-flow plug, so Assets = Liabilities + Equity holds in every case. The figures are illustrative sample data for a fictional company, not MLAI's financials."
        />

        <ThreeStatementModelDemo />
      </div>
    </section>
  );
};

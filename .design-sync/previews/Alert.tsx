import { Alert, AlertTitle, AlertDescription } from "mlai-corporation-www";

const Info = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
);

export const Default = () => (
  <Alert>
    <Info />
    <AlertTitle>Context pack ready</AlertTitle>
    <AlertDescription>ABI assembled 8 evidence blocks from the WDBX store for this query.</AlertDescription>
  </Alert>
);

export const Success = () => (
  <Alert variant="success">
    <Info />
    <AlertTitle>Store persisted</AlertTitle>
    <AlertDescription>1,204 vectors flushed to JSONL. Chain hash verified.</AlertDescription>
  </Alert>
);

export const Warning = () => (
  <Alert variant="warning">
    <Info />
    <AlertTitle>Sparse evidence</AlertTitle>
    <AlertDescription>SEA found fewer than 3 durable records above the relevance threshold.</AlertDescription>
  </Alert>
);

export const Destructive = () => (
  <Alert variant="destructive">
    <Info />
    <AlertTitle>Embedding failed</AlertTitle>
    <AlertDescription>The model endpoint returned no vector for the last record.</AlertDescription>
  </Alert>
);

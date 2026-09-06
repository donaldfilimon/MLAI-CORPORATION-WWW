import {
  Folder,
  MessagesSquare,
  FileText,
  Workflow,
  Database,
  Layers,
  ArrowRight,
  Upload,
  ScanText,
  Search,
  MessageCircle,
  Quote,
  Code2,
} from "lucide-react";
export function ArchitectureDiagram() {
  return (
    <div
      className="architecture-diagram"
      aria-label="Abbey assistant, ABI runtime, WDBX memory, connected to explicitly selected models"
    >
      {[
        {
          name: "Abbey",
          kind: "abbey",
          description: "Assistant workspace",
          items: [
            [Folder, "Projects"],
            [MessagesSquare, "Conversations"],
            [FileText, "Documents"],
          ],
        },
        {
          name: "ABI",
          kind: "abi",
          description: "Runtime and orchestration",
          items: [
            [Workflow, "Planner"],
            [Code2, "Model execution"],
            [Layers, "Tools & connectors"],
          ],
        },
        {
          name: "WDBX",
          kind: "wdbx",
          description: "Memory and retrieval",
          items: [
            [Database, "Vector index"],
            [FileText, "Source records"],
            [Layers, "Provenance"],
          ],
        },
      ].map((row) => (
        <div className={`architecture-layer ${row.kind}`} key={row.name}>
          <div className="layer-name">
            <strong>{row.name}</strong>
            <span>{row.description}</span>
          </div>
          <div className="layer-items">
            {row.items.map(([Icon, label]) => {
              const Element = Icon as typeof Folder;
              return (
                <div key={String(label)}>
                  <Element size={24} />
                  <span>{String(label)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="model-boundary">
        Local models <span>·</span> Explicit hosted connections
      </div>
    </div>
  );
}
export function DocumentFlow() {
  return (
    <ol className="document-flow">
      {[
        [Upload, "Upload"],
        [ScanText, "Interpret"],
        [Database, "Index"],
        [Search, "Retrieve"],
        [MessageCircle, "Answer"],
        [Quote, "Inspect sources"],
      ].map(([Icon, label], i) => {
        const Element = Icon as typeof Upload;
        return (
          <li key={String(label)}>
            <span className="flow-number">{i + 1}</span>
            <Element size={26} />
            <span>{String(label)}</span>
            {i < 5 && <ArrowRight className="flow-arrow" size={14} />}
          </li>
        );
      })}
    </ol>
  );
}

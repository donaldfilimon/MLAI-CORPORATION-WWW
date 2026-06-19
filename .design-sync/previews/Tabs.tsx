import { Tabs, TabsList, TabsTrigger, TabsContent } from "mlai-corporation-www";

export const Default = () => (
  <div style={{ maxWidth: 420 }}>
    <Tabs defaultValue="wdbx">
      <TabsList>
        <TabsTrigger value="wdbx">WDBX</TabsTrigger>
        <TabsTrigger value="abi">ABI</TabsTrigger>
        <TabsTrigger value="abbey">Abbey</TabsTrigger>
      </TabsList>
      <TabsContent value="wdbx" style={{ paddingTop: 12, fontSize: 13, opacity: 0.85 }}>
        Durable vector / block memory store with JSONL persistence.
      </TabsContent>
      <TabsContent value="abi" style={{ paddingTop: 12, fontSize: 13, opacity: 0.85 }}>
        Query planning and context-pack orchestration runtime.
      </TabsContent>
      <TabsContent value="abbey" style={{ paddingTop: 12, fontSize: 13, opacity: 0.85 }}>
        CLI-facing agent and persona layer.
      </TabsContent>
    </Tabs>
  </div>
);

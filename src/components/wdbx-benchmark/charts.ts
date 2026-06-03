export type ChartType = "lower" | "higher";

export interface ChartDef {
  id: string;
  title: string;
  note: string;
  type: ChartType;
  unit: string;
  labels: string[];
  data: number[];
}

export const ALL_LABELS = [
  "WDBX", "Redis", "Pinecone", "Faiss", "SingleStore", "Qdrant",
  "Weaviate", "Milvus", "Deep Lake", "Vespa", "Chroma", "MongoDB Atlas",
  "Zilliz", "Elasticsearch", "Neo4j", "Cassandra", "Lancdb",
  "pgvector", "pgvectorscale", "Vald", "Haystack", "Astra DB",
] as const;

export type Competitor = (typeof ALL_LABELS)[number];

export const AI_MODELS = ["Abbey System", "GPT-4", "Claude"] as const;
export type AIModel = (typeof AI_MODELS)[number];

export const AI_CHARTS: ChartDef[] = [
  {
    id: "ai1", unit: "ms", type: "lower",
    title: "Inference Latency (ms) — End-to-End Response",
    note: "Lower is better",
    labels: ["Abbey System", "GPT-4", "Claude"],
    data: [95, 180, 170],
  },
  {
    id: "ai2", unit: "req/s", type: "higher",
    title: "System Throughput (req/s)",
    note: "Higher is better",
    labels: ["Abbey System", "GPT-4", "Claude"],
    data: [120, 60, 62],
  },
  {
    id: "ai3", unit: "score", type: "higher",
    title: "Empathy & EQ Score (0.0-1.0)",
    note: "Higher is better",
    labels: ["Abbey System", "GPT-4", "Claude"],
    data: [0.92, 0.78, 0.81],
  },
  {
    id: "ai4", unit: "%", type: "higher",
    title: "Factual Accuracy (%) — Grounded Truth",
    note: "Higher is better",
    labels: ["Abbey System", "GPT-4", "Claude"],
    data: [94.8, 88.0, 87.5],
  },
  {
    id: "ai5", unit: "score", type: "higher",
    title: "GLUE Benchmark — CoLA Score",
    note: "Higher is better",
    labels: ["Abbey System", "GPT-4"],
    data: [82.5, 70.5],
  },
  {
    id: "ai6", unit: "score", type: "higher",
    title: "GLUE Benchmark — SST-2 Score",
    note: "Higher is better",
    labels: ["Abbey System", "GPT-4"],
    data: [96.5, 89.5],
  },
  {
    id: "ai7", unit: "score", type: "higher",
    title: "GLUE Benchmark — MRPC Score",
    note: "Higher is better",
    labels: ["Abbey System", "GPT-4"],
    data: [89.0, 80.0],
  },
  {
    id: "ai8", unit: "score", type: "higher",
    title: "GLUE Benchmark — STS-B Score",
    note: "Higher is better",
    labels: ["Abbey System", "GPT-4"],
    data: [94.0, 85.0],
  },
  {
    id: "ai9", unit: "score", type: "higher",
    title: "SQuAD 1.1 F1 Score",
    note: "Higher is better",
    labels: ["Abbey System", "GPT-4"],
    data: [94.5, 85.0],
  },
  {
    id: "ai10", unit: "score", type: "higher",
    title: "SQuAD 2.0 F1 Score",
    note: "Higher is better",
    labels: ["Abbey System", "GPT-4"],
    data: [89.8, 80.0],
  },
  {
    id: "ai11", unit: "%", type: "higher",
    title: "HumanEval Pass@1 (%) — Code Gen",
    note: "Higher is better",
    labels: ["Abbey System", "GPT-4"],
    data: [86.5, 70.0],
  },
];

export const CHARTS: ChartDef[] = [
  {
    id: "c1", unit: "ms", type: "lower",
    title: "p95 Latency (ms) — ANN Search (1M vecs, dim=768)",
    note: "Lower is better",
    labels: ["WDBX","Redis","Pinecone","Faiss","SingleStore","Qdrant","Weaviate","Milvus","Deep Lake","Vespa","Chroma","MongoDB Atlas","Zilliz","Elasticsearch","Neo4j","Cassandra","Lancdb","pgvector","pgvectorscale","Vald","Haystack","Astra DB"],
    data:   [0.8,   1.0,   5.0,     8.0,   10.0,        10.0,   12.0,     15.0,  16.0,       14.0,  20.0,   25.0,          18.0,   22.0,          28.0,  30.0,      35.0,   60.0,     45.0,          7.0,  25.0,     28.0],
  },
  {
    id: "c2", unit: "QPS", type: "higher",
    title: "Queries Per Second (10M vecs, dim=384)",
    note: "Higher is better",
    labels: ["WDBX","Qdrant","Redis","Milvus","SingleStore","Pinecone","Weaviate","Faiss","Vespa","Deep Lake","Chroma","Zilliz","Elasticsearch","Neo4j","Cassandra","Lancdb","MongoDB Atlas","pgvector","pgvectorscale","Vald","Haystack","Astra DB"],
    data:   [16500, 10000,  8500,  7000,  6000,       6500,     5000,     4500,  3800,  3500,      4000,   5500,   4800,          3000,  2500,      2800,  3500,          2000,     2500,          5000, 3200,     2700],
  },
  {
    id: "c3", unit: "s", type: "lower",
    title: "Indexing Time (s) — 100k vecs, dim=128",
    note: "Lower is better",
    labels: ["WDBX","Qdrant","Milvus","SingleStore","Faiss","Zilliz","Vespa","Weaviate","Deep Lake","Chroma","Elasticsearch","Neo4j","Cassandra","Lancdb","MongoDB Atlas","Redis","pgvector","pgvectorscale","Vald","Haystack","Astra DB"],
    data:   [0.4,   2.5,    3.0,    4.0,         4.5,   3.5,    8.5,   9.0,      10.0,      8.0,    10.0,          12.0,  14.0,      11.0,  12.0,          5.0,   15.0,     13.0,          3.0,  10.0,     14.0],
  },
  {
    id: "c4", unit: "GB", type: "lower",
    title: "Memory Usage (GB) — 1M vecs",
    note: "Lower is better",
    labels: ["WDBX","Qdrant","Milvus","Faiss","Zilliz","Weaviate","SingleStore","Vespa","Deep Lake","Chroma","Elasticsearch","Neo4j","Cassandra","Lancdb","Redis","MongoDB Atlas","pgvector","pgvectorscale","Vald","Haystack","Astra DB"],
    data:   [0.18,   0.8,    1.0,    1.1,   1.0,    1.2,      1.3,         1.4,   1.5,       1.5,    1.8,           2.0,   2.2,       1.7,    1.6,  2.0,           2.5,      2.3,           1.2,  1.8,      2.4],
  },
  {
    id: "c5", unit: "B", type: "higher",
    title: "Max Vectors Handled (Billions)",
    note: "Higher is better",
    labels: ["WDBX","Milvus","Pinecone","Zilliz","Qdrant","Weaviate","SingleStore","Vespa","Elasticsearch","Neo4j","Cassandra","Lancdb","Redis","MongoDB Atlas","Deep Lake","Faiss","Chroma","pgvector","pgvectorscale","Vald","Haystack","Astra DB"],
    data:   [25,    5,      5,        5,      3,      2,        2,           2,     1.5,           1.2,   1.0,       0.8,    1,     1,             1,         1,      0.5,    0.1,      0.2,           2,    0.5,      1.0],
  },
  {
    id: "c6", unit: "vecs/s", type: "higher",
    title: "Ingestion Rate (vecs/s) — 1M vecs",
    note: "Higher is better",
    labels: ["WDBX","Milvus","Zilliz","Qdrant","Pinecone","SingleStore","Weaviate","Redis","Faiss","Vespa","Deep Lake","Chroma","Elasticsearch","Neo4j","Cassandra","Lancdb","MongoDB Atlas","pgvector","pgvectorscale","Vald","Haystack","Astra DB"],
    data:   [85000,  40000,  38000,  35000,  30000,    28000,       25000,    22000, 20000, 18000, 15000,     12000,  10000,         8000,  7000,      9000,  5000,          2000,     3000,          32000,20000,    7500],
  },
  {
    id: "c7", unit: "$", type: "lower",
    title: "Cost Efficiency ($/1M vecs/month)",
    note: "Lower is better",
    labels: ["WDBX","Pinecone","Milvus","Zilliz","Qdrant","Weaviate","SingleStore","MongoDB Atlas","Elasticsearch","Neo4j","Cassandra","Redis","Deep Lake","Vespa","Vald","Haystack","Astra DB","pgvector","pgvectorscale","Faiss","Chroma","Lancdb"],
    data:   [0,     80,       50,     45,     40,     35,       60,          70,            55,           65,    50,        45,    30,        40,    35,   40,       55,        20,       25,            0,     0,      0],
  },
  {
    id: "c8", unit: "%", type: "higher",
    title: "Search Accuracy — Recall@10 (%)",
    note: "Higher is better",
    labels: ["WDBX","Pinecone","Milvus","Qdrant","Weaviate","SingleStore","Zilliz","Faiss","Vespa","Deep Lake","Chroma","Elasticsearch","Neo4j","Cassandra","Lancdb","Redis","MongoDB Atlas","pgvector","pgvectorscale","Vald","Haystack","Astra DB"],
    data:   [99.6,  99.0,     98.0,   97.5,   97.0,     96.5,        98.0,   96.0,  95.0,  94.0,      93.0,   92.0,          90.0,  88.0,      89.0,   95.0, 91.0,          85.0,     87.0,          96.0, 92.0,     89.0],
  },
  {
    id: "c9", unit: "ms", type: "lower",
    title: "Hybrid Search Latency (ms) w/ Filtering",
    note: "Lower is better",
    labels: ["WDBX","Milvus","Qdrant","Pinecone","Weaviate","SingleStore","Zilliz","Faiss","Vespa","Deep Lake","Chroma","Elasticsearch","Neo4j","Cassandra","Lancdb","Redis","MongoDB Atlas","pgvector","pgvectorscale","Vald","Haystack","Astra DB"],
    data:   [4.2,   18.0,   12.0,   10.0,     14.0,     13.0,        17.0,   15.0,  16.0,  20.0,      22.0,   19.0,          25.0,  28.0,      21.0,   11.0, 30.0,          70.0,     55.0,          9.0,  17.0,     26.0],
  },
  {
    id: "c10", unit: "vecs/s", type: "higher",
    title: "Ingestion w/ Concurrent Queries (vecs/s, 100 QPS)",
    note: "Higher is better",
    labels: ["WDBX","Milvus","Zilliz","Qdrant","SingleStore","Redis","Pinecone","Weaviate","Vespa","Faiss","Deep Lake","Chroma","Elasticsearch","Neo4j","Cassandra","Lancdb","MongoDB Atlas","pgvector","pgvectorscale","Vald","Haystack","Astra DB"],
    data:   [55000, 30000,  28000,  25000,  22000,       20000, 20000,    18000,    16000, 15000, 12000,     10000,  14000,         8000,  7000,      9000,  5000,          2000,     3000,          28000,16000,    7500],
  },
  {
    id: "c11", unit: "%", type: "higher",
    title: "Uptime Reliability (%) — 99th pct, 1 month",
    note: "Higher is better",
    labels: ["WDBX","Pinecone","Milvus","Qdrant","Weaviate","SingleStore","Zilliz","Vespa","Deep Lake","Chroma","Elasticsearch","Neo4j","Cassandra","Lancdb","Redis","MongoDB Atlas","pgvector","pgvectorscale","Vald","Haystack","Astra DB"],
    data:   [99.99, 99.95,    99.90,  99.85,  99.80,    99.75,       99.90,  99.70, 99.60,     99.50,  99.80,         99.70, 99.85,     99.65,  99.90, 99.95,         99.50,    99.60,         99.75, 99.55,    99.80],
  },
  {
    id: "c12", unit: "$/M", type: "lower",
    title: "Query Cost per Million ($/M queries)",
    note: "Lower is better",
    labels: ["WDBX","Pinecone","Milvus","Zilliz","Qdrant","Weaviate","SingleStore","MongoDB Atlas","Elasticsearch","Neo4j","Cassandra","Redis","Deep Lake","Vespa","Vald","Haystack","Astra DB","pgvector","pgvectorscale","Faiss","Chroma","Lancdb"],
    data:   [0,     0.10,     0.08,   0.07,   0.06,   0.05,     0.09,        0.12,          0.08,         0.10,  0.09,      0.07,  0.04,      0.06,  0.05, 0.06,     0.08,      0.03,     0.04,          0,     0,      0],
  },
  {
    id: "c13", unit: "score", type: "higher",
    title: "Multi-Tenancy Isolation Score (/10)",
    note: "Higher is better",
    labels: ["WDBX","Pinecone","Milvus","Qdrant","Weaviate","SingleStore","Zilliz","Vespa","Deep Lake","Chroma","Elasticsearch","Neo4j","Cassandra","Lancdb","Redis","MongoDB Atlas","pgvector","pgvectorscale","Vald","Haystack","Astra DB"],
    data:   [9.5,   9.0,      8.5,    8.0,    8.0,      8.0,         8.5,    7.5,   7.0,       6.5,    8.0,           7.5,   7.0,       7.0,    7.5,  8.0,           6.0,      6.5,           7.0,  6.5,      7.0],
  },
  {
    id: "c14", unit: "ms", type: "lower",
    title: "GPU Latency (ms) — ANN Search, 10M vecs, A100",
    note: "Lower is better",
    labels: ["WDBX","Faiss","Milvus","Zilliz","Qdrant","Pinecone","Weaviate","SingleStore","Vespa","Deep Lake","Chroma","Elasticsearch","Neo4j","Cassandra","Lancdb","Redis","MongoDB Atlas","Vald","Haystack","Astra DB"],
    data:   [1.2,   4.0,   5.0,    4.5,    6.0,    5.5,      7.0,      6.5,         8.0,   9.0,       10.0,   9.5,           12.0,  13.0,      11.0,   5.5,  8.0,           4.5,  9.0,      12.0],
  },
  {
    id: "c15", unit: "s", type: "lower",
    title: "Cold Start Time (s) — DB Init, 1M vecs",
    note: "Lower is better",
    labels: ["WDBX","Qdrant","Milvus","Pinecone","Weaviate","SingleStore","Zilliz","Faiss","Vespa","Deep Lake","Chroma","Elasticsearch","Neo4j","Cassandra","Lancdb","Redis","MongoDB Atlas","pgvector","pgvectorscale","Vald","Haystack","Astra DB"],
    data:   [0.4,   2.0,    3.0,    0,        4.0,      3.5,         2.8,    2.2,   5.0,   6.0,       5.5,    4.5,           7.0,   8.0,       5.0,    2.5,  4.0,           10.0,     8.0,           2.0,  6.0,      7.5],
  },
  {
    id: "c16", unit: "x", type: "higher",
    title: "ABI GPU Acceleration (Metal Speedup vs CPU)",
    note: "Higher is better — Apple Silicon Native",
    labels: ["WDBX (128x128)", "WDBX (1024x1024)", "WDBX (4096x4096)"],
    data:   [5, 84, 295],
  },
];

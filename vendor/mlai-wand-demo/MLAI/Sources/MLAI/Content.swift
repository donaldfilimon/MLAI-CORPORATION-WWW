/// Prose only. No new numbers. Metrics render through Stat.

public enum Copy {
    public static let thesisLead = "Most AI runs in someone else's cloud. MLAI is built on the opposite premise: inference, index, and data on the same chip."

    public static let origin = "We built one model to answer them all. It buckled under the weight of everything. So we built three — Abbey to understand you, Aviva the truth unfiltered, Abi to hold them in balance. On WDBX. Private by default. Yours alone. This is MLAI."

    public static let privacy = "Privacy stops being a policy you have to trust and becomes a property of where the computation physically runs."

    public static let apple = Tokens.appleFrameworks

    public enum WDBX {
        public static let lead = "A query enters at the top, greedily walks toward its nearest neighbor, drops a layer, and repeats. The result is logarithmic search. This structure is HNSW."
        public static let persist = "Persistence is memory-mapped. Cold start is an mmap, not a hydrate. The write-ahead log is hash-chained so the audit trail is tamper-evident without taxing search latency."
        public static let quant = "Product and scalar quantization cut the resident set. The same index still answers from local metal when the device has a GPU."
        public static let naming = "Body copy leaves the acronym as WDBX. Two expansions exist in source materials. Neither is canonical here."
    }

    public enum ABI {
        public static let lead = "ABI is the compute layer. Tensors, Metal kernels, and zero-copy unified-memory pipelines live here so WDBX never ships vectors across a network to do math."
        public static let gpu = "Measured speedups sit on small and mid-size matmuls and a 10-layer net. The 4096×4096 figure is a benchmark-track objective, tagged a target — not a measured result."
        public static let zig = "Hot paths are Zig 0.17-dev. No GC, SIMD as a language primitive, one numeric lowering from @Vector onto AVX-512 or NEON."
    }

    public enum Abbey {
        public static let lead = "Abbey is the assistant layer. Three personas share one core and one local memory: Abbey the empathic polymath, Aviva the unfiltered expert, Abi the router."
        public static let memory = "Conversation memory is a vector store, not a prompt stuffed with recap. WDBX holds it on device."
        public static let backtrack = "Interaction blocks are hash-chained at the WAL. When a session drifts, the chain is walked backward to the divergence and the session is rewound. Integrity lives in the log, not the index."
        public static let platforms = "Discord is shipping. The Swift 6 / Vapor 4 / DiscordBM port is in progress. A Python and Twitch surface is in progress."
    }

    public enum Platform {
        public static let lead = "Four layers wrap orchestration so autonomy is inspectable: trace, control, evaluation, and a private runtime you can take offline."
    }

    public enum Architecture {
        public static let lead = "The inference, the index, and the data live on the same chip. Everything else is the engineering that makes that true without giving up speed, scale, or correctness."
    }

    public enum Company {
        public static let lead = "Machine Learning Advanced Innovations, Inc. is a Delaware C-Corp in Orlando. The work is private-by-default infrastructure, not a cloud wrapper."
    }

    public enum Investors {
        public static let lead = "The bet is privacy-first AI infrastructure purpose-built for Apple Silicon unified memory. Forward ARR and unit-economics figures on this page are targets."
        public static let why = "Hardware is ready. Regulation is expensive. Cloud inference is a cost curve enterprises are already leaving. Those are conditions, not promises."
    }

    public enum Research {
        public static let lead = "Retrieval is scored, not hoped. Similarity, recency, causal hop, and source authority multiply. The audit hash chains the log, not the graph."
    }

    public enum Services {
        public static let lead = "Engagement is engineering time, not a portal. Open-core first. Pro and Enterprise when a team needs a contract and a runtime they can inspect."
    }

    public enum Contact {
        public static let lead = "Mail goes to engineers. Say what you are trying to run locally and where it currently leaves the device."
    }
}

import { useState, useCallback, useMemo, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart } from "./BarChart";
import { Sparkline } from "./Sparkline";
import {
  CHARTS,
  AI_CHARTS,
  ALL_LABELS,
  AI_MODELS,
  type ChartDef,
} from "./charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import "./benchmarks.css";

const WDBX_COLOR = "#10b981";
const COMP_COLOR = "#64748b";

type ChartEntry = {
  label: string;
  value: number;
};

function chartEntries(chart: ChartDef): ChartEntry[] {
  return chart.labels.flatMap((label, index) => {
    const value = chart.data[index];
    return value === undefined ? [] : [{ label, value }];
  });
}

function sortChartEntries(chart: ChartDef): ChartEntry[] {
  return chartEntries(chart).sort((a, b) =>
    chart.type === "higher" ? b.value - a.value : a.value - b.value,
  );
}

// ── Helper: Normalized Scores ─────────────────────────────────────────────
function computeScores(
  charts: ChartDef[],
  labels: readonly string[],
): Record<string, number[]> {
  const scores: Record<string, number[]> = {};
  for (const lbl of labels) scores[lbl] = [];

  for (const chart of charts) {
    const data = chart.data;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    chart.labels.forEach((lbl, i) => {
      const v = data[i];
      if (v === undefined) return;

      const norm =
        chart.type === "higher" ? (v - min) / range : (max - v) / range;
      if (scores[lbl]) {
        scores[lbl].push(isFinite(norm) ? norm : 0.5);
      }
    });
  }
  return scores;
}

// ── Stats Bar ─────────────────────────────────────────────────────────────
const StatsBar = memo(({ activeTab }: { activeTab: "wdbx" | "ai" }) => {
  const stats = useMemo(() => {
    if (activeTab === "wdbx") {
      const wdbxWins = CHARTS.reduce((count, chart) => {
        const sorted = sortChartEntries(chart);
        return sorted[0]?.label === "WDBX" ? count + 1 : count;
      }, 0);

      return [
        { label: "Overall Score", value: "99%", sub: "Composite" },
        { label: "Category Wins", value: `${wdbxWins}/15`, sub: "First place" },
        { label: "p95 Latency", value: "0.8ms", sub: "ANN Search" },
        { label: "Peak QPS", value: "16.5k", sub: "10M vectors" },
        { label: "Databases", value: "22", sub: "Compared" },
      ];
    } else {
      const abbeyWins = AI_CHARTS.reduce((count, chart) => {
        const sorted = sortChartEntries(chart);
        return sorted[0]?.label === "Abbey System" ? count + 1 : count;
      }, 0);

      return [
        { label: "Model Leader", value: "Abbey", sub: "Multi-Profile" },
        { label: "Benchmark Wins", value: `${abbeyWins}/11`, sub: "Top Tier" },
        { label: "Throughput", value: "120", sub: "req/s" },
        { label: "SQuAD 1.1", value: "94.5", sub: "F1 Score" },
        { label: "Empathy", value: "0.92", sub: "EQ Score" },
      ];
    }
  }, [activeTab]);

  return (
    <div className="stats-bar-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="stats-grid"
        >
          {stats.map((s, i) => (
            <div key={`${activeTab}-stat-${i}`} className="stat-item">
              <span className="stat-val">{s.value}</span>
              <span className="stat-lbl">{s.label}</span>
              <span className="stat-sub">{s.sub}</span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

// ── Chart Card ────────────────────────────────────────────────────────────
const ChartCard = memo(
  ({
    chart,
    visible,
    isAi,
  }: {
    chart: ChartDef;
    visible: Set<string>;
    isAi: boolean;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { labels, values } = useMemo(() => {
      const l: string[] = [];
      const v: number[] = [];
      chartEntries(chart).forEach(({ label, value }) => {
        if (visible.has(label)) {
          l.push(label);
          v.push(value);
        }
      });
      return { labels: l, values: v };
    }, [chart, visible]);

    const download = useCallback(() => {
      if (!canvasRef.current) return;
      const a = document.createElement("a");
      a.href = canvasRef.current.toDataURL("image/png");
      a.download = `${chart.id}.png`;
      a.click();
    }, [chart.id]);

    const targetName = isAi ? "Abbey System" : "WDBX";
    const rank = useMemo(() => {
      const sorted = sortChartEntries(chart);
      const idx = sorted.findIndex((x) => x.label === targetName);
      return idx === -1 ? "-" : idx + 1;
    }, [chart, targetName]);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
      >
        <Card variant="glass" className="h-full border-white/10">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl font-display flex items-center gap-2">
                {chart.title}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-text-dim cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{chart.note}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>{chart.unit}</CardDescription>
            </div>
            <Badge
              variant={rank === 1 ? "default" : "outline"}
              className={cn(
                "text-lg px-3 py-1",
                rank === 1
                  ? "bg-amber-500 text-black border-none"
                  : "text-text-dim border-white/20",
              )}
            >
              #{rank}
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <BarChart ref={canvasRef} labels={labels} values={values} />
          </CardContent>
          <CardFooter className="flex justify-between items-center bg-transparent border-t border-white/5 mt-2">
            <span className="text-xs text-text-dim font-mono uppercase tracking-wider">
              Metrics validated
            </span>
            <Button variant="outline" size="sm" onClick={download}>
              Export PNG
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  },
);

// ── Sidebar ───────────────────────────────────────────────────────────────
const Sidebar = memo(
  ({
    activeTab,
    visible,
    toggle,
    showAll,
    showOnly,
    sparkScores,
    searchQuery,
    setSearchQuery,
  }: {
    activeTab: "wdbx" | "ai";
    visible: Set<string>;
    toggle: (lbl: string) => void;
    showAll: () => void;
    showOnly: () => void;
    sparkScores: Record<string, number[]>;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
  }) => {
    const isAi = activeTab === "ai";
    const labels = isAi ? AI_MODELS : ALL_LABELS;
    const heroName = isAi ? "Abbey System" : "WDBX";

    return (
      <aside className="sidebar space-y-6">
        <Card variant="glass" className="border-white/5">
          <CardHeader>
            <CardTitle>Scope</CardTitle>
            <CardDescription>
              {isAi
                ? "Multi-Profile AI Framework benchmarks comparing Abbey against GPT-4 and Claude across NLP tasks and qualitative metrics."
                : "Performance analytics for WDBX — a Zig-native vector database engine optimized for edge and high-throughput systems."}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card variant="glass" className="border-white/5">
          <CardHeader>
            <CardTitle>Filter {isAi ? "Models" : "Competitors"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/40 border-white/10"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="xs"
                className="flex-1"
                onClick={showAll}
              >
                All
              </Button>
              <Button
                variant="secondary"
                size="xs"
                className="flex-1"
                onClick={showOnly}
              >
                {heroName}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {labels
                .filter((l) =>
                  l.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((lbl) => (
                  <Badge
                    key={`badge-${lbl}`}
                    variant={visible.has(lbl) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all",
                      visible.has(lbl)
                        ? "bg-primary"
                        : "text-text-dim border-white/10 hover:border-white/30",
                    )}
                    onClick={() => toggle(lbl)}
                  >
                    {lbl}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="border-white/5">
          <CardHeader>
            <CardTitle>Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {labels.map((lbl) => {
                const isHero = lbl === heroName;
                const scores = sparkScores[lbl] || [];
                return (
                  <div
                    key={`spark-${lbl}`}
                    className={cn(
                      "flex flex-col gap-1 cursor-pointer transition-opacity",
                      visible.has(lbl) ? "opacity-100" : "opacity-30",
                    )}
                    onClick={() => toggle(lbl)}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                      <span
                        className={cn(
                          isHero ? "text-primary font-bold" : "text-text-dim",
                        )}
                      >
                        {lbl}
                      </span>
                      <span className="text-text-dim/50">Norm. Score</span>
                    </div>
                    <Sparkline
                      scores={scores}
                      color={isHero ? WDBX_COLOR : COMP_COLOR}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </aside>
    );
  },
);

// ── Root Dashboard ────────────────────────────────────────────────────────
export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"wdbx" | "ai">("wdbx");
  const [wdbxVisible, setWdbxVisible] = useState<Set<string>>(
    () => new Set(ALL_LABELS),
  );
  const [aiVisible, setAiVisible] = useState<Set<string>>(
    () => new Set(AI_MODELS),
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Compute spark scores on the fly or memoize
  const wdbxSparkScores = useMemo(() => computeScores(CHARTS, ALL_LABELS), []);
  const aiSparkScores = useMemo(() => computeScores(AI_CHARTS, AI_MODELS), []);

  const toggleLabel = useCallback(
    (lbl: string) => {
      const setter = activeTab === "ai" ? setAiVisible : setWdbxVisible;
      setter((prev) => {
        const next = new Set(prev);
        next.has(lbl) ? next.delete(lbl) : next.add(lbl);
        return next;
      });
    },
    [activeTab],
  );

  const isAi = activeTab === "ai";
  const currentVisible = isAi ? aiVisible : wdbxVisible;
  const currentCharts = isAi ? AI_CHARTS : CHARTS;
  const currentSparkScores = isAi ? aiSparkScores : wdbxSparkScores;

  return (
    <div className="shell">
      <main className="main">
        <Sidebar
          activeTab={activeTab}
          visible={currentVisible}
          toggle={toggleLabel}
          showAll={() =>
            isAi
              ? setAiVisible(new Set(AI_MODELS))
              : setWdbxVisible(new Set(ALL_LABELS))
          }
          showOnly={() =>
            isAi
              ? setAiVisible(new Set(["Abbey System"]))
              : setWdbxVisible(new Set(["WDBX"]))
          }
          sparkScores={currentSparkScores}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="content-area">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "wdbx" | "ai")}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-8">
              <TabsList className="bg-surface/50 border border-white/10 p-1">
                <TabsTrigger value="wdbx" className="px-6">
                  WDBX Vector Database
                </TabsTrigger>
                <TabsTrigger value="ai" className="px-6">
                  Abbey AI Framework
                </TabsTrigger>
              </TabsList>

              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                onClick={() => {
                  const csv =
                    "Metric,Model,Value\n" +
                    currentCharts
                      .flatMap((chart) =>
                        chartEntries(chart).map(
                          ({ label, value }) =>
                            `${chart.title},${label},${value}`,
                        ),
                      )
                      .join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `wdbx_benchmarks_${activeTab}.csv`;
                  a.click();
                }}
              >
                Export CSV
              </Button>
            </div>

            <StatsBar activeTab={activeTab} />

            <div className="charts-grid mt-8">
              <AnimatePresence mode="popLayout">
                {currentCharts.map((chart) => (
                  <ChartCard
                    key={`${activeTab}-${chart.id}`}
                    chart={chart}
                    visible={currentVisible}
                    isAi={isAi}
                  />
                ))}
              </AnimatePresence>
            </div>
          </Tabs>

          <footer className="footer">
            © {new Date().getFullYear()} MLAI Corporation · Precision Vector
            Engineering
          </footer>
        </div>
      </main>
    </div>
  );
}

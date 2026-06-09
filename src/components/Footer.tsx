import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Logo } from "./Logo";
import { useUI } from "@/lib/ui-context";

export const Footer = () => {
  const { openInquiry } = useUI();
  return (
    <footer className="pt-20 pb-12 bg-bg border-t border-white/5 relative noise-overlay">
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="space-y-6">
            <Logo size="sm" />
            <p className="text-sm text-text-dim leading-relaxed">
              Leading the transition to high-integrity, resilient AI
              orchestration frameworks. Based in Palo Alto, California.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/mlai_corp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-dim hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                aria-label="Twitter"
              >
                <span className="text-xs font-bold" aria-hidden="true">
                  X
                </span>
              </a>
              <a
                href="https://linkedin.com/company/mlai-corp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-dim hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                aria-label="LinkedIn"
              >
                <span className="text-xs font-bold" aria-hidden="true">
                  in
                </span>
              </a>
              <a
                href="https://github.com/mlai-corp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-dim hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                aria-label="GitHub"
              >
                <span className="text-[10px] font-bold" aria-hidden="true">
                  GH
                </span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-white mb-6 text-sm uppercase tracking-wider">
              Research
            </h4>
            <ul className="space-y-3 text-sm text-text-dim">
              <li>
                <Link
                  to="/research"
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1 group"
                >
                  WDBX Engine{" "}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/research"
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1 group"
                >
                  Multi-Persona Framework{" "}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/benchmarks"
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1 group"
                >
                  WDBX Benchmarks{" "}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/research"
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1 group"
                >
                  Publications{" "}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white mb-6 text-sm uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-3 text-sm text-text-dim">
              <li>
                <Link
                  to="/docs"
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1 group"
                >
                  Documentation{" "}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1 group"
                >
                  Lab Notes{" "}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/console"
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1 group"
                >
                  Console{" "}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white mb-6 text-sm uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-text-dim">
              <li>
                <Link
                  to="/about"
                  className="hover:text-indigo-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/team"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Leadership
                </Link>
              </li>
              <li>
                <button
                  onClick={openInquiry}
                  className="hover:text-indigo-400 transition-colors text-left w-full cursor-pointer"
                >
                  Careers
                </button>
              </li>
              <li>
                <button
                  onClick={openInquiry}
                  className="hover:text-indigo-400 transition-colors text-left w-full cursor-pointer"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={openInquiry}
                  className="hover:text-indigo-400 transition-colors text-left w-full cursor-pointer"
                >
                  Press Kit
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white mb-6 text-sm uppercase tracking-wider">
              Stay in the loop
            </h4>
            <p className="text-sm text-text-dim mb-4">
              For release notes, benchmarks, and research updates, send an
              inquiry with &ldquo;updates&rdquo; in your message and we&apos;ll
              keep you posted.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={openInquiry}
              className="h-11 rounded-xl"
            >
              Request Updates
            </Button>
          </div>
        </div>

        <Separator className="bg-white/10 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-mono text-text-dim/60 uppercase tracking-widest">
            © {new Date().getFullYear()} MLAI CORPORATION. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            <Link
              to="/privacy"
              className="text-[10px] font-mono text-text-dim/60 uppercase tracking-widest hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-[10px] font-mono text-text-dim/60 uppercase tracking-widest hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/security"
              className="text-[10px] font-mono text-text-dim/60 uppercase tracking-widest hover:text-white transition-colors"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

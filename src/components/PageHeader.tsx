import { m, useReducedMotion } from "framer-motion";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  tag?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
  id?: string;
}

export const PageHeader = ({
  tag,
  title,
  subtitle,
  className,
  align = "left",
  id,
}: PageHeaderProps) => {
  const shouldReduceMotion = useReducedMotion();
  const tagMotionProps = shouldReduceMotion
    ? { initial: false }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      };
  const titleMotionProps = shouldReduceMotion
    ? { initial: false }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: 0.1 },
      };
  const subtitleMotionProps = shouldReduceMotion
    ? { initial: false }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: 0.2 },
      };

  return (
    <div
      className={cn(
        "space-y-6 mb-16",
        align === "center"
          ? "text-center flex flex-col items-center"
          : "text-left",
        className,
      )}
    >
      {tag && (
        <m.div {...tagMotionProps}>
          <Badge
            variant="outline"
            className="bg-primary/5 text-primary border-primary/20 px-4 py-1 uppercase tracking-widest text-[10px] font-bold"
          >
            {tag}
          </Badge>
        </m.div>
      )}

      <m.h1
        id={id}
        className="section-title mb-0"
        {...titleMotionProps}
      >
        {title}
      </m.h1>

      {subtitle && (
        <m.p
          className="section-subtitle mb-0"
          {...subtitleMotionProps}
        >
          {subtitle}
        </m.p>
      )}
    </div>
  );
};

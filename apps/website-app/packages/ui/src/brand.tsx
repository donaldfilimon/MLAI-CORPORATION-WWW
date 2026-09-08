import { Anchor, type LinkComponent } from "./link.js";
export interface BrandProps {
  href?: string;
  label?: string;
  /** Source for the brand mark. Applications serve their own copy of the asset. */
  mark?: string;
  Link?: LinkComponent;
}
export function Brand({
  href = "/",
  label = "MLAI home",
  mark = "/brand/mlai-mark.svg",
  Link = Anchor,
}: BrandProps) {
  return (
    <Link href={href} className="brand" aria-label={label}>
      <img src={mark} alt="" width="34" height="34" />
      <span>MLAI</span>
    </Link>
  );
}

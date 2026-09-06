import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="MLAI home">
      <img src="/brand/mlai-mark.svg" alt="" width="34" height="34" />
      <span>MLAI</span>
    </Link>
  );
}

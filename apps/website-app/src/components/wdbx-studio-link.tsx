import { ArrowUpRight, Network } from "lucide-react";
import styles from "./wdbx-studio-link.module.css";

export function WdbxStudioLink() {
  return (
    <section className={styles.panel} aria-labelledby="wdbx-studio-title">
      <div className={styles.description}>
        <p className={styles.eyebrow}>
          <Network size={16} aria-hidden="true" />
          WDBX / Specimen Studio
        </p>
        <h2 id="wdbx-studio-title">Explore an inspectable specimen.</h2>
        <p>
          Open the published Studio to explore its topology, execution trace,
          results, and provenance inspector.
        </p>
        <p className={styles.storage}>
          Studio saves its work in this browser on its own site. Storage is
          specific to that browser and site origin. Your workspace data,
          credentials, and bound gateway connections stay in this console;
          opening Studio does not connect it to your gateway.
        </p>
      </div>
      <a
        className={`button secondary ${styles.action}`}
        href="https://wdbx-specimen-studio.underswitch.chatgpt.site"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Specimen Studio
        <ArrowUpRight size={18} aria-hidden="true" />
        <span className={styles.newTab}>Opens in a new tab</span>
      </a>
    </section>
  );
}

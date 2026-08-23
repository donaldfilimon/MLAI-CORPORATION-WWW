import { CinematicShell } from "@/components/CinematicShell";
import { Mega } from "@/mega/Mega";

export function ShowcaseMega() {
  return (
    <CinematicShell background="#030408">
      <div id="video-root" className="absolute inset-0">
        <Mega />
      </div>
    </CinematicShell>
  );
}

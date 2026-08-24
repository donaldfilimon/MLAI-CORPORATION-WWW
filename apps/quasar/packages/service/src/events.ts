import type { GenerationEvent } from "@quasar/shared";

export class JobEvents {
  events: GenerationEvent[] = [];
  private subscribers: Set<(ev: GenerationEvent) => void> = new Set();

  emit(ev: GenerationEvent): void {
    this.events.push(ev);
    for (const cb of this.subscribers) cb(ev);
  }

  since(cursor: number): { events: GenerationEvent[]; next: number } {
    return { events: this.events.slice(cursor), next: this.events.length };
  }

  subscribe(cb: (ev: GenerationEvent) => void): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }
}

export class EventBus {
  private jobs: Map<string, JobEvents> = new Map();

  get(siteId: string): JobEvents {
    let job = this.jobs.get(siteId);
    if (!job) {
      job = new JobEvents();
      this.jobs.set(siteId, job);
    }
    return job;
  }

  reset(siteId: string): void {
    const job = this.jobs.get(siteId);
    if (job) job.events.length = 0;
  }
}

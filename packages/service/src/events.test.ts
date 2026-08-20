import { test, expect } from "bun:test";
import type { GenerationEvent } from "@quasar/shared";
import { JobEvents, EventBus } from "./events";

function textEvent(text: string): GenerationEvent {
  return { type: "text", text };
}

test("emit buffers events in order", () => {
  const job = new JobEvents();
  job.emit(textEvent("one"));
  job.emit(textEvent("two"));
  expect(job.events).toEqual([textEvent("one"), textEvent("two")]);
});

test("since(0) returns all buffered events and next equals count", () => {
  const job = new JobEvents();
  job.emit(textEvent("one"));
  job.emit(textEvent("two"));
  const result = job.since(0);
  expect(result.events).toEqual([textEvent("one"), textEvent("two")]);
  expect(result.next).toBe(2);
});

test("since(next) after catching up returns empty", () => {
  const job = new JobEvents();
  job.emit(textEvent("one"));
  const first = job.since(0);
  const second = job.since(first.next);
  expect(second.events).toEqual([]);
  expect(second.next).toBe(first.next);
});

test("subscribe receives subsequent emits; unsubscribe stops delivery", () => {
  const job = new JobEvents();
  const received: GenerationEvent[] = [];
  const unsubscribe = job.subscribe((ev) => received.push(ev));

  job.emit(textEvent("one"));
  expect(received).toEqual([textEvent("one")]);

  unsubscribe();
  job.emit(textEvent("two"));
  expect(received).toEqual([textEvent("one")]);
  expect(job.events).toEqual([textEvent("one"), textEvent("two")]);
});

test("EventBus.get returns the same JobEvents instance for a given siteId", () => {
  const bus = new EventBus();
  const a = bus.get("site-1");
  const b = bus.get("site-1");
  expect(a).toBe(b);
});

test("EventBus.get returns distinct JobEvents per siteId", () => {
  const bus = new EventBus();
  const a = bus.get("site-1");
  const b = bus.get("site-2");
  expect(a).not.toBe(b);
});

test("EventBus.reset clears the buffer in place, preserving the same JobEvents instance", () => {
  const bus = new EventBus();
  const job = bus.get("site-1");
  job.emit(textEvent("one"));
  expect(job.events.length).toBe(1);

  bus.reset("site-1");
  // Same instance is returned (live subscribers on `job` keep working).
  expect(bus.get("site-1")).toBe(job);
  // And the buffer held by that same instance is cleared in place.
  expect(job.events).toEqual([]);
});

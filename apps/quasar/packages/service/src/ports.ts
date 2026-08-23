export function allocatePort(taken: Array<number | null>, base = 4710): number {
  const takenPorts = taken.filter((p): p is number => p !== null);
  let p = base;
  while (takenPorts.includes(p)) p++;
  return p;
}

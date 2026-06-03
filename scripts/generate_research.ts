const publications = [
  { tag: "CORE ARCHITECTURE", title: "Adaptive Backtrace Pruning", date: "JANUARY 2025" },
  { tag: "ETHICS & SAFETY", title: "Automated Jailbreak Detection", date: "FEBRUARY 2025" },
  { tag: "SCALABILITY", title: "Cross-Device Inference", date: "MARCH 2025" },
];

const newPubs = [];
for (let i = 0; i < 20; i++) {
  const pub = publications[i % 3];
  newPubs.push({
    tag: pub.tag,
    title: pub.title + " v" + (i + 1),
    date: pub.date,
    abstract: "A detailed analysis of " + pub.title + " v" + (i + 1) + ", exploring advanced optimization techniques for high-performance AI deployment."
  });
}
console.log(JSON.stringify(newPubs, null, 2));

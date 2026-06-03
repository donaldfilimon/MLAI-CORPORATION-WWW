const generateContent = (baseTitle: string, count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    tag: ["ENGINEERING", "RESEARCH", "SAFETY", "SCALABILITY"][i % 4],
    title: `${baseTitle} ${i + 1}: ${["Optimization", "Scaling", "Alignment", "Architecture"][i % 4]} Techniques`,
    excerpt: "An in-depth exploration into the methodologies and technical challenges faced while implementing ${baseTitle.toLowerCase()} ${i + 1}. We discuss architectural decisions, performance benchmarks, and real-world results obtained from our test environments.",
    date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
    readTime: `${5 + (i % 5)} min read`
  }));
};

const blogPosts = generateContent("Next-Gen Agent", 50);
const researchPubs = generateContent("Backtrace Protocol", 50);

console.log(JSON.stringify({ blogPosts, researchPubs }, null, 2));

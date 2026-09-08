// All research links remain available without JavaScript.
(() => {
  const form = document.querySelector(".preview-discovery");
  if (!form) return;
  const cards = Array.from(document.querySelectorAll("[data-research-item]"));
  const fields = ["q", "topic", "type"];
  const field = (key) => form.elements.namedItem(key);
  let legacyTag = "";
  function apply(mode) {
    const params = new URLSearchParams(location.search);
    const values = Object.fromEntries(
      fields.map((key) => [key, field(key).value]),
    );
    const words = values.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const card of cards) {
      card.hidden =
        (legacyTag !== "" && card.dataset.publicationTag !== legacyTag) ||
        (values.topic !== "" &&
          !card.dataset.topics.split(" ").includes(values.topic)) ||
        (values.type !== "" && card.dataset.type !== values.type) ||
        !words.every((word) => card.textContent.toLowerCase().includes(word));
      if (!card.hidden) shown++;
    }
    const filtered = Boolean(values.topic || values.type || legacyTag);
    const tagLabel = document.getElementById("legacy-tag-filter");
    tagLabel.hidden = !legacyTag;
    tagLabel.textContent = legacyTag ? `Active tag filter: ${legacyTag}` : "";
    document.getElementById("publication-status").textContent = shown
      ? `${shown} research documents shown.`
      : words.length && filtered
        ? "No research matches your search and filters."
        : words.length
          ? "No research matches your search."
          : "No research matches these filters.";
    document.getElementById("clear-search").hidden = !values.q;
    document.getElementById("reset-filters").hidden = !filtered;
    document.getElementById("clear-all").hidden =
      shown > 0 || !words.length || !filtered;
    if (mode) {
      for (const key of fields)
        values[key] ? params.set(key, values[key]) : params.delete(key);
      params.delete("track");
      legacyTag ? params.set("tag", legacyTag) : params.delete("tag");
      const url = `${location.pathname}${params.size ? "?" + params : ""}${location.hash}`;
      if (url !== `${location.pathname}${location.search}${location.hash}`)
        history[mode === "push" ? "pushState" : "replaceState"](null, "", url);
    }
  }
  function restore() {
    const params = new URLSearchParams(location.search);
    for (const key of fields) {
      const input = field(key);
      const value =
        params.get(key) ?? (key === "topic" ? params.get("track") : "") ?? "";
      if (key !== "q") {
        for (const option of Array.from(input.options))
          if (option.dataset.unknown) option.remove();
        if (
          value &&
          !Array.from(input.options).some((option) => option.value === value)
        ) {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = `Unknown filter: ${value}`;
          option.dataset.unknown = "true";
          input.append(option);
        }
      }
      input.value = value;
    }
    legacyTag = params.get("tag") === "All" ? "" : params.get("tag") || "";
    apply();
  }
  form.addEventListener("input", (event) => {
    if (event.target === field("q")) apply("replace");
  });
  form.addEventListener("change", (event) => {
    if (event.target !== field("q")) apply("push");
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    apply("push");
  });
  for (const id of ["clear-search", "reset-filters", "clear-all"]) {
    document.getElementById(id).addEventListener("click", () => {
      if (id !== "reset-filters") field("q").value = "";
      if (id !== "clear-search") {
        field("topic").value = "";
        field("type").value = "";
        legacyTag = "";
      }
      apply("push");
      field("q").focus();
    });
  }
  window.addEventListener("popstate", restore);
  restore();
})();

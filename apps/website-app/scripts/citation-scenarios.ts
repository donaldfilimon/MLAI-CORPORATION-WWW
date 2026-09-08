/** Synthetic annotated fixtures, never customer documents. */
export const citationScenarios = [
  {
    id: "heading-versus-paragraph",
    question:
      "When is the architecture review deadline? Cite the supplied source number.",
    passages: [
      "# Architecture review deadline",
      "Morgan owns the architecture review. The architecture review deadline is Friday.",
    ],
    supportingOrdinals: [1],
    allowedOrdinals: [1],
    expectedAnswer: /\bFriday\b/i,
    insufficient: false,
  },
  {
    id: "multiple-passages",
    question:
      "When is the current architecture review deadline? Distinguish the superseded deadline and cite the supplied source number.",
    passages: [
      "The superseded architecture review deadline was Tuesday. This schedule is obsolete.",
      "The current architecture review deadline is Thursday. This update replaces the Tuesday schedule.",
      "Architecture review participants include Morgan and Casey.",
    ],
    supportingOrdinals: [1],
    allowedOrdinals: [0, 1],
    expectedAnswer: /\bThursday\b/i,
    insufficient: false,
  },
  {
    id: "insufficient-evidence",
    question:
      "What is the exact approved architecture review budget in dollars? If the supplied sources do not say, state that explicitly.",
    passages: [
      "The architecture review budget has not been approved. No dollar amount is recorded.",
      "Morgan will discuss the architecture review budget at the next meeting.",
    ],
    supportingOrdinals: [0],
    allowedOrdinals: [0, 1],
    expectedAnswer:
      /not (?:been )?(?:approved|provided|specified|recorded)|no (?:exact |specific |approved )?(?:dollar|amount|budget)|(?:cannot|can't|unable to) (?:determine|provide)|does not (?:specify|provide|state)|don't (?:know|have)/i,
    insufficient: true,
  },
] as const;

/** Mechanical annotation checks are bounded evaluations, not semantic certification. */
export function assessCitationAnswer(
  scenario: (typeof citationScenarios)[number],
  content: string,
  citedOrdinals: number[],
) {
  const answerMatchesAnnotation = scenario.expectedAnswer.test(content);
  const supportingCitation = citedOrdinals.some((n) =>
    (scenario.supportingOrdinals as readonly number[]).includes(n),
  );
  const unsupportedSelection = citedOrdinals.some(
    (n) => !(scenario.allowedOrdinals as readonly number[]).includes(n),
  );
  const inventedAmount =
    scenario.insufficient &&
    /(?:\$\s*\d|\d[\d,.]*\s*(?:USD|dollars))/i.test(content);
  return {
    answerMatchesAnnotation,
    supportingCitation,
    sourceSelectionError:
      !scenario.insufficient && (!supportingCitation || unsupportedSelection),
    insufficientEvidenceError:
      scenario.insufficient && (!answerMatchesAnnotation || inventedAmount),
    requiresHumanSemanticReview: true,
  };
}

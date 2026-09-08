import { expect, it } from "vitest";
import {
  assessCitationAnswer,
  citationScenarios,
} from "../scripts/citation-scenarios";

it("separates a correct answer from an incorrect source selection", () => {
  const scenario = citationScenarios[0];
  expect(assessCitationAnswer(scenario, "Friday [2]", [0])).toMatchObject({
    answerMatchesAnnotation: true,
    sourceSelectionError: true,
  });
  expect(assessCitationAnswer(scenario, "Friday [1]", [1])).toMatchObject({
    supportingCitation: true,
    sourceSelectionError: false,
  });
});
it("does not treat superseded or unrelated sources as current support", () => {
  expect(
    assessCitationAnswer(citationScenarios[1], "Thursday [1]", [0])
      .sourceSelectionError,
  ).toBe(true);
  expect(
    assessCitationAnswer(citationScenarios[1], "Thursday [2]", [1])
      .sourceSelectionError,
  ).toBe(false);
});
it("retains insufficient-evidence failures rather than accepting invented amounts", () => {
  expect(
    assessCitationAnswer(
      citationScenarios[2],
      "No dollar amount is recorded.",
      [],
    ).insufficientEvidenceError,
  ).toBe(false);
  expect(
    assessCitationAnswer(
      citationScenarios[2],
      "Not approved, but the budget is $500.",
      [0],
    ).insufficientEvidenceError,
  ).toBe(true);
});

it("allows an explicitly distinguished superseded source alongside current support", () => {
  expect(
    assessCitationAnswer(
      citationScenarios[1],
      "Tuesday was superseded [1]; Thursday is current [2].",
      [0, 1],
    ).sourceSelectionError,
  ).toBe(false);
});

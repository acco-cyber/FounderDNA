import { describe, expect, it } from "vitest";
import { assessmentQuestions, emptyProfile, opportunities } from "../data/mockData";
import { matchOpportunity, scoreAssessment } from "./scoring";

describe("Founder DNA scoring", () => {
  it("returns bounded scores for a complete answer set", () => {
    const answers = Object.fromEntries(
      assessmentQuestions.map((question) => [question.id, question.options[0].id]),
    );
    const scores = scoreAssessment(assessmentQuestions, answers);

    Object.values(scores).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(38);
      expect(score).toBeLessThanOrEqual(95);
    });
  });

  it("returns a usable match confidence", () => {
    const match = matchOpportunity(
      {
        ...emptyProfile,
        scores: {
          painPointProximity: 92,
          executionVelocity: 81,
          resourcefulness: 88,
          networkLeverage: 64,
          riskCalibration: 76,
          localMarketFluency: 85,
        },
      },
      opportunities[0],
    );
    expect(match).toBeGreaterThanOrEqual(58);
    expect(match).toBeLessThanOrEqual(96);
  });
});

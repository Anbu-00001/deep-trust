import { describe, expect, it } from "vitest";
import { applyAssessmentPolicy } from "../../supabase/functions/_shared/assessment-policy";

describe("unvalidated visual review policy", () => {
  it("does not certify an AI image given an unsupported 92 authenticity score", () => {
    const result = applyAssessmentPolicy({ trustScore: 92, verdict: "Likely authentic photograph", uncertaintyFlag: false });
    expect(result.authenticityProbability).toBeNull();
    expect(result.originStatus).toBe("indeterminate");
    expect(result.uncertaintyFlag).toBe(true);
  });

  it("does not turn a low model score into a confirmed fake", () => {
    expect(applyAssessmentPolicy({ trustScore: 0, verdict: "Definitely fake" }).originStatus).toBe("indeterminate");
  });

  it("does not manufacture supporting measurements", () => {
    const result = applyAssessmentPolicy({ frameAnalysis: [{ confidence: 92 }], robustnessTests: [{ status: "pass" }], modalityScores: [{ score: 92 }] });
    expect(result.frameAnalysis).toEqual([]);
    expect(result.robustnessTests).toEqual([]);
    expect(result.modalityScores).toEqual([]);
    expect(result.calibrationStatus).toBe("not_validated");
  });

  it("keeps specific review cues without treating positive observations as origin evidence", () => {
    const result = applyAssessmentPolicy({ observations: [{ type: "positive", title: "Natural lighting", description: "Lighting looks plausible." }, { type: "concern", title: "Object boundary", description: "Review the visible boundary." }] });
    expect(result.observations[0].type).toBe("neutral");
    expect(result.observations[1].type).toBe("concern");
    expect(result.originStatus).toBe("indeterminate");
  });
});
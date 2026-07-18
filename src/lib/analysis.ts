import { z } from "zod";

export const riskLevels = ["unknown", "low", "medium", "high", "critical"] as const;
export const confidenceLevels = ["low", "medium", "high"] as const;
export const signalTypes = [
  "urgency",
  "money",
  "personal_data",
  "link",
  "authority",
  "secrecy",
  "reward",
  "relationship",
] as const;

export const analysisSchema = z.object({
  summary: z.string().min(1).max(160),
  riskLevel: z.enum(riskLevels),
  confidence: z.enum(confidenceLevels),
  signals: z
    .array(
      z.object({
        excerpt: z.string().min(1).max(80),
        type: z.enum(signalTypes),
        explanation: z.string().min(1).max(180),
      }),
    )
    .max(5),
  manipulationTactics: z.array(z.string().min(1).max(80)).max(5),
  verificationQuestions: z.array(z.string().min(1).max(160)).length(3),
  recommendedActions: z.array(z.string().min(1).max(180)).min(3).max(5),
  learningPoint: z.string().min(1).max(240),
  helpSummary: z.string().min(1).max(400),
  sensitiveDataDetected: z.boolean(),
  disclaimer: z.string().min(1).max(180),
});

export type AnalysisResult = z.infer<typeof analysisSchema>;
export type RiskLevel = (typeof riskLevels)[number];
export type SignalType = (typeof signalTypes)[number];

export const analysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "riskLevel",
    "confidence",
    "signals",
    "manipulationTactics",
    "verificationQuestions",
    "recommendedActions",
    "learningPoint",
    "helpSummary",
    "sensitiveDataDetected",
    "disclaimer",
  ],
  properties: {
    summary: { type: "string" },
    riskLevel: { type: "string", enum: riskLevels },
    confidence: { type: "string", enum: confidenceLevels },
    signals: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["excerpt", "type", "explanation"],
        properties: {
          excerpt: { type: "string" },
          type: { type: "string", enum: signalTypes },
          explanation: { type: "string" },
        },
      },
    },
    manipulationTactics: { type: "array", maxItems: 5, items: { type: "string" } },
    verificationQuestions: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" },
    },
    recommendedActions: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" },
    },
    learningPoint: { type: "string" },
    helpSummary: { type: "string" },
    sensitiveDataDetected: { type: "boolean" },
    disclaimer: { type: "string" },
  },
} as const;

export const inputSchema = z.object({
  message: z.string().trim().min(8, "請至少輸入 8 個字").max(5000, "訊息不能超過 5,000 字"),
});

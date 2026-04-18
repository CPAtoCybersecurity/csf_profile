import { z } from "zod";

// Allowed score values
const scoreEnum = z.enum(["yes", "partial", "planned", "no"]);

export const analysisSchema = z.object({
  findings: z.array(
    z.object({
      controlId: z.string().min(1).max(50),
      score: scoreEnum,
      confidence: z.number().min(0).max(1),
      evidence: z.string().max(1000),
      quote: z.string().max(2000).optional()
    })
  ).max(200),

  coverage: z.object({
    GOVERN: z.number().min(0).max(100),
    IDENTIFY: z.number().min(0).max(100),
    PROTECT: z.number().min(0).max(100),
    DETECT: z.number().min(0).max(100),
    RESPOND: z.number().min(0).max(100),
    RECOVER: z.number().min(0).max(100),
  }),

  gaps: z.array(z.string().max(500)).max(50),

  recommendations: z.array(z.string().max(500)).max(50)
}).strict();

import { apiPost } from "@/lib/api/client";
import { leadCreateBodySchema, leadSubmitResponseSchema } from "@/lib/api/contracts/leads";
import type { z } from "zod";

export type LeadInput = z.infer<typeof leadCreateBodySchema>;

export async function registerOffer(data: LeadInput) {
  return apiPost("/api/leads/cphq", data, { schema: leadSubmitResponseSchema });
}

export async function registerWebinar(data: LeadInput) {
  return apiPost("/api/leads/webinar", data, { schema: leadSubmitResponseSchema });
}


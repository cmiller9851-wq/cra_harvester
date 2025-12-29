import { z } from "zod";
import { insertHarvestedItemSchema, harvestedItems, yieldReports, proofSources, insertProofSourceSchema } from "./schema";

export const api = {
  items: {
    list: {
      method: "GET" as const,
      path: "/api/items",
      responses: {
        200: z.array(z.custom<typeof harvestedItems.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/items",
      input: insertHarvestedItemSchema,
      responses: {
        201: z.custom<typeof harvestedItems.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/items/:id",
      responses: {
        200: z.custom<typeof harvestedItems.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/items/:id",
      responses: {
        204: z.void(),
        404: z.object({ message: z.string() }),
      },
    }
  },
  yield: {
    list: {
      method: "GET" as const,
      path: "/api/yield/reports",
      responses: {
        200: z.array(z.custom<typeof yieldReports.$inferSelect>()),
      },
    },
    latest: {
      method: "GET" as const,
      path: "/api/yield/latest",
      responses: {
        200: z.custom<typeof yieldReports.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    trigger: {
      method: "POST" as const,
      path: "/api/yield/trigger",
      responses: {
        200: z.custom<typeof yieldReports.$inferSelect>(),
        500: z.object({ message: z.string() }),
      },
    }
  },
  proofs: {
    list: {
      method: "GET" as const,
      path: "/api/proofs",
      responses: {
        200: z.array(z.custom<typeof proofSources.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/proofs",
      input: insertProofSourceSchema,
      responses: {
        201: z.custom<typeof proofSources.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

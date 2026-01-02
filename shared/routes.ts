import { z } from "zod";
import { insertHarvestedItemSchema, harvestedItems, yieldReports } from "./schema";

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
    latest: {
      method: "GET" as const,
      path: "/api/yield/latest",
      responses: {
        200: z.custom<typeof yieldReports.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    history: {
      method: "GET" as const,
      path: "/api/yield/history",
      responses: {
        200: z.array(z.custom<typeof yieldReports.$inferSelect>()),
      },
    },
    audit: {
      method: "POST" as const,
      path: "/api/yield/audit",
      responses: {
        200: z.custom<typeof yieldReports.$inferSelect>(),
      },
    }
  },
  tokens: {
    decode: {
      method: "POST" as const,
      path: "/api/decode",
      input: z.object({
        b64_string: z.string(),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
          data: z.any().optional(),
          message: z.string().optional(),
        }),
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

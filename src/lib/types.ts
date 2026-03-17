import { z } from "zod";

export type CreateResponse = {
  ok: true;
  action: "create";
  url: string;
};

export type DestroyResponse = {
  ok: true;
  action: "destroy";
  database: string;
  username: string;
};

export type ErrorResponse = {
  ok: false;
  error: string;
};

export type Response = CreateResponse | DestroyResponse | ErrorResponse;

export const eventSchema = z.object({
  action: z.enum(["create", "destroy"]),
  repository: z.string().min(1),
  prNumber: z.number().positive(),
});

export type Event = z.infer<typeof eventSchema>;

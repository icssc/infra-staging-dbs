import { z } from "zod";

export enum Action {
  Deploy = "deploy",
  Remove = "remove",
}

export type CreateResponse = {
  ok: true;
  action: Action.Deploy;
  url: string;
  host: string;
  username: string;
  password: string;
  database: string;
};

export type DestroyResponse = {
  ok: true;
  action: Action.Remove;
  database: string;
  username: string;
};

export type ErrorResponse = {
  ok: false;
  error: string;
};

export type Response = CreateResponse | DestroyResponse | ErrorResponse;

export const eventSchema = z.object({
  action: z.enum([Action.Deploy, Action.Remove]),
  repository: z.enum(["_test"]),
  prNumber: z.int().positive(),
});

export type Event = z.infer<typeof eventSchema>;

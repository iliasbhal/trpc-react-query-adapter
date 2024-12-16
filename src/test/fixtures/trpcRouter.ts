import { z } from "zod";
import { initTRPC } from "@trpc/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import body from "body-parser";
import supertest from "supertest";

export type TRPC = typeof trpc;

export type Context = {
  user: string;
};

export const context = initTRPC.context<Context>();
export const trpc = context.create({});

export const trpcRouter = trpc.router({
  stringTools: trpc.router({
    read: trpc.procedure.input(z.string()).query(({ input }) => {
      return input.split("").reverse().join("");
    }),
    reverse: trpc.procedure.input(z.string()).query(({ input }) => {
      // console.log('AAA')
      return input.split("").reverse().join("");
    }),
    all: trpc.procedure.input(z.string()).mutation(({ input }) => {
      return input.split("").reverse().join("");
    }),
    // undo: trpc.router({
    // })
  }),
});

export type TRPCRouter = typeof trpcRouter;

export const createMockTrpcServer = () => {
  const api = express();

  api.use(body.json());

  api.use(
    "/trpc",
    createExpressMiddleware({
      createContext: () => ({ user: "aa" }),
      router: trpcRouter,
      batching: { enabled: true },


      // allowMethodOverride: true,
      // allowBatching: true,

      onError({ error }) {
        console.log("ERROR", error);
      },
    }),
  );

  return supertest(api);
};

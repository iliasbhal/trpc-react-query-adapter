import { CreateTRPCClient } from "@trpc/client";
import { AnyTRPCRouter } from "@trpc/server";
import { recursiveProxyMap } from "./utils/recursiveProxyMap";
import {
  reactQueryReplacer,
  TRPCReactQueryCompat,
} from "./utils/reactQueryReplacer";

export const createTrpcReactQuery = <Router extends AnyTRPCRouter>(
  trpcClient: CreateTRPCClient<Router>,
) => {
  return recursiveProxyMap(trpcClient, reactQueryReplacer, [
    "trpc",
  ]) as TRPCReactQueryCompat<typeof trpcClient>;
};

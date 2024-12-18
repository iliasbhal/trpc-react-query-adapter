import type { inferRouterClient } from "@trpc/client";

import { recursiveProxyMap } from "./utils/recursiveProxyMap";
import {
  reactQueryReplacer,
  TRPCReactQueryCompat,
} from "./utils/reactQueryReplacer";

export const createTrpcReactQuery = <Client extends inferRouterClient<any>>(
  trpcClient: Client,
) : TRPCReactQueryCompat<Client, ['trpc'], true> => {
  return recursiveProxyMap(trpcClient, reactQueryReplacer, [
    "trpc",
  ]);
};

export const createSimpleTrpcClient = <Client extends inferRouterClient<any>>(
  trpcClient: Client,
) : TRPCReactQueryCompat<Client, ['trpc'], false> => {
  return recursiveProxyMap(trpcClient, reactQueryReplacer, [
    "trpc",
  ]);
};
// import { CreateTRPCProxyClient } from "@trpc/client";
import { AnyTRPCRouter } from "@trpc/server";
import type { CreateTRPCClient, inferRouterClient } from "@trpc/client";

// DecoratedProcedureRecord<TRouter, TRouter['_def']['record']>

import { recursiveProxyMap } from "./utils/recursiveProxyMap";
import {
  reactQueryReplacer,
  TRPCReactQueryCompat,
} from "./utils/reactQueryReplacer";

export const createTrpcReactQuery = <Client extends inferRouterClient<any>>(
  trpcClient: Client,
) => {
  return recursiveProxyMap(trpcClient, reactQueryReplacer, [
    "trpc",
  ]) as any as TRPCReactQueryCompat<Client>;
};

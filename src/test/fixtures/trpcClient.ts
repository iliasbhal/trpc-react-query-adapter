import { httpBatchLink, createTRPCClient } from "@trpc/client";
import {
  FetchEsque,
  RequestInitEsque,
} from "@trpc/client/dist/internals/types";
import { TRPCRouter, createMockTrpcServer } from "./trpcRouter";
import { beforeFetch } from "../../utils/secureBodyTransport";

const createMockFetch = (server: any): FetchEsque => {
  return jest
    .fn()
    .mockImplementation(async (url: string, options: RequestInitEsque) => {
      const request =
        options.method == "GET" ? server.get(url) : server.post(url);

      Object.entries(options.headers as any).forEach(([key, value]) =>
        request.set(key, value),
      );

      const response = await request.send(options.body);

      return {
        json() {
          return response.body;
        },
      };
    });
};

export const createTrpcClientWithStub = () => {
  const server = createMockTrpcServer();
  const mockFetch = createMockFetch(server);

  const trpcClient = createTRPCClient<TRPCRouter>({
    links: [
      httpBatchLink({
        url: "http://localhost:3000/trpc",
        methodOverride: "POST",
        fetch: function (input, options) {
          const updated = beforeFetch(input as string, options as any);

          return mockFetch(updated.url, {
            ...options,
            method: updated.method,
            body: JSON.stringify(updated.body),
            headers: updated.headers,
          });
        },
      }),
    ],
  });

  return {
    trpcClient,
    stub: mockFetch,
  };
};

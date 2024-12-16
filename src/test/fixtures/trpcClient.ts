import { httpBatchLink, createTRPCClient } from "@trpc/client";
import {
  FetchEsque,
  RequestInitEsque,
} from "@trpc/client/dist/internals/types";
import { TRPCRouter, createMockTrpcServer } from "./trpcRouter";

export { TRPCRouter }

const createMockFetch = (server: any): FetchEsque => {
  return jest
    .fn()
    .mockImplementation(async (url: string, options: RequestInitEsque) => {
      const urlPath = url.split('localhost:3000').pop();
      const request =
        options.method == "GET" ? server.get(urlPath) : server.post(urlPath);

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
        fetch: function (input, options) {
          return mockFetch(input, options);
        },
      }),
    ],
  });

  return {
    trpcClient,
    stub: mockFetch,
  };
};

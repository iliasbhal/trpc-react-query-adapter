import { createTrpcClientWithStub } from "./fixtures/trpcClient";
import { createTrpcReactQuery } from "../index";
import wait from "wait";

describe("Trpc React Query Adapter", () => {
  it("root has a queryKey", async () => {
    const { trpcClient } = createTrpcClientWithStub();

    const trpcRQ = createTrpcReactQuery(trpcClient);
    expect(trpcRQ.queryKey).toEqual(["trpc"]);
  });

  it("should call .query directly ", async () => {
    const { trpcClient, stub } = createTrpcClientWithStub();
    const trpcRQ = createTrpcReactQuery(trpcClient);

    await trpcRQ.stringTools.read("12345");
    expect(stub).toHaveBeenCalledTimes(1);
  });

  it("should abort if a property is accessed immediately", async () => {
    const { trpcClient, stub } = createTrpcClientWithStub();
    const trpcRQ = createTrpcReactQuery(trpcClient);

    trpcRQ.stringTools.read("1234").queryKey;
    await wait(100);
    expect(stub).toHaveBeenCalledTimes(0);
  });

  it("should abort when destructured", async () => {
    const { trpcClient, stub } = createTrpcClientWithStub();
    const trpcRQ = createTrpcReactQuery(trpcClient);

    // Sometimes we need to descructure the object returned
    // to customez the react query options. So we need to ensure that this
    // pattern does not trigger a call to the server and works properly
    // ex: useQuery({
    //       ...trpcRQ.stringTools.read('aaa'),
    //       staleTime: 1000,
    //       cacheTime: 1000,
    //     })
    const queryParams = {
      ...trpcRQ.stringTools.read("aaa"),
    };

    await wait(100);
    expect(stub).toHaveBeenCalledTimes(0);
    expect(queryParams.queryKey).toEqual([
      "trpc",
      "stringTools",
      "read",
      '["aaa"]',
    ]);
  });

  it("should return what procedure returns", async () => {
    const { trpcClient, stub } = createTrpcClientWithStub();
    const trpcRQ = createTrpcReactQuery(trpcClient);
    const value = await trpcRQ.stringTools.read("123123");
    expect(value).toEqual("321321");
  });

  it("should batch mutate calls", async () => {
    const { trpcClient, stub } = createTrpcClientWithStub();
    const trpcRQ = createTrpcReactQuery(trpcClient);

    const responses = await Promise.all([
      trpcRQ.stringTools.reverse("123123"),
      trpcRQ.stringTools.reverse("44444"),
      trpcRQ.stringTools.read("1234"),
    ]);

    expect(stub).toHaveBeenCalledTimes(1);
    expect(responses[0]).toEqual("321321");
    expect(responses[1]).toEqual("44444");
    expect(responses[2]).toEqual("4321");
  });

  it("should have queryKey attribute at each path", async () => {
    const { trpcClient, stub } = createTrpcClientWithStub();
    const trpcRQ = createTrpcReactQuery(trpcClient);

    expect(trpcRQ.stringTools.queryKey).toEqual(["trpc", "stringTools"]);
    expect(trpcRQ.stringTools.read.queryKey).toEqual([
      "trpc",
      "stringTools",
      "read",
    ]);
    expect(trpcRQ.stringTools.read("1234").queryKey).toEqual([
      "trpc",
      "stringTools",
      "read",
      '["1234"]',
    ]);
  });
});

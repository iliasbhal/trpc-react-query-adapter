import { mergeWithNotify } from "./mergeWithNotify";

export const reactQueryReplacer = (obj: any, key: any, path: string[]) => {
  // avoid replacing attibutes are added by the replacer
  if (key === "queryKey") return path.filter((p) => p !== "queryKey");
  if (key === "queryFn") return path.filter((p) => p !== "queryFn");
  if (key === "mutationFn") return path.filter((p) => p !== "mutationFn");
  // if (key === 'mutationKey') return path.filter((p) => p !== 'mutationKey');

  const callback = (...args: any[]) => {
    const argsKey = JSON.stringify(args);
    const qKey = path.concat(argsKey);

    const reactQueryQueryOptions = {
      queryKey: qKey,
      queryFn: () => obj.__trpcOriginalProxy[key].query(...args),
      // mutationKey: qKey,
      // mutationFn: () => obj.__trpcOriginalProxy[key].mutate(...args),
    };

    let isAborted = false;
    const promise = Promise.resolve().then(() => {
      if (isAborted) return;
      return reactQueryQueryOptions.queryFn();
    });

    const promiseWithGetters = mergeWithNotify(
      promise,
      reactQueryQueryOptions,
      (prop: string) => {
        if (prop === "queryKey") isAborted = true;
        if (prop === "queryFn") isAborted = true;
        // if (prop === 'mutationKey') isAborted = true;
        if (prop === "mutatwionFn") isAborted = true;
      },
    );

    return promiseWithGetters;
  };

  return Object.assign(callback, {
    ...(obj[key] as any),
    __trpcOriginalProxy: obj[key],
    get queryKey() {
      return path;
    },
    get mutationFn() {
      return callback;
    },
  });
};

type List<A = any> = ReadonlyArray<A>;
type Append<L extends List, A extends any> = [...L, A];

export type TRPCReactQueryCompat<
  Entry,
  QueryKeys extends List<string> = ["trpc"],
> = {
  [key in Extract<keyof Entry, string>]: Entry[key] extends Query
    ? QueryKey<Append<QueryKeys, key>> &
        QueryProxyCallback<Entry[key], Append<Append<QueryKeys, key>, string>>
    : Entry[key] extends Mutation
      ? MutationKey<Append<QueryKeys, key>> &
          MutationProxyCallback<
            Entry[key],
            Append<Append<QueryKeys, key>, string>
          >
      : TRPCReactQueryCompat<Entry[key], Append<QueryKeys, key>> &
          QueryKey<Append<QueryKeys, key>>;
  // : never
} & {
  queryKey: QueryKeys;
  // mutationKey: QueryKeys
};

type AnyFunction = (...args: any[]) => boolean;

type Query = { query: any };
type QueryKey<Key extends string[]> = {
  queryKey: Key;
};

type QueryFn<Fn extends AnyFunction> = {
  queryFn: () => ReturnType<Fn>;
};

type QueryProxyCallback<
  Entry extends { query: AnyFunction },
  Keys extends string[],
> =
  // Omit<Entry, keyof Query> &
  (
    ...args: Parameters<Entry["query"]>
  ) => ReturnType<Entry["query"]> & QueryKey<Keys> & QueryFn<Entry["query"]>;

type Mutation = { mutate: any };
type MutationKey<Key extends string[]> = {
  // mutationKey: Key,
};

type MutationFn<Fn extends AnyFunction> = {
  mutationFn: () => ReturnType<Fn>;
};

type MutationProxyCallback<
  Entry extends { mutate: AnyFunction },
  Keys extends string[],
> = MutationFn<Entry["mutate"]> & Entry["mutate"];
// (
// ((...args: Parameters<Entry['mutate']>) => (
//   & ReturnType<Entry['mutate']>
//   & MutationFn<Entry['mutate']>
// ))
// ) & Entry['mutate']

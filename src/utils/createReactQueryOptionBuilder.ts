type Keys = 'queryKey' | 'mutationKey' | 'queryFn' | 'mutationFn'

type RemoveKey<T> = {
  [K in Exclude<keyof T, Keys>]: RemoveKey<T[K]>
}

export const createReactQueryOptionsBuilder = <Client>(client: Client) => {
  const getQueryKey = (arg: any): string[] => {
    return (arg as any)?.queryKey;
  }


  const getQueryOptions = <Callback extends Promise<any>>(callback: Callback) => {
    return {
      queryKey: getQueryKey(callback),
      queryFn: callback as any as () => Callback,
    }
  }

  const getMutationOptions = <Callback extends (trpc: RemoveKey<Client>) => Promise<any>>(callback: Callback) => {
    return {
      mutationKey: getMutationKey(callback),
      mutationFn: callback as Callback,
    }
  }

  const getMutationKey = (arg: any): string[] => {
    return (arg as any)?.queryKey;
  }

  const trpcQueryOptions = <ResponseType extends Promise<any>>(buildQuery: (trpc: RemoveKey<Client>) => ResponseType) => {
    const query = buildQuery(client);
    return getQueryOptions(query);
  }

  const trpcMutationOptions = <ResponseType extends (...args: any) => Promise<any>>(buildMutation: (trpc: RemoveKey<Client>) => ResponseType) => {
    const mutation = buildMutation(client);
    return getMutationOptions(mutation);
  }

  const universalOptions = <ResponseType extends Promise<any> | ((...args: any) => Promise<any>)>(buildWithTRPC: (trpc: RemoveKey<Client>) => ResponseType)
    : ResponseType extends Promise<any> ? ReturnType<typeof trpcQueryOptions<ResponseType>>
    : ResponseType extends ((...args: any) => Promise<any>) ? ReturnType<typeof trpcMutationOptions<ResponseType>>
    : never => {
    const built = buildWithTRPC(client);

    if (typeof built === 'function') {
      // @ts-ignore
      return getMutationOptions(built);
    } else {
      // @ts-ignore
      return getQueryOptions(built);
    }
  }

  return {
    query: trpcQueryOptions,
    mutation: trpcMutationOptions,
    for: universalOptions,
  }
}

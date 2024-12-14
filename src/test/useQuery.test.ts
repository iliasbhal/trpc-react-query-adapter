import { createTrpcClientWithStub } from './fixtures/trpcClient';
import { createTrpcReactQuery } from '../index'
import * as RQ from '@tanstack/react-query';


describe('Trpc - useQuery', () => {

  it.skip('root has a queryKey', async () => {
    const { trpcClient } = createTrpcClientWithStub()
    const api = createTrpcReactQuery(trpcClient);

    const res1 = await api.stringTools.all('asd')
    const res2 = await api.stringTools.read('123213');

    const mutate = RQ.useMutation(api.stringTools.all)
    const query = RQ.useQuery(api.stringTools.read('asd'))
    const querySus = RQ.useSuspenseQuery(api.stringTools.read('asd'))

    const queries = RQ.useQueries({
      queries: [
        api.stringTools.read('asd'),
        api.stringTools.read('asd'),
      ],
      combine(result) {

      },
    });

    const queriesSus = RQ.useSuspenseQueries({
      queries: [
        api.stringTools.read('asd'),
        api.stringTools.read('asd'),
      ],
      combine(result) {

      },
    });

    RQ.useInfiniteQuery({
      queryKey: [''],
      queryFn: async (args) => {
        api.stringTools.read(args.pageParam.toString());
      },
      initialPageParam: 0,
      getNextPageParam: () => {
        return 1;
      },
    })

    // const obj = await Promise.fromObjectValues({
    //   aa: Promise.resolve(10),
    // });




    // useMutation({
    //   mutationKey: ['trpc'],
    //   mutationFn: () => mutations.stringTools.read('123213'),
    // });



    // queries.stringTools.reverse.query('123213')
    // mutation.stringTools.reverse('123213')

    // useQuery({
    //   ...trpcRQ.stringTools.reverse.query('12345'),
    //   staleTime: 1000,
    // });

    // expect(trpcRQ.queryKey).toEqual(['trpc']);
  })

})

const extendUseQuery = <UseQuery extends typeof useQueryOG, Ext extends any>(useQueryHook: UseQuery, extension: Ext) => {
  return useQueryHook as UseQuery & UseQueryExtension<Ext>;
}

type UseQueryExtension<Ext extends any> = {
  [key in keyof Ext]: Ext[key] extends (...args: any[]) => Promise<any> ? Ext[key] : UseQueryExtension<Ext[key]>;
}

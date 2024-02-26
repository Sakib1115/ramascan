import React from 'react';

import type { AddressTokensResponse } from 'types/api/address';

import useApiQuery from 'lib/api/useApiQuery';
import replaceTokenType from 'lib/token/replaceTokenType';

import { calculateUsdValue } from './tokenUtils';

interface Props {
  hash?: string;
}

export default function useFetchTokens({ hash }: Props) {
  const erc20query = useApiQuery('address_tokens', {
    pathParams: { hash },
    queryParams: { type: replaceTokenType('RAMA-20') },
    queryOptions: {
      enabled: Boolean(hash),
      refetchOnMount: false,
      select: (data: AddressTokensResponse): AddressTokensResponse => {
        return {
          items: data.items.map((item) => {
            return {
              ...item,
              token: {
                ...item.token,
                type: replaceTokenType(item.token.type),
              },
            };
          }),
          next_page_params: data.next_page_params,
        };
      },
    },
  });
  const erc721query = useApiQuery('address_tokens', {
    pathParams: { hash },
    queryParams: { type: replaceTokenType('RAMA-721') },
    queryOptions: {
      enabled: Boolean(hash),
      refetchOnMount: false,
      select: (data: AddressTokensResponse): AddressTokensResponse => {
        return {
          items: data.items.map((item) => {
            return {
              ...item,
              token: {
                ...item.token,
                type: replaceTokenType(item.token.type),
              },
            };
          }),
          next_page_params: data.next_page_params,
        };
      },
    },
  });
  const erc1155query = useApiQuery('address_tokens', {
    pathParams: { hash },
    queryParams: { type: replaceTokenType('RAMA-1155') },
    queryOptions: {
      enabled: Boolean(hash),
      refetchOnMount: false,
      select: (data: AddressTokensResponse): AddressTokensResponse => {
        return {
          items: data.items.map((item) => {
            return {
              ...item,
              token: {
                ...item.token,
                type: replaceTokenType(item.token.type),
              },
            };
          }),
          next_page_params: data.next_page_params,
        };
      },
    },
  });

  const refetch = React.useCallback(() => {
    erc20query.refetch();
    erc721query.refetch();
    erc1155query.refetch();
  }, [ erc1155query, erc20query, erc721query ]);

  const data = React.useMemo(() => {
    return {
      'RAMA-20': {
        items: erc20query.data?.items.map(calculateUsdValue) || [],
        isOverflow: Boolean(erc20query.data?.next_page_params),
      },
      'RAMA-721': {
        items: erc721query.data?.items.map(calculateUsdValue) || [],
        isOverflow: Boolean(erc721query.data?.next_page_params),
      },
      'RAMA-1155': {
        items: erc1155query.data?.items.map(calculateUsdValue) || [],
        isOverflow: Boolean(erc1155query.data?.next_page_params),
      },
      'ERC-20': {
        items: [],
        isOverflow: false,
      },
      'ERC-721': {
        items: [],
        isOverflow: false,
      },
      'ERC-1155': {
        items: [],
        isOverflow: false,
      },
    };
  }, [ erc1155query.data, erc20query.data, erc721query.data ]);

  return {
    isLoading: erc20query.isLoading || erc721query.isLoading || erc1155query.isLoading,
    isError: erc20query.isError || erc721query.isError || erc1155query.isError,
    data,
    refetch,
  };
}

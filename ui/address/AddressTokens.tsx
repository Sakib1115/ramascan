import { Box } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React from 'react';

import type { SocketMessage } from 'lib/socket/types';
import type { AddressTokenBalance, AddressTokensBalancesSocketMessage, AddressTokensResponse } from 'types/api/address';
import type { TokenType } from 'types/api/token';
import type { PaginationParams } from 'ui/shared/pagination/types';

import { getResourceKey } from 'lib/api/useApiQuery';
import useIsMobile from 'lib/hooks/useIsMobile';
import getQueryParamString from 'lib/router/getQueryParamString';
import useSocketChannel from 'lib/socket/useSocketChannel';
import useSocketMessage from 'lib/socket/useSocketMessage';
import replaceTokenType from 'lib/token/replaceTokenType';
import { ADDRESS_TOKEN_BALANCE_RAMA_1155, ADDRESS_TOKEN_BALANCE_RAMA_20, ADDRESS_TOKEN_BALANCE_RAMA_721 } from 'stubs/address';
import { generateListStub } from 'stubs/utils';
import { tokenTabsByType } from 'ui/pages/Address';
import Pagination from 'ui/shared/pagination/Pagination';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import RoutedTabs from 'ui/shared/Tabs/RoutedTabs';

import RAMA1155Tokens from './tokens/ERC1155Tokens';
import RAMA20Tokens from './tokens/ERC20Tokens';
import RAMA721Tokens from './tokens/ERC721Tokens';
import TokenBalances from './tokens/TokenBalances';

const TAB_LIST_PROPS = {
  marginBottom: 0,
  py: 5,
  marginTop: 3,
  columnGap: 3,
};

const TAB_LIST_PROPS_MOBILE = {
  mt: 8,
  columnGap: 3,
};

const tokenBalanceItemIdentityFactory = (match: AddressTokenBalance) => (item: AddressTokenBalance) => ((
  match.token.address === item.token.address &&
  match.token_id === item.token_id &&
  match.token_instance?.id === item.token_instance?.id
));

const AddressTokens = () => {
  const router = useRouter();
  const isMobile = useIsMobile();

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const tab = getQueryParamString(router.query.tab);
  const hash = getQueryParamString(router.query.hash);

  const erc20Query = useQueryWithPages({
    resourceName: 'address_tokens',
    pathParams: { hash },
    filters: { type: 'ERC-20' },
    scrollRef,
    options: {
      refetchOnMount: false,
      placeholderData: generateListStub<'address_tokens'>(ADDRESS_TOKEN_BALANCE_RAMA_20, 10, { next_page_params: null }),
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

  const erc721Query = useQueryWithPages({
    resourceName: 'address_tokens',
    pathParams: { hash },
    filters: { type: 'ERC-721' },
    scrollRef,
    options: {
      refetchOnMount: false,
      placeholderData: generateListStub<'address_tokens'>(ADDRESS_TOKEN_BALANCE_RAMA_721, 10, { next_page_params: null }),
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

  const erc1155Query = useQueryWithPages({
    resourceName: 'address_tokens',
    pathParams: { hash },
    filters: { type: 'ERC-1155' },
    scrollRef,
    options: {
      refetchOnMount: false,
      placeholderData: generateListStub<'address_tokens'>(ADDRESS_TOKEN_BALANCE_RAMA_1155, 10, { next_page_params: null }),
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

  const queryClient = useQueryClient();

  const updateTokensData = React.useCallback((type: TokenType, payload: AddressTokensBalancesSocketMessage) => {
    const queryKey = getResourceKey('address_tokens', { pathParams: { hash }, queryParams: { type } });

    queryClient.setQueryData(queryKey, (prevData: AddressTokensResponse | undefined) => {
      const items = prevData?.items.map((currentItem) => {
        const updatedData = payload.token_balances.find(tokenBalanceItemIdentityFactory(currentItem));
        return updatedData ?? currentItem;
      }) || [];

      const extraItems = prevData?.next_page_params ?
        [] :
        payload.token_balances.filter((socketItem) => !items.some(tokenBalanceItemIdentityFactory(socketItem)));

      if (!prevData) {
        return {
          items: extraItems,
          next_page_params: null,
        };
      }

      return {
        items: items.concat(extraItems),
        next_page_params: prevData.next_page_params,
      };
    });
  }, [ hash, queryClient ]);

  const handleTokenBalancesErc20Message: SocketMessage.AddressTokenBalancesErc20['handler'] = React.useCallback((payload) => {
    updateTokensData('RAMA-20', payload);
  }, [ updateTokensData ]);

  const handleTokenBalancesErc721Message: SocketMessage.AddressTokenBalancesErc721['handler'] = React.useCallback((payload) => {
    updateTokensData('RAMA-721', payload);
  }, [ updateTokensData ]);

  const handleTokenBalancesErc1155Message: SocketMessage.AddressTokenBalancesErc1155['handler'] = React.useCallback((payload) => {
    updateTokensData('RAMA-1155', payload);
  }, [ updateTokensData ]);

  const channel = useSocketChannel({
    topic: `addresses:${ hash.toLowerCase() }`,
    isDisabled: erc20Query.isPlaceholderData || erc721Query.isPlaceholderData || erc1155Query.isPlaceholderData,
  });

  useSocketMessage({
    channel,
    event: 'updated_token_balances_erc_20',
    handler: handleTokenBalancesErc20Message,
  });
  useSocketMessage({
    channel,
    event: 'updated_token_balances_erc_721',
    handler: handleTokenBalancesErc721Message,
  });
  useSocketMessage({
    channel,
    event: 'updated_token_balances_erc_1155',
    handler: handleTokenBalancesErc1155Message,
  });

  const tabs = [
    { id: tokenTabsByType['RAMA-20'], title: 'RAMA-20', component: <RAMA20Tokens tokensQuery={ erc20Query }/> },
    { id: tokenTabsByType['RAMA-721'], title: 'RAMA-721', component: <RAMA721Tokens tokensQuery={ erc721Query }/> },
    { id: tokenTabsByType['RAMA-1155'], title: 'RAMA-1155', component: <RAMA1155Tokens tokensQuery={ erc1155Query }/> },
  ];

  let pagination: PaginationParams | undefined;

  if (tab === tokenTabsByType['RAMA-1155']) {
    pagination = erc1155Query.pagination;
  } else if (tab === tokenTabsByType['RAMA-721']) {
    pagination = erc721Query.pagination;
  } else {
    pagination = erc20Query.pagination;
  }

  return (
    <>
      <TokenBalances/>
      { /* should stay before tabs to scroll up with pagination */ }
      <Box ref={ scrollRef }></Box>
      <RoutedTabs
        tabs={ tabs }
        variant="outline"
        colorScheme="gray"
        size="sm"
        tabListProps={ isMobile ? TAB_LIST_PROPS_MOBILE : TAB_LIST_PROPS }
        rightSlot={ pagination.isVisible && !isMobile ? <Pagination { ...pagination }/> : null }
        stickyEnabled={ !isMobile }
      />
    </>
  );
};

export default AddressTokens;

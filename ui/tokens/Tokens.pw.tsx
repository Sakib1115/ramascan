import { Box } from '@chakra-ui/react';
import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';

import * as tokens from 'mocks/tokens/tokenInfo';
import TestApp from 'playwright/TestApp';
import buildApiUrl from 'playwright/utils/buildApiUrl';

import Tokens from './Tokens';

const API_URL_TOKENS = buildApiUrl('tokens');

const tokensResponse = {
  items: [
    tokens.tokenInfoRAMA20a, tokens.tokenInfoRAMA20b, tokens.tokenInfoRAMA20c, tokens.tokenInfoRAMA20d,
    tokens.tokenInfoRAMA721a, tokens.tokenInfoRAMA721b, tokens.tokenInfoRAMA721c,
    tokens.tokenInfoRAMA1155a, tokens.tokenInfoRAMA1155b, tokens.tokenInfoRAMA1155WithoutName,
  ],
  next_page_params: {
    holder_count: 1,
    items_count: 1,
    name: 'a',
  },
};

test('base view +@mobile +@dark-mode', async({ mount, page }) => {
  await page.route(API_URL_TOKENS, (route) => route.fulfill({
    status: 200,
    body: JSON.stringify(tokensResponse),
  }));

  const component = await mount(
    <TestApp>
      <Box h={{ base: '134px', lg: 6 }}/>
      <Tokens/>
    </TestApp>,
  );

  await expect(component).toHaveScreenshot();
});

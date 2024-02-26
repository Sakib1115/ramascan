import type { Feature } from './types';

import chain from '../chain';
import { getEnvValue } from '../utils';

const privateKey = getEnvValue(process.env.NEXT_PUBLIC_FAUCET_PRIVATE_KEY);

const title = 'RAMA Faucet';

const config: Feature<{ privateKey: string }> = (() => {
  if (privateKey !== undefined && chain.isTestnet) {
    return Object.freeze({
      title,
      isEnabled: true,
      privateKey,
    });
  }

  return Object.freeze({
    title,
    isEnabled: false,
  });
})();

export default config;

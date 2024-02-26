import dynamic from 'next/dynamic';
import React from 'react';

import type { NextPageWithLayout } from 'nextjs/types';

import PageNextJs from 'nextjs/PageNextJs';

import LayoutFaucet from 'ui/shared/layout/LayoutFaucet';

const Faucet = dynamic(() => import('ui/pages/Faucet'), { ssr: false });

const Page: NextPageWithLayout = () => {
  return (
    <PageNextJs pathname="/faucet">
      <Faucet/>
    </PageNextJs>
  );
};
Page.getLayout = function getLayout(page: React.ReactElement) {
  return <LayoutFaucet>{ page }</LayoutFaucet>;
};
export default Page;

export { base as getServerSideProps } from 'nextjs/getServerSideProps';

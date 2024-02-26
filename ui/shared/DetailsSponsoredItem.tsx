import { GridItem } from '@chakra-ui/react';
import React from 'react';

import * as cookies from 'lib/cookies';
import useIsMobile from 'lib/hooks/useIsMobile';
import DetailsInfoItem from 'ui/shared/DetailsInfoItem';

interface Props {
  isLoading?: boolean;
}

const DetailsSponsoredItem = ({ isLoading }: Props) => {
  const isMobile = useIsMobile();
  const hasAdblockCookie = cookies.get(cookies.NAMES.ADBLOCK_DETECTED);

  if (hasAdblockCookie) {
    return null;
  }

  if (isMobile) {
    return (
      <GridItem mt={ 5 }/>
    );
  }

  return (
    <DetailsInfoItem
      title="Sponsored"
      hint="Sponsored banner advertisement"
      isLoading={ isLoading }
    >
    </DetailsInfoItem>
  );
};

export default React.memo(DetailsSponsoredItem);

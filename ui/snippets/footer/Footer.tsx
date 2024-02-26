import { Box, Grid, Flex, Text, Link, VStack, Skeleton } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import type { CustomLinksGroup } from 'types/footerLinks';

import config from 'configs/app';
import editIcon from 'icons/edit.svg';
import facebook_filled from 'icons/social/facebook_filled.svg';
import gitIcon from 'icons/social/git.svg';
import instagram from 'icons/social/instagram.svg';
import linkedin_filled from 'icons/social/linkedin_filled.svg';
import reddit_filled from 'icons/social/reddit_filled.svg';
import telegram_filled from 'icons/social/telegram_filled.svg';
import youtube from 'icons/social/youtube.svg';
import type { ResourceError } from 'lib/api/resources';
import useApiQuery from 'lib/api/useApiQuery';
import useFetch from 'lib/hooks/useFetch';
import useIssueUrl from 'lib/hooks/useIssueUrl';
import IndexingAlertIntTxs from 'ui/home/IndexingAlertIntTxs';
import NetworkAddToWallet from 'ui/shared/NetworkAddToWallet';

import ColorModeToggler from '../header/ColorModeToggler';
import FooterLinkItem from './FooterLinkItem';
// import getApiVersionUrl from './utils/getApiVersionUrl';

const MAX_LINKS_COLUMNS = 3;

const FRONT_VERSION_URL = `https://github.com/blockscout/frontend/tree/${ config.UI.footer.frontendVersion }`;

const Footer = () => {

  const { data: backendVersionData } = useApiQuery('config_backend_version', {
    queryOptions: {
      staleTime: Infinity,
    },
  });
  // const apiVersionUrl = getApiVersionUrl(backendVersionData?.backend_version);
  const issueUrl = useIssueUrl(backendVersionData?.backend_version);
  const BLOCKSCOUT_LINKS = [
    {
      icon: editIcon,
      iconSize: '16px',
      text: 'Submit an issue',
      url: issueUrl,
    },
    {
      icon: gitIcon,
      iconSize: '18px',
      text: 'Contribute',
      url: 'https://github.com/Ramestta-Blockchain/ramascan',
    },
    {
      icon: youtube,
      iconSize: '15px',
      text: 'Youtube',
      url: 'https://www.youtube.com/@ramestta6851/featured',
    },
    {
      icon: instagram,
      iconSize: '15px',
      text: 'Instagram',
      url: 'https://www.instagram.com/ramestta/',
    },
    {
      icon: linkedin_filled,
      iconSize: '18px',
      text: 'LinkedIn',
      url: 'https://www.linkedin.com/company/ramestta/',
    },
    {
      icon: telegram_filled,
      iconSize: '18px',
      text: 'Telegram',
      url: 'https://t.me/ramestta_blockchain',
    },
    {
      icon: facebook_filled,
      iconSize: '18px',
      text: 'Facebook',
      url: 'https://www.facebook.com/Ramestta',
    },
    {
      icon: reddit_filled,
      iconSize: '18px',
      text: 'Reddit',
      url: 'https://www.reddit.com/user/Ramestta/',
    },
  ];

  const fetch = useFetch();

  const { isLoading, data: linksData } = useQuery<unknown, ResourceError<unknown>, Array<CustomLinksGroup>>(
    [ 'footer-links' ],
    async() => fetch(config.UI.footer.links || ''),
    {
      enabled: Boolean(config.UI.footer.links),
      staleTime: Infinity,
    });

  return (
    <Flex
      direction={{ base: 'column', lg: 'row' }}
      p={{ base: 4, lg: 9 }}
      borderTop="1px solid"
      borderColor="divider"
      as="footer"
      columnGap="100px"
    >
      <Box flexGrow="1" mb={{ base: 8, lg: 0 }}>
        <Flex flexWrap="wrap" columnGap={ 8 } rowGap={ 6 }>
          <ColorModeToggler/>
          { !config.UI.indexingAlert.isHidden && <IndexingAlertIntTxs/> }
          <NetworkAddToWallet/>
        </Flex>
        <Box mt={{ base: 5, lg: '44px' }}>
          <Link fontSize="xs" href="https://www.ramestta.com/">ramestta.com</Link>
        </Box>
        <Text mt={ 3 } maxW={{ base: 'unset', lg: '470px' }} fontSize="xs">
        Ramestta is a PoS Blockchain with layer 2 solution for building dApp and connecting EVM-compatible blockchain, it is a faster Blockahin for the Future.
        </Text>
        <VStack spacing={ 1 } mt={ 6 } alignItems="start">
          { /* { apiVersionUrl && (
            <Text fontSize="xs">
                Backend: <Link href={ apiVersionUrl } target="_blank">{ backendVersionData?.backend_version }</Link>
            </Text>
          ) } */ }
          { (config.UI.footer.frontendVersion || config.UI.footer.frontendCommit) && (
            <Text fontSize="xs">
              Frontend: <Link href={ FRONT_VERSION_URL } target="_blank">{ config.UI.footer.frontendVersion }</Link>
            </Text>
          ) }
        </VStack>
      </Box>
      <Grid
        gap={{ base: 6, lg: 12 }}
        gridTemplateColumns={ config.UI.footer.links ?
          { base: 'repeat(auto-fill, 160px)', lg: `repeat(${ (linksData?.length || MAX_LINKS_COLUMNS) + 1 }, 160px)` } :
          'auto'
        }
      >
        <Box minW="160px" w={ config.UI.footer.links ? '160px' : '100%' }>
          { config.UI.footer.links && <Text fontWeight={ 500 } mb={ 3 }>Ramascan</Text> }
          <Grid
            gap={ 1 }
            gridTemplateColumns={ config.UI.footer.links ? '160px' : { base: 'repeat(auto-fill, 160px)', lg: 'repeat(3, 160px)' } }
            gridTemplateRows={{ base: 'auto', lg: config.UI.footer.links ? 'auto' : 'repeat(2, auto)' }}
            gridAutoFlow={{ base: 'row', lg: config.UI.footer.links ? 'row' : 'column' }}
            mt={{ base: 0, lg: config.UI.footer.links ? 0 : '100px' }}
          >
            { BLOCKSCOUT_LINKS.map(link => <FooterLinkItem { ...link } key={ link.text }/>) }
          </Grid>
        </Box>
        { config.UI.footer.links && isLoading && (
          Array.from(Array(3)).map((i, index) => (
            <Box minW="160px" key={ index }>
              <Skeleton w="120px" h="20px" mb={ 6 }/>
              <VStack spacing={ 5 } alignItems="start" mb={ 2 }>
                { Array.from(Array(5)).map((i, index) => <Skeleton w="160px" h="14px" key={ index }/>) }
              </VStack>
            </Box>
          ))
        ) }
        { config.UI.footer.links && linksData && (
          linksData.slice(0, MAX_LINKS_COLUMNS).map(linkGroup => (
            <Box minW="160px" key={ linkGroup.title }>
              <Text fontWeight={ 500 } mb={ 3 }>{ linkGroup.title }</Text>
              <VStack spacing={ 1 } alignItems="start">
                { linkGroup.links.map(link => <FooterLinkItem { ...link } key={ link.text }/>) }
              </VStack>
            </Box>
          ))
        ) }
      </Grid>
    </Flex>
  );
};

export default Footer;

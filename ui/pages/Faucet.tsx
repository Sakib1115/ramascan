import type {
  As } from '@chakra-ui/react';
import {

  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
  useColorMode,
  Spinner,

} from '@chakra-ui/react';
import React from 'react';
import type { PrivateKeyAccount, WalletClient } from 'viem';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { isAddress, parseEther } from 'viem/utils';
import { sendTransaction } from 'viem/wallet';
import type { Address } from 'wagmi';

import chain from 'configs/app/chain';
import config from 'configs/app/features/faucet';
import TxEntity from 'ui/shared/entities/tx/TxEntity';

import arrowb from '../../images/arrowb.svg';
import arroww from '../../images/arroww.svg';
import brama from '../../images/brama.svg';
import btcicon from '../../images/btcicon.svg';
import busdicon from '../../images/busdicon.svg';
import daiicon from '../../images/daiicon.svg';
import ethicon from '../../images/ethicon.svg';
import qsign from '../../images/qsign.svg';
import ramaicon from '../../images/ramaicon.svg';
import usdcicon from '../../images/usdcicon.svg';
import wrama from '../../images/wrama.svg';

const faqData = [
  {
    title: 'What standard are these tokens issued in?',
    content:
      'BTC, RUSD, DAI, ETH, USDC, XRP, and USDT are issued as RAMA20 tokens.',
  },
  {
    title: 'Are there any rate limit(s)?',
    content: 'Yes, you can only request 1 time per 6 hours, for all tokens.',
  },
  {
    title: 'What if I want to request a large amount of tokens?',
    content:
      'Request for large number of tokens is restricted to development purposes only. Please reach out via the RAMA Chain Support to make this request.',
  },
  {
    title: 'Do you support other tokens?',
    content:
      'No, we only support the tokens listed in on the faucet list; for tokens beyond that list, you can visit a DEX to swap or create your own token contract',
  },
  {
    title:
      'Does the tRAMA have any value, like some Ethereum testnet that can be traded with a real price?',
    content:
      'tRAMA holds no financial value and cannot be traded at a real price, given its unlimited supply, exclusively serving test and development purposes.',
  },
  {
    title: 'What if my request keeps failing?',
    content:
      'To prevent potential misidentification as a bot, kindly refrain from frequent operations and allow a few minutes before attempting the next action.',
  },
];

type DropMenuDataType = {
  label: string;
  icon: SVGAElement;
  value: string;
}

const dropMenuData: Array<DropMenuDataType> = [
  {
    label: 'RAMA',
    icon: ramaicon,
    value: '0.5',
  },
  {
    label: 'BTC',
    icon: btcicon,
    value: '1',
  },
  {
    label: 'RUSD',
    icon: busdicon,
    value: '10',
  },
  {
    label: 'DAI',
    icon: daiicon,
    value: '10',
  },
  {
    label: 'ETH',
    icon: ethicon,
    value: '0.1',
  },
  {
    label: 'USDC',
    icon: usdcicon,
    value: '10',
  },
];

type FaucetTxDataType = {
  label: string;
  hash: Address;
  time: string;
}

// const faucetTxData: Array<FaucetTxDataType> = [
//   {
//     label: "RAMA",
//     hash: '0xe24e75f97cd9b95055f1ec5560b88828e2542442090a89ea67337bbcc3c6f3c6',
//     time: '5 hour ago',
//   },
//   {
//     label: "USDC",
//     hash: '0xe24e75f97cd9b95055f1ec5560b88828e2542442090a89ea67337d4acf33c6c6',
//     time: '4 hour ago',
//   }
// ];

const pingaksha = {
  id: 1377,
  name: 'Pingaksha Test',
  network: 'Ramestta',
  nativeCurrency: {
    decimals: 18,
    name: 'tRAMA',
    symbol: 'tRAMA',
  },
  iconUrl:
    'https://raw.githubusercontent.com/Ramestta-Blockchain/ramascan/main/public/static/ramestta_32x32_mm_icon.svg',
  rpcUrls: {
    'public': { http: [ 'https://testnet.ramestta.com' ] },
    'default': { http: [ 'https://testnet.ramestta.com' ] },
  },
  blockExplorers: {
    etherscan: { name: 'SnowTrace', url: 'https:pingaksha.ramascan.com' },
    'default': { name: 'SnowTrace', url: 'https:pingaksha.ramascan.com' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1_907_934,
    },
  },
} as const;

// const clearFaucetTxListCookie = () => {
//   document.cookie = 'faucetTxList=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
// };

const Faucet = () => {
  const { isOpen: successModalOpen, onOpen: openSuccessModal, onClose: closeSuccessModal } = useDisclosure();
  const { isOpen: warningModalOpen, onOpen: openWarningModal, onClose: closeWarningModal } = useDisclosure();

  const [ userInputAddress, setUserInputAdress ] = React.useState<Address | ''>('');
  const [ selectedItem, setSelectedItem ] = React.useState<DropMenuDataType | null>({
    label: 'RAMA',
    icon: ramaicon,
    value: '0.5',
  });
  const [ isLoading, setIsLoading ] = React.useState(false);
  const [ faucetTxList, setFaucetTxList ] = React.useState<Array<FaucetTxDataType>>([]);

  const { colorMode } = useColorMode();
  const separatorColor = useColorModeValue('#000', '#fff');
  const separatorInputColor = useColorModeValue('#fff', '#000');
  const separatorBgColor = useColorModeValue('#EBF8FF', '#101112');
  const separatorBorderColor = useColorModeValue('1px solid #EBF8FF', '1px solid #232425');
  const separatorBgBtn = useColorModeValue('#E1E1E1', '#1A2B2C');

  const handleItemClick = React.useCallback(
    (option: DropMenuDataType) => {
      setSelectedItem(option);
    },
    [ setSelectedItem ],
  );

  const handleClick = React.useCallback(
    (option: DropMenuDataType) => () => {
      handleItemClick(option);
    },
    [ handleItemClick ],
  );

  const handleUserInputAddressChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setUserInputAdress(event.target.value as Address);
    },
    [],
  );
  const privateKey = config.isEnabled ? config.privateKey as Address : null;
  // const faucetAccount = privateKeyToAccount(
  //   privateKey as Address,
  // );

  const handleWalletClient = React.useCallback(
    () => {
      if (privateKey !== null) {
        const faucetAccount = privateKeyToAccount(
          privateKey as Address,
        );
        const walletClient = createWalletClient({
          account: faucetAccount,
          chain: pingaksha,
          transport: http(chain.rpcUrl),
        });
        return { walletClient, faucetAccount };
      }
    }, [ privateKey ]);

  const removeExpiredFaucetEntries = React.useCallback(
    () => {
      const twoMinutesAgo = new Date();
      twoMinutesAgo.setHours(twoMinutesAgo.getHours() - 6);

      const updatedFaucetList = faucetTxList.filter((faucet) => new Date(faucet.time) >= twoMinutesAgo,
      );

      // Save the updated list to cookies
      document.cookie = `faucetTxList=${ encodeURIComponent(JSON.stringify(updatedFaucetList)) }`;
      setFaucetTxList(updatedFaucetList);
    }, [ faucetTxList ]);

  const canClaimFaucet = React.useCallback(
    (label: string) => {
      const faucet = faucetTxList.find((faucet) => faucet.label === label) as FaucetTxDataType;
      if (!faucet?.time) {
      // User hasn't claimed before, they can claim now
        return { isCalimed: true, time: new Date(0) };
      }

      const sixHoursAgo = new Date();
      sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

      // Check if the last claim time is more than 6 hours ago
      return { isCalimed: new Date(faucet?.time) < sixHoursAgo, time: new Date(faucet?.time) };
    }, [ faucetTxList ]);

  const sendRama = React.useCallback(
    async(inputAddress: Address) => {
      return await sendTransaction(handleWalletClient()?.walletClient as WalletClient, {
        account: handleWalletClient()?.faucetAccount as PrivateKeyAccount,
        to: inputAddress,
        chain: pingaksha,
        value: parseEther(selectedItem?.value as string),
      });
    }, [ selectedItem?.value, handleWalletClient ]);

  const handleClaimFaucet = React.useCallback(
    async(label: string) => {
      const { isCalimed } = canClaimFaucet(label);
      if (isAddress(userInputAddress) && isCalimed && label === 'RAMA') {
        try {
          setIsLoading(true);
          const txHash = await sendRama(userInputAddress as Address);
          setIsLoading(false);
          const currentTime = new Date();
          // Remove expired entries for the selected label
          removeExpiredFaucetEntries();

          const updatedFaucetList = [ ...faucetTxList, { label: selectedItem?.label, hash: txHash, time: currentTime.toISOString() } ];

          // Save the updated list to cookies
          document.cookie = `faucetTxList=${ encodeURIComponent(JSON.stringify(updatedFaucetList)) }`;
          setFaucetTxList(updatedFaucetList as Array<FaucetTxDataType>);

          openSuccessModal();
        } catch (error) {
          setIsLoading(false);
        }
      }
      if (!isCalimed && isAddress(userInputAddress)) {
        // removeExpiredFaucetEntries();
        openWarningModal(); // Open the modal
      }
    },
    [
      openSuccessModal,
      openWarningModal,
      selectedItem?.label,
      faucetTxList,
      canClaimFaucet,
      sendRama,
      userInputAddress,
      removeExpiredFaucetEntries,
    ]);

  const handleClaimFaucetWithCallback = React.useCallback(
    async(label: string) => {
      await handleClaimFaucet(label);
    }, [ handleClaimFaucet ]);

  const handleClaimFaucetClick = (label: string): React.MouseEventHandler<HTMLButtonElement> => async() => {
    await handleClaimFaucetWithCallback(label);
  };

  const calculateRemainingTime = (lastRequestTime: Date): { hours: number; minutes: number } => {
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

    let remainingTime;

    if (lastRequestTime > sixHoursAgo) {
      // User requested tokens within the last 6 hours
      remainingTime = lastRequestTime.getTime() - sixHoursAgo.getTime();
    } else {
      // User requested tokens more than 6 hours ago, no remaining time
      remainingTime = 0;
    }

    const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));

    return { hours: remainingHours, minutes: remainingMinutes };
  };

  const getTimeSinceClaimed = (lastClaimTime: Date): string => {
    const now = new Date();
    const timeDifference = now.getTime() - lastClaimTime.getTime();

    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${ hours } hours ago`;
    } else if (minutes > 0) {
      return `${ minutes } minutes ago`;
    } else {
      return 'just now';
    }
  };

  type LabelToIcon = 'RAMA' | 'BTC' | 'ETH' | 'USDC' | 'RUSD' | 'DAI'; // Add more labels as needed

  type LabelToIconMap = Record<LabelToIcon, React.ElementType>;

  const ICON_MAP: LabelToIconMap = {
    RAMA: ramaicon,
    BTC: btcicon,
    USDC: usdcicon,
    DAI: daiicon,
    ETH: ethicon,
    RUSD: busdicon,
    // Add more mappings as needed
  };

  const getIconByLabel = (label: LabelToIcon): React.ElementType | null => {
    const IconComponent = ICON_MAP[label];

    return IconComponent || null; // Return null if no matching icon is found
  };

  // React.useEffect(() => {
  //   // Set an interval to clear the cookie every 4 minutes
  //   const intervalId = setInterval(() => {
  //     clearFaucetTxListCookie();
  //     // Force a reload to ensure the cookie is removed from the browser's memory
  //     window.location.reload();
  //   }, 2 * 60 * 1000); // 4 minutes in milliseconds

  //   // Cleanup the interval on component unmount
  //   return () => clearInterval(intervalId);
  // }, []);

  React.useEffect(() => {
    // Load faucet list from cookies on component mount
    const storedFaucetList = document.cookie
      .split('; ')
      .find((row) => row.startsWith('faucetTxList='))
      ?.split('=')[1];

    if (storedFaucetList) {
      const sortedList = [ ...JSON.parse(decodeURIComponent(storedFaucetList)) as Array<FaucetTxDataType> ]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setFaucetTxList(sortedList);
    }
  }, [ faucetTxList.length ]);

  return (
    <Box width="100%" >

      <Center>

        <Icon as={ colorMode === 'light' ? wrama : brama } width={ 320 } height={ 45 } mb="1rem"/>

      </Center>

      <Text>
        <Center>
          Obtain Pingaksha Testnet tokens every 6 hours for seamless and
          confident development.
        </Center>
      </Text>
      <Box

        marginTop="30px"
        bg={ separatorBgColor }
        color={ separatorColor }
        border={ separatorBorderColor }
        borderRadius="12px"
        padding={{ lg: '50px', md: '15px' }}
        // minW={{ base: 'unset', lg: '900px' }}
        data-label="hero plate"
      >
        <Flex position="relative" mb={{ base: 6, lg: 8 }} justifyContent="space-between">
          <FormControl flex="3" mr={ 4 }>
            <FormLabel htmlFor="inputField1">Wallet Address</FormLabel>
            <Input
              id="inputField1"
              placeholder="Enter your RAMA Pingaksha Testnet address"
              bg={ separatorInputColor }
              borderColor="transparent"
              _hover={{
                borderColor: 'transparent',
              }}
              onChange={ handleUserInputAddressChange }
            />
          </FormControl>

          <FormControl flex="1">
            <FormLabel htmlFor="inputField2">Select Token</FormLabel>
            <Menu

              bg="red"
            >
              <MenuButton
                as={ Button }
                colorScheme={ separatorInputColor }
                width="100%"
                p="10px"
                _hover={{
                  background: { separatorInputColor },

                }}
                rightIcon={ <Icon as={ colorMode === 'light' ? arrowb : arroww }/> }

                bg={ separatorInputColor }
                h="60px"

                border="1px"
                borderColor="transparent"
              >
                { selectedItem && (
                  <Flex mt="5px" gap={ 2 }>

                    <Icon as={ selectedItem.icon } width={ 26 } height={ 26 }/>
                    <Text mt="2px">{ selectedItem.value } { selectedItem.label }</Text>
                  </Flex>
                ) }
              </MenuButton>

              <MenuList
                width="347px"
                borderRadius="0px 0px 8px 8px"
                marginTop="-11px"
                _hover={{
                  width: '347px',

                }}

              >
                {
                  dropMenuData.map((item, index) => (
                    <MenuItem
                      key={ index }
                      borderRadius="0px 0px 8px 8px"
                      _hover={{

                      }}
                      onClick={
                        handleClick(item)

                      }
                    >
                      <Box
                        _hover={{
                          background: 'EBF8FF',
                          borderRadius: '6px',
                        }}
                        display="inline-block"
                      >
                        <Flex mt="4px" gap={ 2 }>

                          <Icon as={ item.icon } width={ 26 } height={ 26 }/>
                          <Text mt="2px">{ item.value } { item.label }</Text>
                        </Flex>
                      </Box>
                    </MenuItem>
                  ))
                }

              </MenuList>
            </Menu>

          </FormControl>
        </Flex>
        <>
          {
            selectedItem?.label !== 'RAMA' ? (
              <Button
                // onClick={ handleClaimFaucetClick(selectedItem?.label as string) }
                bg={ separatorBgBtn }
                color={ colorMode === 'light' ? 'blackAlpha.500' : 'ffffff70' }
                w="100%"
                height="60px"
                _hover={{
                  backgroundColor: '#8050DF',
                  color: '#fff',
                }}
                colorScheme="blue"
              >
            Send { selectedItem?.value } { selectedItem?.label } (Coming soon)
              </Button>
            ) : (
              <Button
                onClick={ handleClaimFaucetClick(selectedItem?.label as string) }
                bg={ separatorBgBtn }
                color={ colorMode === 'light' ? 'blackAlpha.500' : 'ffffff70' }
                w="100%"
                height="60px"
                _hover={{
                  backgroundColor: '#8050DF',
                  color: '#fff',
                }}
                colorScheme="blue"
                disabled={ !isAddress(userInputAddress) ? true : false }
              >
            Send { selectedItem?.value } { selectedItem?.label } { (isLoading) && (
                  <Spinner
                    color="#fff"
                    ml={ 2 }
                    size="sm"
                    thickness="2px"
                    speed="0.78s"
                    emptyColor="gray.400"
                  />
                ) }
              </Button>
            )
          }

          { /* Success Modal */ }
          { successModalOpen && (
            <FaucetClaimSuccessModal
              onClose={ closeSuccessModal }
              value={ selectedItem?.value as string }
              label={ selectedItem?.label as string }/>
          )
          }

          { /* Warning Modal */ }
          { warningModalOpen && (
            <FaucetClaimWarningModal
              onClose={ closeWarningModal }
              hours={ calculateRemainingTime(canClaimFaucet(selectedItem?.label as string).time).hours }
              minutes={ calculateRemainingTime(canClaimFaucet(selectedItem?.label as string).time).minutes }/>
          )
          }
        </>
      </Box>

      <Box
        marginTop="30px"
        bg={ separatorBgColor }
        color={ separatorColor }
        border={ separatorBorderColor }
        borderRadius="12px"
        padding={{ lg: '50px', md: '15px' }}

        // minW={{ base: 'unset', lg: '900px' }}
        data-label="hero plate"
      >
        <Flex w="100%" padding="1rem 0rem" bg={ separatorInputColor } borderRadius="8px" display="flex" justifyContent="space-between" alignItems="center">

          <FormLabel
            htmlFor="inputField1"
            marginLeft="20px"
            paddingTop="6px"
            fontFamily="Segoe UI"
          >
            Your Transactions
          </FormLabel>

          <FormLabel
            htmlFor="inputField2"
            paddingTop="6px"
            mr="4rem"
            fontFamily="Segoe UI"

          >
            Time
          </FormLabel>

        </Flex>

        {
          faucetTxList.map((item, index) => (
            <Flex overflowX={
              {
                base: 'scroll',
                sm: 'scroll',
                md: 'scroll',
              }

            }
            padding="0px 15px"
            mt="20px" justifyContent="space-between" key={ index }>
              <Box display="flex"
                alignItems="center"
                gap="1rem"
              >
                <Icon as={ getIconByLabel(item.label as LabelToIcon) as As } width={ 26 } height={ 26 }/>
                <TxEntity hash={ item.hash } noIcon borderBottom="1px"/>
              </Box>
              <Text marginLeft="50px" display="block" width={ 90 }>{ getTimeSinceClaimed(new Date(item.time)) }</Text>
            </Flex>
          ))
        }
      </Box>
      <Accordion mt="2rem" allowToggle>
        <Center>
          <Heading as="h3" mb="2rem">
            FAQs
          </Heading>
        </Center>
        {
          faqData.map((item, index) => (
            <AccordionItem key={ index } border={ separatorBorderColor } borderRadius="8px"

              _hover={{
                backgroundColor: (colorMode === 'light' ? '#EBF8FF' : '#232425'),
              }}

            >
              <h2>
                <AccordionButton fontWeight="bold" padding="1rem" _expanded={{ bg: (colorMode === 'light' ? '#EBF8FF' : '#232425') }} _hover={{
                  backgroundColor: '#fff0',

                }}>
                  <Box as="span" flex="1" textAlign="left"
                  >
                    { item.title }
                  </Box>
                  <AccordionIcon/>
                </AccordionButton>
              </h2>
              <AccordionPanel pb={ 4 } >
                { item.content }
              </AccordionPanel>
            </AccordionItem>
          ))
        }
      </Accordion>

    </Box>
  );
};

const FaucetClaimWarningModal = ({ onClose, hours, minutes }: { onClose: () => void; hours: number; minutes: number }) => {
  const { colorMode } = useColorMode();
  const separatorBgBtn = useColorModeValue('black', '#1A2B2C');
  return (
    <Modal isOpen={ true } onClose={ onClose }>
      <ModalOverlay/>
      <ModalContent maxW="500px">

        <ModalCloseButton _hover={{ color: '#8050DF' }}/>
        <ModalHeader mb={ 1 }>
          <Center><Icon as={ qsign } width={ 100 } height={ 100 } mb="2rem"/></Center>
          <Center>Wait a Little</Center>
        </ModalHeader>
        <ModalBody>
          <Center textAlign="center" fontWeight={ 1000 }>
          You have requested tokens in the last 6 hours
            <br/>
          Please wait { hours } hours { minutes } minutes
            <br/>
          trying again.
          </Center>
        </ModalBody>

        <ModalFooter>
          <Center>
            <Button
              color={ colorMode === 'light' ? '#fff' : '#ffffff70' }
              colorScheme="blue"
              mr={ 3 }
              onClick={ onClose }
              w="440px"
              fontSize="20px"
              bg={ separatorBgBtn }
              maxH="400px"
              padding="1rem 0rem"
              _hover={{
                backgroundColor: '#8050DF',
                color: '#fff',
              }}
            >
            ok
            </Button>
          </Center>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const FaucetClaimSuccessModal = ({ onClose, value, label }: { onClose: () => void; value: string; label: string }) => {
  const { colorMode } = useColorMode();
  const separatorBgBtn = useColorModeValue('black', '#1A2B2C');
  return (
    <Modal isOpen={ true } onClose={ onClose }>
      <ModalOverlay/>
      <ModalContent maxW="500px">

        <ModalCloseButton _hover={{ color: '#8050DF' }}/>
        <ModalHeader mb={ 1 }>
          <Center><Icon as={ qsign } width={ 100 } height={ 100 } mb="2rem"/></Center>
          <Center>You got { value } { label }</Center>
        </ModalHeader>
        <ModalBody>
          <Center textAlign="center" fontWeight={ 1000 }>
        You can request for another RAMA in 6 hours.
          </Center>
        </ModalBody>
        <ModalFooter>
          <Center>
            <Button
              color={ colorMode === 'light' ? '#fff' : '#ffffff70' }
              colorScheme="blue"
              mr={ 3 }
              onClick={ onClose }
              w="440px"
              fontSize="20px"
              bg={ separatorBgBtn }
              maxH="400px"
              padding="1rem 0rem"
              _hover={{
                backgroundColor: '#8050DF',
                color: '#fff',
              }}
            >
            View Transaction
            </Button>
          </Center>
        </ModalFooter>
      </ModalContent >
    </Modal >
  );
};
export default Faucet;

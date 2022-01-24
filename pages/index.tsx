import type { NextPage } from 'next';
import Head from 'next/head';
import { Input, SimpleGrid, Box, Heading } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
const Stage = dynamic(() => import('../components/Stage'), { ssr: false });
const Home: NextPage = () => {
  const [current, setCurrent] = useState('nyse:rblx');
  const debouncedUniqueSymbol = useDebounce(current, 1000);
  return (
    <>
      <Head>
        <title>Cool App Name</title>
      </Head>
      <SimpleGrid columns={2} spacing="40px">
        <Box>
          <Heading>Cool App Name</Heading>
          <Input
            placeholder="Basic example"
            value={current}
            size="lg"
            onChange={(event) => {
              setCurrent(event.target.value);
            }}
          />
        </Box>
        <Box>
          <Stage uniqueSymbol={debouncedUniqueSymbol} />
        </Box>
      </SimpleGrid>
    </>
  );
};

// Hook
function useDebounce(value: any, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}

export default Home;

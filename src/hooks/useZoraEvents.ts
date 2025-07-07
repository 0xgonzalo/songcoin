import { useState, useEffect } from 'react';
import { Address, createPublicClient, http, AbiEvent, Log, custom } from 'viem';
import { base } from 'viem/chains';
import { getIpfsUrl } from '~/lib/pinataService';
import axios from 'axios';

// Zora factory address on Base mainnet
const ZORA_FACTORY_ADDRESS = '0x777777751622c0d3258f214F9DF38E35BF45baF3' as Address;

// Platform referrer address we're filtering for
const PLATFORM_REFERRER = '0x32C8ACD3118766CBE5c3E45a44BCEDde953EF627' as Address;

// ABI for the CoinCreated event
const COIN_CREATED_EVENT: AbiEvent = {
  anonymous: false,
  inputs: [
    { indexed: true, name: 'caller', type: 'address' },
    { indexed: true, name: 'payoutRecipient', type: 'address' },
    { indexed: true, name: 'platformReferrer', type: 'address' },
    { indexed: false, name: 'currency', type: 'address' },
    { indexed: false, name: 'uri', type: 'string' },
    { indexed: false, name: 'name', type: 'string' },
    { indexed: false, name: 'symbol', type: 'string' },
    { indexed: false, name: 'coin', type: 'address' },
    { indexed: false, name: 'pool', type: 'address' },
    { indexed: false, name: 'version', type: 'string' }
  ],
  name: 'CoinCreated',
  type: 'event'
};

export interface MusicCoin {
  coinAddress: Address;
  name: string;
  symbol: string;
  description: string;
  artistName: string;
  artistAddress: Address;
  coverArt: string;
  audioUrl?: string;
  metadata?: any;
}

// Custom transport that uses our API proxy
const proxyTransport = custom({
  async request({ method, params }) {
    try {
      const response = await axios.post('/api/rpc', {
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      });
      
      // Check if the response contains errors or missing results
      if (response.data.error) {
        console.error('RPC Error:', response.data.error);
        throw new Error(response.data.error.message || 'RPC request failed');
      }
      
      // Make sure result is properly defined
      if (response.data.result === undefined) {
        console.error('Empty RPC result for method:', method);
        // For getLogs specifically, return an empty array instead of undefined
        if (method === 'eth_getLogs') {
          return [];
        }
        // For other methods, return a suitable default or throw
        throw new Error('Empty result from RPC endpoint');
      }
      
      return response.data.result;
    } catch (error) {
      console.error('Error with proxy transport:', error);
      
      // Return empty array for getLogs to prevent mapping errors
      if (method === 'eth_getLogs') {
        console.log('Returning empty array for failed getLogs request');
        return [];
      }
      
      throw error;
    }
  },
});

// Create a public client for Base mainnet with our proxy transport
const publicClient = createPublicClient({
  chain: base,
  transport: proxyTransport,
  batch: {
    multicall: true
  }
});

// Pagination constants for getLogs
const BLOCKS_PER_BATCH = 950; // Limited to 1000 blocks per batch as required by RPC provider
const START_BLOCK = BigInt(30146328); // Start from a more recent block to find the latest coins
// Known block where a specific coin may be
const KNOWN_COIN_BLOCKS = [
  BigInt(30146328)
];

// Add these constants at the top with other constants
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const PARALLEL_BATCHES = 3; // Number of parallel batches to process

// Add this interface before the useZoraEvents function
interface CacheEntry {
  data: any[];
  timestamp: number;
}

// Add this before the useZoraEvents function
const eventCache: Record<string, CacheEntry> = {};

export async function fetchTrackMetadata(metadataURI: string): Promise<any> {
  try {
    if (!metadataURI) {
      console.error('Empty URI provided to fetchTrackMetadata');
      return null;
    }
    
    // Try up to 3 times to fetch metadata with exponential backoff
    const MAX_RETRIES = 5;
    let attempt = 0;
    let lastError = null;
    
    while (attempt < MAX_RETRIES) {
      try {
        // Convert IPFS URI to HTTP URL if needed
        let uri = metadataURI;
        if (uri.startsWith('ipfs://')) {
          uri = getIpfsUrl(uri);
        }
        
        console.log(`Fetching metadata attempt ${attempt + 1} from: ${uri}`);
        const response = await axios.get(uri, { timeout: 15000 });
        return response.data;
      } catch (error) {
        console.error(`Metadata fetch attempt ${attempt + 1} failed:`, error);
        lastError = error;
        
        // Wait before retry with exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      }
    }
    
    // If we get here, all retries failed
    console.error(`Failed to fetch metadata after ${MAX_RETRIES} attempts:`, lastError);
    return null;
  } catch (error) {
    console.error('Error in fetchTrackMetadata:', error);
    return null;
  }
}

export function useZoraEvents() {
  const [coins, setCoins] = useState<MusicCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);

  // Function to get logs in paginated batches
  const getPaginatedLogs = async () => {
    try {
      setProgressMessage('Getting latest block number...');
      
      // Get the current latest block number dynamically instead of using a hardcoded value
      let latestBlock;
      try {
        const blockNumber = await publicClient.getBlockNumber();
        latestBlock = blockNumber;
        console.log('Latest block fetched dynamically:', latestBlock.toString());
      } catch (blockError) {
        console.error('Error fetching latest block, using fallback:', blockError);
        const blockNumber = await publicClient.getBlockNumber();
        latestBlock = blockNumber;
      }
      
      // Calculate number of batches needed
      let currentBlock = START_BLOCK;
      const allLogs: any[] = [];
      
      // Process in batches until we reach the latest block
      // This approach is more efficient now with our proxy and caching layer
      let batchCount = 0;
      let consecutiveEmptyBatches = 0;
      
      // First prioritize scanning known blocks where coins may exist
      for (const knownBlock of KNOWN_COIN_BLOCKS) {
        if (knownBlock >= START_BLOCK && knownBlock <= latestBlock) {
          const startKnownBlock = knownBlock;
          const endKnownBlock = knownBlock + BigInt(BLOCKS_PER_BATCH);
          
          setProgressMessage(`Scanning known coin blocks: ${startKnownBlock} - ${endKnownBlock}`);
          
          try {
            const logs = await publicClient.getLogs({
              address: ZORA_FACTORY_ADDRESS,
              event: COIN_CREATED_EVENT,
              args: {
                platformReferrer: PLATFORM_REFERRER,
              },
              fromBlock: startKnownBlock,
              toBlock: endKnownBlock > latestBlock ? latestBlock : endKnownBlock,
            });
            
            if (logs.length > 0) {
              console.log(`Found ${logs.length} coin creation events in known blocks`);
              allLogs.push(...logs);
            }
          } catch (error) {
            console.error('Error fetching logs from known blocks:', error);
          }
        }
      }
      
      // Now scan more recent blocks in batches
      while (currentBlock <= latestBlock && batchCount < 10) { // Limit to prevent infinite loops
        const endBlock = currentBlock + BigInt(BLOCKS_PER_BATCH);
        const actualEndBlock = endBlock > latestBlock ? latestBlock : endBlock;
        
        setProgressMessage(`Scanning blocks ${currentBlock} - ${actualEndBlock} (batch ${batchCount + 1})`);
        
        try {
          const logs = await publicClient.getLogs({
            address: ZORA_FACTORY_ADDRESS,
            event: COIN_CREATED_EVENT,
            args: {
              platformReferrer: PLATFORM_REFERRER,
            },
            fromBlock: currentBlock,
            toBlock: actualEndBlock,
          });
          
          if (logs.length > 0) {
            console.log(`Found ${logs.length} coin creation events in batch ${batchCount + 1}`);
            allLogs.push(...logs);
            consecutiveEmptyBatches = 0;
          } else {
            consecutiveEmptyBatches++;
            console.log(`No events found in batch ${batchCount + 1}, consecutive empty batches: ${consecutiveEmptyBatches}`);
          }
          
          // If we've had several consecutive empty batches, stop scanning older blocks
          if (consecutiveEmptyBatches >= 5) {
            console.log('Stopping scan due to consecutive empty batches');
            break;
          }
          
        } catch (error) {
          console.error(`Error fetching logs for batch ${batchCount + 1}:`, error);
          // Continue with next batch even if one fails
        }
        
        currentBlock = actualEndBlock + BigInt(1);
        batchCount++;
        
        // Add a small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`Total logs found: ${allLogs.length}`);
      setProgressMessage(`Found ${allLogs.length} coin creation events`);
      
      return allLogs;
      
    } catch (error) {
      console.error('Error in getPaginatedLogs:', error);
      throw error;
    }
  };

  // Function to process logs and create coin objects
  const processLogs = async (logs: any[]) => {
    setProgressMessage('Processing coin data...');
    
    const processedCoins: MusicCoin[] = [];
    
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const logIndex = i + 1;
      
      try {
        setProgressMessage(`Processing coin ${logIndex}/${logs.length}: ${log.args.name}`);
        
        // Extract basic info from the log
        const coinAddress = log.args.coin as Address;
        const name = log.args.name as string;
        const symbol = log.args.symbol as string;
        const uri = log.args.uri as string;
        const artistAddress = log.args.payoutRecipient as Address;
        
        // Fetch metadata
        const metadata = await fetchTrackMetadata(uri);
        
        let description = '';
        let artistName = 'Unknown Artist';
        let coverArt = '/examples/default-cover.jpg';
        let audioUrl = '';
        
        if (metadata) {
          description = metadata.description || '';
          artistName = metadata.artist || 'Unknown Artist';
          
          // Extract image and audio URLs
          if (metadata.image) {
            coverArt = metadata.image.startsWith('ipfs://') 
              ? getIpfsUrl(metadata.image) 
              : metadata.image;
          }
          
          if (metadata.animation_url) {
            audioUrl = metadata.animation_url.startsWith('ipfs://') 
              ? getIpfsUrl(metadata.animation_url) 
              : metadata.animation_url;
          }
        }
        
        // Create coin object
        const coin: MusicCoin = {
          coinAddress,
          name,
          symbol,
          description,
          artistName,
          artistAddress,
          coverArt,
          audioUrl,
          metadata
        };
        
        processedCoins.push(coin);
        
      } catch (error) {
        console.error(`Error processing log ${logIndex}:`, error);
        // Continue processing other logs even if one fails
      }
    }
    
    return processedCoins;
  };

  // Main function to fetch coins
  const fetchCoins = async () => {
    try {
      setLoading(true);
      setError(null);
      setProgressMessage('Starting coin discovery...');
      
      // Check cache first
      const cacheKey = 'zora-events';
      const cachedData = eventCache[cacheKey];
      
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        console.log('Using cached coin data');
        setCoins(cachedData.data);
        setLoading(false);
        setProgressMessage(null);
        return;
      }
      
      // Fetch logs
      const logs = await getPaginatedLogs();
      
      if (logs.length === 0) {
        console.log('No coin creation events found');
        setCoins([]);
        setLoading(false);
        setProgressMessage(null);
        return;
      }
      
      // Process logs into coin objects
      const processedCoins = await processLogs(logs);
      
      // Cache the results
      eventCache[cacheKey] = {
        data: processedCoins,
        timestamp: Date.now()
      };
      
      setCoins(processedCoins);
      setProgressMessage(null);
      
    } catch (error) {
      console.error('Error fetching coins:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch coins'));
      setProgressMessage(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh coins manually
  const refreshCoins = async () => {
    // Clear cache
    delete eventCache['zora-events'];
    await fetchCoins();
  };

  // Initial fetch
  useEffect(() => {
    fetchCoins();
  }, []);

  // Retry mechanism
  useEffect(() => {
    if (error && retryCount < 3) {
      const timeout = setTimeout(() => {
        console.log(`Retrying fetch, attempt ${retryCount + 1}`);
        setRetryCount(prev => prev + 1);
        fetchCoins();
      }, 2000 * Math.pow(2, retryCount)); // Exponential backoff
      
      return () => clearTimeout(timeout);
    }
  }, [error, retryCount]);

  return {
    coins,
    loading,
    error,
    refreshCoins,
    progressMessage
  };
} 
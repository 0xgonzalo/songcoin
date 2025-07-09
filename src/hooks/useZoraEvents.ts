import { useState, useEffect, useCallback } from 'react';
import { Address, createPublicClient, AbiEvent, custom } from 'viem';
import { base } from 'viem/chains';
import { getIpfsUrl } from '~/lib/pinataService';
import axios from 'axios';

// Zora factory address on Base mainnet
const ZORA_FACTORY_ADDRESS = '0x777777751622c0d3258f214F9DF38E35BF45baF3' as Address;

// Platform referrer address we're filtering for
const PLATFORM_REFERRER = '0x79166ff20D3C3276b42eCE079a50C30b603167a6' as Address;

// ABI for the CoinCreatedV4 event (updated to V4)
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
    { indexed: false, name: 'poolKey', type: 'tuple', components: [
      { name: 'currency0', type: 'address' },
      { name: 'currency1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickSpacing', type: 'int24' },
      { name: 'hooks', type: 'address' }
    ]},
    { indexed: false, name: 'poolKeyHash', type: 'bytes32' },
    { indexed: false, name: 'version', type: 'string' }
  ],
  name: 'CoinCreatedV4',
  type: 'event'
};

interface TrackMetadata {
  description?: string;
  artist?: string;
  image?: string;
  animation_url?: string;
  [key: string]: unknown;
}

// Types for Zora CoinCreatedV4 event arguments
interface PoolKey {
  currency0: Address;
  currency1: Address;
  fee: number;
  tickSpacing: number;
  hooks: Address;
}

interface CoinCreatedV4Args {
  caller: Address;
  payoutRecipient: Address;
  platformReferrer: Address;
  currency: Address;
  uri: string;
  name: string;
  symbol: string;
  coin: Address;
  poolKey: PoolKey;
  poolKeyHash: string;
  version: string;
}

interface LogWithArgs {
  blockNumber: bigint;
  transactionHash: string;
  args: CoinCreatedV4Args;
}

export interface MusicCoin {
  coinAddress: Address;
  name: string;
  symbol: string;
  description: string;
  artistName: string;
  artistAddress: Address;
  coverArt: string;
  audioUrl?: string;
  metadata?: TrackMetadata;
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
const START_BLOCK = BigInt(32617766); // Start from block 22836206 as requested

// Debug: Function to clear cache manually
export const clearCoinCache = () => {
  console.log('🗑️ Clearing coin cache...');
  Object.keys(eventCache).forEach(key => {
    delete eventCache[key];
  });
};

// Add these constants at the top with other constants
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Add this interface before the useZoraEvents function
interface CacheEntry {
  data: MusicCoin[];
  timestamp: number;
}

// Add this before the useZoraEvents function
const eventCache: Record<string, CacheEntry> = {};

export async function fetchTrackMetadata(metadataURI: string): Promise<TrackMetadata | null> {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allLogs: any[] = [];
      
      // Process in batches until we reach the latest block
      // This approach is more efficient now with our proxy and caching layer
      let batchCount = 0;
      let consecutiveEmptyBatches = 0;
      
      // First, do a broader search around the target block
      const targetBlock = BigInt(32617767);
      const searchRange = BigInt(100); // Search 100 blocks before and after
      const searchStart = targetBlock - searchRange > START_BLOCK ? targetBlock - searchRange : START_BLOCK;
      const searchEnd = targetBlock + searchRange < latestBlock ? targetBlock + searchRange : latestBlock;
      
      if (searchStart <= latestBlock && searchEnd >= START_BLOCK) {
        console.log(`🎯 Broader search for token around block 32617767 (searching ${searchStart} to ${searchEnd})...`);
        setProgressMessage(`Broader search around block 32617767...`);
        
        try {
          const broadLogs = await publicClient.getLogs({
            address: ZORA_FACTORY_ADDRESS,
            event: COIN_CREATED_EVENT,
            args: {
              platformReferrer: PLATFORM_REFERRER,
            },
            fromBlock: searchStart,
            toBlock: searchEnd,
          });
          
          if (broadLogs.length > 0) {
            console.log(`🎉 BROADER SEARCH SUCCESS: Found ${broadLogs.length} events in range ${searchStart} to ${searchEnd}!`);
            console.log(`📋 Broader search events:`, broadLogs.map(log => ({
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              name: (log as unknown as LogWithArgs).args.name,
              symbol: (log as unknown as LogWithArgs).args.symbol,
              coin: (log as unknown as LogWithArgs).args.coin,
              platformReferrer: (log as unknown as LogWithArgs).args.platformReferrer
            })));
            allLogs.push(...broadLogs);
          } else {
            console.log(`❌ Broader search: No events found in range ${searchStart} to ${searchEnd} with platform referrer ${PLATFORM_REFERRER}`);
            
            // Try querying without platform referrer filter to see if there are ANY events in this range
            const allEventsInRange = await publicClient.getLogs({
              address: ZORA_FACTORY_ADDRESS,
              event: COIN_CREATED_EVENT,
              fromBlock: searchStart,
              toBlock: searchEnd,
            });
            
            if (allEventsInRange.length > 0) {
              console.log(`🔍 Found ${allEventsInRange.length} total CoinCreated events in range ${searchStart} to ${searchEnd} with different platform referrers:`);
              allEventsInRange.forEach(log => {
                console.log(`- Block: ${log.blockNumber}, Platform referrer: ${(log as unknown as LogWithArgs).args.platformReferrer}, Name: ${(log as unknown as LogWithArgs).args.name}`);
              });
            } else {
              console.log(`❌ Range ${searchStart} to ${searchEnd} has NO CoinCreated events at all`);
            }
          }
        } catch (error) {
          console.error(`❌ Error in broader search around block 32617767:`, error);
        }
      }
      
      // Search for ANY recent CoinCreated events to verify the system is working
      const recentStart = latestBlock - BigInt(1000); // Last 1000 blocks
      console.log(`🔍 Searching for ANY CoinCreated events in recent blocks ${recentStart} to ${latestBlock}...`);
      setProgressMessage(`Searching for any recent coin creation events...`);
      
      try {
        const recentEvents = await publicClient.getLogs({
          address: ZORA_FACTORY_ADDRESS,
          event: COIN_CREATED_EVENT,
          fromBlock: recentStart,
          toBlock: latestBlock,
        });
        
        if (recentEvents.length > 0) {
          console.log(`📊 Found ${recentEvents.length} total CoinCreated events in recent blocks:`);
          recentEvents.forEach((log, index) => {
            if (index < 5) { // Show first 5 events
              console.log(`  ${index + 1}. Block: ${log.blockNumber}, Platform: ${(log as unknown as LogWithArgs).args.platformReferrer}, Name: ${(log as unknown as LogWithArgs).args.name}`);
            }
          });
          if (recentEvents.length > 5) {
            console.log(`  ... and ${recentEvents.length - 5} more events`);
          }
        } else {
          console.log(`❌ NO CoinCreated events found in recent blocks ${recentStart} to ${latestBlock}`);
          console.log(`⚠️  This could indicate an RPC issue or no coins are being created at all`);
        }
      } catch (error) {
        console.error(`❌ Error searching for recent events:`, error);
      }
      
      // Also do the direct query for the specific block
      if (targetBlock >= START_BLOCK && targetBlock <= latestBlock) {
        console.log(`🎯 Direct query for block 32617767 where token should be...`);
        setProgressMessage(`Direct scan of block 32617767...`);
        
        try {
          const directLogs = await publicClient.getLogs({
            address: ZORA_FACTORY_ADDRESS,
            event: COIN_CREATED_EVENT,
            args: {
              platformReferrer: PLATFORM_REFERRER,
            },
            fromBlock: targetBlock,
            toBlock: targetBlock,
          });
          
          if (directLogs.length > 0) {
            console.log(`🎉 DIRECT QUERY SUCCESS: Found ${directLogs.length} events in block 32617767!`);
            console.log(`📋 Direct query events:`, directLogs.map(log => ({
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              name: (log as unknown as LogWithArgs).args.name,
              symbol: (log as unknown as LogWithArgs).args.symbol,
              coin: (log as unknown as LogWithArgs).args.coin,
              platformReferrer: (log as unknown as LogWithArgs).args.platformReferrer
            })));
            allLogs.push(...directLogs);
          } else {
            console.log(`❌ Direct query: No events found in block 32617767 with platform referrer ${PLATFORM_REFERRER}`);
            
            // Try querying without platform referrer filter to see if there are ANY events
            const allEventsInBlock = await publicClient.getLogs({
              address: ZORA_FACTORY_ADDRESS,
              event: COIN_CREATED_EVENT,
              fromBlock: targetBlock,
              toBlock: targetBlock,
            });
            
            if (allEventsInBlock.length > 0) {
              console.log(`🔍 Block 32617767 has ${allEventsInBlock.length} total CoinCreated events with different platform referrers:`);
              allEventsInBlock.forEach(log => {
                console.log(`- Platform referrer: ${(log as unknown as LogWithArgs).args.platformReferrer}, Name: ${(log as unknown as LogWithArgs).args.name}`);
              });
            } else {
              console.log(`❌ Block 32617767 has NO CoinCreated events at all`);
            }
          }
        } catch (error) {
          console.error(`❌ Error in direct query for block 32617767:`, error);
        }
      }
      
      // Now scan blocks in batches (removed consecutive empty batch stopping condition)
      while (currentBlock <= latestBlock && batchCount < 30) { // Increased batch limit
        const endBlock = currentBlock + BigInt(BLOCKS_PER_BATCH);
        const actualEndBlock = endBlock > latestBlock ? latestBlock : endBlock;
        
        setProgressMessage(`Scanning blocks ${currentBlock} - ${actualEndBlock} (batch ${batchCount + 1})`);
        console.log(`🔍 Scanning blocks ${currentBlock} - ${actualEndBlock} (batch ${batchCount + 1})`);
        
        // Special logging for the specific block where token should be
        if (currentBlock <= BigInt(32617767) && actualEndBlock >= BigInt(32617767)) {
          console.log(`🎯 This batch includes block 32617767 where token should be!`);
        }
        
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
            console.log(`✅ Found ${logs.length} coin creation events in batch ${batchCount + 1}`);
            console.log(`📋 Events details:`, logs.map(log => ({
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              name: (log as unknown as LogWithArgs).args.name,
              symbol: (log as unknown as LogWithArgs).args.symbol,
              coin: (log as unknown as LogWithArgs).args.coin,
              platformReferrer: (log as unknown as LogWithArgs).args.platformReferrer
            })));
            allLogs.push(...logs);
            consecutiveEmptyBatches = 0;
          } else {
            consecutiveEmptyBatches++;
            console.log(`❌ No events found in batch ${batchCount + 1} (blocks ${currentBlock} - ${actualEndBlock}), consecutive empty batches: ${consecutiveEmptyBatches}`);
          }
          
        } catch (error) {
          console.error(`❌ Error fetching logs for batch ${batchCount + 1}:`, error);
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
  const processLogs = async (logs: LogWithArgs[]) => {
    setProgressMessage('Processing coin data...');
    
    const processedCoins: MusicCoin[] = [];
    
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i] as unknown as LogWithArgs;
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
          description = (metadata.description as string) || '';
          artistName = (metadata.artist as string) || 'Unknown Artist';
          
          // Extract image and audio URLs
          if (metadata.image && typeof metadata.image === 'string') {
            coverArt = metadata.image.startsWith('ipfs://') 
              ? getIpfsUrl(metadata.image) 
              : metadata.image;
          }
          
          if (metadata.animation_url && typeof metadata.animation_url === 'string') {
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
          metadata: metadata || undefined
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
  const fetchCoins = useCallback(async () => {
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
      
      // Deduplicate coins by coinAddress to prevent React key conflicts
      const uniqueCoins = processedCoins.filter((coin, index, self) => 
        index === self.findIndex(c => c.coinAddress === coin.coinAddress)
      );
      
      if (processedCoins.length !== uniqueCoins.length) {
        console.log(`🔄 Deduplication: Reduced ${processedCoins.length} coins to ${uniqueCoins.length} unique coins`);
      }
      
      // Cache the results
      eventCache[cacheKey] = {
        data: uniqueCoins,
        timestamp: Date.now()
      };
      
      setCoins(uniqueCoins);
      setProgressMessage(null);
      
    } catch (error) {
      console.error('Error fetching coins:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch coins'));
      setProgressMessage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh coins manually
  const refreshCoins = async () => {
    // Clear cache
    delete eventCache['zora-events'];
    await fetchCoins();
  };

  // Initial fetch
  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

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
  }, [error, retryCount, fetchCoins]);

  return {
    coins,
    loading,
    error,
    refreshCoins,
    progressMessage,
    clearCoinCache
  };
} 
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Base mainnet RPC endpoint - you can configure this
const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org';

export async function POST(request: NextRequest) {
  let body: unknown = null;
  
  try {
    body = await request.json();
    
    // Type guard for body
    if (!body || typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { error: 'Invalid JSON-RPC request format' },
        { status: 400 }
      );
    }
    
    // Validate the request format
    if (!('jsonrpc' in body) || !('method' in body) || !('id' in body)) {
      return NextResponse.json(
        { error: 'Invalid JSON-RPC request format' },
        { status: 400 }
      );
    }

    console.log('RPC Proxy Request:', {
      method: body.method,
      params: 'params' in body && body.params ? (Array.isArray(body.params) ? body.params.length : 'object') : 'none',
      id: body.id
    });

    // Forward the request to the Base RPC endpoint
    const response = await axios.post(BASE_RPC_URL, body, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    // Log successful responses (but not the full data for large responses)
    if (response.data.result !== undefined) {
      console.log('RPC Proxy Success:', {
        method: 'method' in body ? body.method : 'unknown',
        id: 'id' in body ? body.id : null,
        hasResult: !!response.data.result
      });
    }

    // Return the response from the RPC endpoint
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('RPC Proxy Error:', {
      method: body && typeof body === 'object' && body !== null && 'method' in body ? body.method : 'unknown',
      error: error instanceof Error ? error.message : String(error),
      status: error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'status' in error.response ? 
        error.response.status : undefined
    });

    // Handle different types of errors
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response) {
      // Forward RPC errors from the upstream provider
      return NextResponse.json(error.response.data, {
        status: error.response && typeof error.response === 'object' && 'status' in error.response && 
          typeof error.response.status === 'number' ? error.response.status : 500
      });
    } else if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED') {
      // Timeout error
      return NextResponse.json(
        { 
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Request timeout'
          },
          id: body && typeof body === 'object' && body !== null && 'id' in body ? body.id : null
        },
        { status: 408 }
      );
    } else {
      // Generic error
      return NextResponse.json(
        { 
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Internal RPC proxy error'
          },
          id: body && typeof body === 'object' && body !== null && 'id' in body ? body.id : null
        },
        { status: 500 }
      );
    }
  }
} 
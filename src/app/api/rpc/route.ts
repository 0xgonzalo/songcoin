import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Base mainnet RPC endpoint - you can configure this
const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org';

export async function POST(request: NextRequest) {
  let body: any = null;
  
  try {
    body = await request.json();
    
    // Validate the request format
    if (!body.jsonrpc || !body.method || !body.id) {
      return NextResponse.json(
        { error: 'Invalid JSON-RPC request format' },
        { status: 400 }
      );
    }

    console.log('RPC Proxy Request:', {
      method: body.method,
      params: body.params ? (Array.isArray(body.params) ? body.params.length : 'object') : 'none',
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
        method: body.method,
        id: body.id,
        hasResult: !!response.data.result
      });
    }

    // Return the response from the RPC endpoint
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('RPC Proxy Error:', {
      method: body?.method || 'unknown',
      error: error.message || error.toString(),
      status: error.response?.status
    });

    // Handle different types of errors
    if (error.response?.data) {
      // Forward RPC errors from the upstream provider
      return NextResponse.json(error.response.data, {
        status: error.response.status || 500
      });
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      return NextResponse.json(
        { 
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Request timeout'
          },
          id: body?.id || null
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
          id: body?.id || null
        },
        { status: 500 }
      );
    }
  }
} 
import { useAccount, useSignMessage } from 'wagmi';
import { useCallback } from 'react';

// Authentication configuration
export const AUTH_CONFIG = {
  message: 'Welcome to VoteVision! Sign this message to authenticate and participate in video creation voting.',
  domain: typeof window !== 'undefined' ? window.location.host : 'votevision.app',
};

// Authentication hooks
export function useWalletAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const authenticate = useCallback(async () => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Create authentication message
      const message = `${AUTH_CONFIG.message}\n\nAddress: ${address}\nTimestamp: ${Date.now()}`;

      // Sign the message
      const signature = await signMessageAsync({ message });

      // Verify the signature (basic check)
      const isValid = await verifySignature(message, signature, address);

      if (!isValid) {
        throw new Error('Signature verification failed');
      }

      // Store authentication data
      const authData = {
        address,
        signature,
        message,
        timestamp: Date.now(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('votevision_auth', JSON.stringify(authData));
      }

      return authData;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }, [address, isConnected, signMessageAsync]);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('votevision_auth');
    }
  }, []);

  const getStoredAuth = useCallback(() => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem('votevision_auth');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to parse stored auth:', error);
      return null;
    }
  }, []);

  const isAuthenticated = useCallback(() => {
    const auth = getStoredAuth();
    if (!auth || !address) return false;

    // Check if auth is for current address
    if (auth.address.toLowerCase() !== address.toLowerCase()) {
      logout(); // Clear invalid auth
      return false;
    }

    // Check if auth is expired (24 hours)
    const age = Date.now() - auth.timestamp;
    if (age > 24 * 60 * 60 * 1000) {
      logout(); // Clear expired auth
      return false;
    }

    return true;
  }, [address, getStoredAuth, logout]);

  return {
    authenticate,
    logout,
    isAuthenticated,
    getStoredAuth,
    address,
    isConnected,
  };
}

/**
 * Verify a signature against a message and address
 */
export async function verifySignature(
  message: string,
  signature: string,
  address: string
): Promise<boolean> {
  try {
    // Import ethers dynamically to avoid SSR issues
    const { ethers } = await import('ethers');

    // Recover the address from the signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    // Compare addresses (case-insensitive)
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Get user profile from authentication data
 */
export function getUserProfile(authData: any) {
  if (!authData) return null;

  return {
    address: authData.address,
    isAuthenticated: true,
    authTimestamp: authData.timestamp,
  };
}

/**
 * Check if user has premium features access
 */
export function hasPremiumAccess(address: string): boolean {
  // In a real app, this would check against a database or smart contract
  // For now, return false for all users
  return false;
}

/**
 * Get user's voting power
 */
export function getVotingPower(address: string): number {
  // Basic voting power - could be enhanced with token holdings, reputation, etc.
  const basePower = 1;

  if (hasPremiumAccess(address)) {
    return basePower * 2; // Premium users get 2x voting power
  }

  return basePower;
}

/**
 * Authentication middleware for API routes
 */
export function requireAuth(request: Request) {
  // Get authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Decode and verify JWT token (implement proper JWT verification)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    // Check token expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }

    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Create JWT token for authenticated users
 */
export function createAuthToken(payload: any): string {
  // In production, use a proper JWT library with secret signing
  // For now, create a simple encoded token
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);

  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + (24 * 60 * 60), // 24 hours
  };

  // Simple base64 encoding (not secure for production)
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');

  // Create signature (simplified - use proper HMAC in production)
  const signature = Buffer.from(`${encodedHeader}.${encodedPayload}`).toString('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Wallet connection utilities
 */
export const WALLET_CONFIG = {
  supportedChains: [1, 137, 42161, 10, 8453], // Ethereum, Polygon, Arbitrum, Optimism, Base
  defaultChain: 8453, // Base
  rpcUrls: {
    1: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    137: 'https://polygon-rpc.com',
    42161: 'https://arb1.arbitrum.io/rpc',
    10: 'https://mainnet.optimism.io',
    8453: 'https://mainnet.base.org',
  },
  blockExplorers: {
    1: 'https://etherscan.io',
    137: 'https://polygonscan.com',
    42161: 'https://arbiscan.io',
    10: 'https://optimistic.etherscan.io',
    8453: 'https://basescan.org',
  },
};


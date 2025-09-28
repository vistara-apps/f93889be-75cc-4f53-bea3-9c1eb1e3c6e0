import { ethers } from 'ethers';
import VoteVisionABI from '../contracts/VoteVision.json';

// Contract configuration
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
export const CONTRACT_ABI = VoteVisionABI.abi;

// Contract types
export interface PromptData {
  id: number;
  creator: string;
  promptText: string;
  category: string;
  createdAt: number;
  votesUp: number;
  votesDown: number;
  isActive: boolean;
  status: string;
  generatedVideoUrl: string;
}

export interface VoteData {
  isUpvote: boolean;
  weight: number;
  timestamp: number;
}

/**
 * Get contract instance
 */
export function getContract(signer?: ethers.Signer): ethers.Contract {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }

  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'
  );

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer || provider
  );
}

/**
 * Create a new prompt on-chain
 */
export async function createPrompt(
  signer: ethers.Signer,
  promptText: string,
  category: string
): Promise<number> {
  const contract = getContract(signer);

  const tx = await contract.createPrompt(promptText, category);
  const receipt = await tx.wait();

  // Extract prompt ID from event
  const event = receipt.events?.find((e: any) => e.event === 'PromptCreated');
  if (!event) {
    throw new Error('Prompt creation event not found');
  }

  return event.args.promptId.toNumber();
}

/**
 * Cast a vote on a prompt
 */
export async function castVote(
  signer: ethers.Signer,
  promptId: number,
  isUpvote: boolean,
  weight: number = 1
): Promise<void> {
  const contract = getContract(signer);

  const tx = await contract.castVote(promptId, isUpvote, weight);
  await tx.wait();
}

/**
 * Get prompt data from contract
 */
export async function getPrompt(promptId: number): Promise<PromptData> {
  const contract = getContract();

  const prompt = await contract.getPrompt(promptId);

  return {
    id: prompt.id.toNumber(),
    creator: prompt.creator,
    promptText: prompt.promptText,
    category: prompt.category,
    createdAt: prompt.createdAt.toNumber(),
    votesUp: prompt.votesUp.toNumber(),
    votesDown: prompt.votesDown.toNumber(),
    isActive: prompt.isActive,
    status: prompt.status,
    generatedVideoUrl: prompt.generatedVideoUrl,
  };
}

/**
 * Get user's vote on a prompt
 */
export async function getVote(promptId: number, voter: string): Promise<VoteData | null> {
  const contract = getContract();

  try {
    const vote = await contract.getVote(promptId, voter);

    if (vote.timestamp.toNumber() === 0) {
      return null; // No vote cast
    }

    return {
      isUpvote: vote.isUpvote,
      weight: vote.weight.toNumber(),
      timestamp: vote.timestamp.toNumber(),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if user has voted on a prompt
 */
export async function hasUserVoted(promptId: number, voter: string): Promise<boolean> {
  const contract = getContract();
  return await contract.hasUserVoted(promptId, voter);
}

/**
 * Get user's vote balance
 */
export async function getVoteBalance(user: string): Promise<number> {
  const contract = getContract();
  const balance = await contract.voteBalances(user);
  return balance.toNumber();
}

/**
 * Get total number of prompts
 */
export async function getPromptCount(): Promise<number> {
  const contract = getContract();
  const count = await contract.getPromptCount();
  return count.toNumber();
}

/**
 * Update prompt status (admin only)
 */
export async function updatePromptStatus(
  signer: ethers.Signer,
  promptId: number,
  newStatus: string,
  videoUrl?: string
): Promise<void> {
  const contract = getContract(signer);

  const tx = await contract.updatePromptStatus(promptId, newStatus, videoUrl || '');
  await tx.wait();
}

/**
 * Add vote balance to user (admin only)
 */
export async function addVoteBalance(
  signer: ethers.Signer,
  user: string,
  amount: number
): Promise<void> {
  const contract = getContract(signer);

  const tx = await contract.addVoteBalance(user, amount);
  await tx.wait();
}

/**
 * Listen for contract events
 */
export function listenForEvents(
  eventName: string,
  callback: (...args: any[]) => void
): () => void {
  const contract = getContract();

  contract.on(eventName, callback);

  // Return cleanup function
  return () => {
    contract.off(eventName, callback);
  };
}


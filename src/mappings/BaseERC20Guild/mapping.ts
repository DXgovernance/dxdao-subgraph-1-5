import {
  ProposalStateChanged,
  TokensLocked,
  TokensWithdrawn,
  VoteAdded,
} from '../../types/templates/BaseERC20Guild/BaseERC20Guild';

export function handleProposalStateChange(event: ProposalStateChanged): void {}

export function handleTokenLocking(event: TokensLocked): void {}

export function handleTokenWithdrawal(event: TokensWithdrawn): void {}

export function handleVoting(event: VoteAdded): void {}

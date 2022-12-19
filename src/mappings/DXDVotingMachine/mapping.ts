import { BigInt } from '@graphprotocol/graph-ts';
import { Stake, Vote, DAO, Redeem } from '../../types/schema';
import {
  VoteProposal,
  Stake as StakeEvent,
  Redeem as RedeemEvent,
} from '../../types/templates/DXDVotingMachine/DXDVotingMachine';

export function handleVoteProposal(event: VoteProposal): void {
  const voteId = `${event.params._proposalId.toHexString()}-${event.params._voter.toHexString()}`;

  const avatarAddress = event.params._avatar;
  const avatar = DAO.load(avatarAddress.toHexString());
  if (!avatar) return;

  let vote = Vote.load(voteId);
  if (!vote) {
    vote = new Vote(voteId);
  }

  vote.proposal = event.params._proposalId.toHexString();
  vote.member = `${
    avatar.reputationToken
  }-${event.params._voter.toHexString()}`;
  vote.vote = event.params._vote;
  vote.reputation = event.params._reputation;
  vote.save();
}

export function handleStake(event: StakeEvent): void {
  const stakeId = `${event.params._proposalId.toHexString()}-${event.params._staker.toHexString()}-${
    event.block.timestamp
  }-stake`;

  // In the most common case, each staking is unique
  // We load to handle the edge case of someone staking twice on the same block
  let stake = Stake.load(stakeId);
  if (!stake) {
    stake = new Stake(stakeId);
    stake.amount = new BigInt(0);
  }

  stake.proposal = event.params._proposalId.toHexString();
  stake.avatar = event.params._avatar.toHexString();
  stake.staker = event.params._staker.toHexString();
  stake.vote = event.params._vote;
  stake.amount = event.params._amount;
  stake.timestamp = event.block.timestamp;
  stake.txId = event.transaction.hash.toHexString();

  stake.save();
}

export function handleRedeem(event: RedeemEvent): void {
  const redeemId = `${
    event.params._proposalId
  }-${event.params._beneficiary.toHexString()}-${event.block.timestamp}-redeem`;

  // In the most common case, each redeem is unique
  // We load to handle the edge case of someone redeeming twice on the same block
  let redeem = Redeem.load(redeemId);
  if (!redeem) {
    redeem = new Redeem(redeemId);
  }

  redeem.proposal = event.params._proposalId.toHexString();
  redeem.avatar = event.params._avatar.toHexString();
  redeem.redeemer = event.params._beneficiary.toHexString();
  redeem.amount = event.params._amount;
  redeem.timestamp = event.block.timestamp;
  redeem.txId = event.transaction.hash.toHexString();

  redeem.save();
}


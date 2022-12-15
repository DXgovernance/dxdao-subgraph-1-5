import { BigInt } from '@graphprotocol/graph-ts';
import { Stake, Vote, DAO } from '../../types/schema';
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
  const stakeId = `${event.params._proposalId.toHexString()}-${event.params._staker.toHexString()}`;

  let stake = Stake.load(stakeId);
  if (!stake) {
    stake = new Stake(stakeId);
    stake.amount = new BigInt(0);
  }

  stake.proposal = event.params._proposalId.toHexString();
  stake.avatar = event.params._avatar.toHexString();
  stake.staker = event.params._staker.toHexString();
  stake.vote = event.params._vote;
  stake.amount = stake.amount.plus(event.params._amount);

  stake.save();
}

export function handleRedeem(event: RedeemEvent): void {
  const stakeId = `${
    event.params._proposalId
  }-${event.params._beneficiary.toHexString()}`;
  const stake = Stake.load(stakeId);
  if (!stake) return;

  stake.amount = stake.amount.minus(event.params._amount);
  stake.save();
}

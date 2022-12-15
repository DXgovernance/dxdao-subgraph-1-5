import {
  VoteProposal,
  Stake as StakeEvent,
} from '../../types/templates/DXDVotingMachine/DXDVotingMachine';
import { Stake, Vote, DAO } from '../../types/schema';

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


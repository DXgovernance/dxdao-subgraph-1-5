import { VoteProposal } from '../../types/templates/DXDVotingMachine/DXDVotingMachine';
import { Vote } from '../../types/schema';

export function handleVoteProposal(event: VoteProposal): void {
  let voteId = `${event.params._proposalId.toHexString()}-${event.params._voter.toHexString()}`;

  let vote = Vote.load(voteId);
  if (!vote) {
    vote = new Vote(voteId);
  }

  vote.proposal = event.params._proposalId.toHexString();
  vote.member = event.params._voter.toHexString();
  vote.vote = event.params._vote;
  vote.reputation = event.params._reputation;
  vote.save();
}


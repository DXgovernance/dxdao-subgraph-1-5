import { log } from '@graphprotocol/graph-ts';
import { Proposal } from '../../types/schema';
import { DXDVotingMachine as DXDVotingMachineContract } from '../../types/templates/DXDVotingMachine/DXDVotingMachine';
import { NewProposal } from '../../types/templates/DXDVotingMachine/DXDVotingMachine';

export function handleNewProposal(event: NewProposal): void {
  const votingMachineAddress = event.address;
  const proposalId = event.params._proposalId;
  const votingMachineContract =
    DXDVotingMachineContract.bind(votingMachineAddress);

  const proposalData = votingMachineContract.proposals(proposalId);

  const proposal = new Proposal(proposalId.toHexString());

  // ! Scheme properties. Hardcoded
  proposal.to = [];
  proposal.callData = [];
  proposal.value = [];

  proposal.schemeId = proposalData.getSchemeId().toHexString();
  proposal.callbacks = proposalData.getCallbacks().toHexString();
  proposal.state = 'None'; //! hardcoded
  proposal.executionState = 'None'; //! hardcoded
  proposal.winningVote = proposalData.getWinningVote();
  proposal.proposer = proposalData.getProposer().toHexString();
  proposal.currentBoostedVotePeriodLimit =
    proposalData.getCurrentBoostedVotePeriodLimit();
  proposal.paramsHash = proposalData.getParamsHash().toHexString();
  proposal.daoBountyRemain = proposalData.getDaoBountyRemain();
  proposal.daoBounty = proposalData.getDaoBounty();
  proposal.totalStakes = proposalData.getTotalStakes();
  proposal.confidenceThreshold = proposalData.getConfidenceThreshold();
  proposal.secondsFromTimeOutTillExecuteBoosted =
    proposalData.getSecondsFromTimeOutTillExecuteBoosted();
  proposal.boostedPhaseTime = proposalData.value12; // ! is an array but it seems we can't access its content
  proposal.daoRedeemItsWinnings = proposalData.getDaoRedeemItsWinnings();

  proposal.save();
}


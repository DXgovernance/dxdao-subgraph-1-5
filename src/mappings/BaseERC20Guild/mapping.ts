import { Bytes, Value } from '@graphprotocol/graph-ts';
import { Guild, Proposal } from '../../types/schema';
import {
  BaseERC20Guild,
  ProposalStateChanged,
  SetConfigCall,
  TokensLocked,
  TokensWithdrawn,
  VoteAdded,
} from '../../types/templates/BaseERC20Guild/BaseERC20Guild';

export function handleConfigChange(call: SetConfigCall): void {
  // Load Guild using the called address
  const address = call.to;
  let guild = Guild.load(address.toHexString());

  // We shouldn't land here
  if (guild == null) return;

  // Update Guild config
  guild.proposalTime = call.inputs._proposalTime;
  guild.lockTime = call.inputs._lockTime;
  guild.timeForExecution = call.inputs._timeForExecution;
  guild.votingPowerForProposalCreation =
    call.inputs._votingPowerForProposalCreation;
  guild.votingPowerForProposalExecution =
    call.inputs._votingPowerForProposalExecution;
  guild.voteGas = call.inputs._voteGas;
  guild.maxGasPrice = call.inputs._maxGasPrice;
  guild.maxActiveProposals = call.inputs._maxActiveProposals;
  guild.minimumMembersForProposalCreation =
    call.inputs._minimumMembersForProposalCreation;
  guild.minimumTokensLockedForProposalCreation =
    call.inputs._minimumTokensLockedForProposalCreation;

  guild.save();
}

export function handleProposalStateChange(event: ProposalStateChanged): void {
  let address = event.address;
  let contract = BaseERC20Guild.bind(address);

  let proposal = Proposal.load(event.params.proposalId.toHexString());

  const proposalData = contract.getProposal(event.params.proposalId);

  if (proposal == null) {
    proposal = new Proposal(event.params.proposalId.toHexString());
    proposal.guildId = address.toHexString();
    proposal.creator = proposalData.creator.toHexString();
    proposal.startTime = proposalData.startTime;
    proposal.endTime = proposalData.endTime;
    proposal.to = proposalData.to.map<string>(d => d.toHexString());
    proposal.data = proposalData.data.map<string>(d => d.toHexString());
    proposal.value = proposalData.value;
    proposal.title = proposalData.title;
    proposal.contentHash = proposalData.contentHash;
    proposal.totalVotes = proposalData.totalVotes;
  }

  proposal.contractState = event.params.newState;
  proposal.save();
}

export function handleTokenLocking(event: TokensLocked): void {}

export function handleTokenWithdrawal(event: TokensWithdrawn): void {}

export function handleVoting(event: VoteAdded): void {}


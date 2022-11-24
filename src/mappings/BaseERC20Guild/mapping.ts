import { ipfs, json, JSONValueKind } from '@graphprotocol/graph-ts';
import { Guild, Proposal, Vote, Option, Action } from '../../types/schema';
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
  const proposalId = event.params.proposalId.toHexString();

  let proposal = Proposal.load(proposalId);

  const proposalData = contract.getProposal(event.params.proposalId);

  if (!proposal) {
    const to = proposalData.to.map<string>(d => d.toHexString());
    const data = proposalData.data.map<string>(d => d.toHexString());
    proposal = new Proposal(proposalId);
    proposal.guildId = address.toHexString();
    proposal.creator = proposalData.creator.toHexString();
    proposal.startTime = proposalData.startTime;
    proposal.endTime = proposalData.endTime;
    proposal.to = to;
    proposal.data = data;
    proposal.value = proposalData.value;
    proposal.title = proposalData.title;
    proposal.contentHash = proposalData.contentHash;
    proposal.totalVotes = proposalData.totalVotes;
    proposal.votes = [];
    proposal.options = [];

    // if (proposal.contentHash) {
    //   // TODO: find a way to decode contentHash
    //   // let metadata = ipfs.cat(proposal.contentHash);
    //   let metadata = ipfs.cat(
    //     'bafybeifbd6gebjnferqhqgb3vhrle7wt2qhrvdh7qji2xzr2wb5vxidva4'
    //   );
    //   // TODO: parse JSON from metadata

    //   if (metadata) {
    //     const stringMetadata = metadata.toString();
    //     const parsedJson = json.fromString(stringMetadata);
    //     const parsedObject = parsedJson.toObject();
    //     const description = parsedObject.get('description');
    //     if (description && description.kind == JSONValueKind.STRING) {
    //       proposal.description = description.toString();
    //     }

    //     proposal.metadata = stringMetadata;
    //   }
    // }

    const amountOfOptions = proposal.totalVotes!.length - 1;
    const actionsPerOption = proposal.data!.length / amountOfOptions;

    for (let i = 0; i <= amountOfOptions; i++) {
      let optionId = `${proposalId}-${i}`;
      let option = new Option(optionId);
      let optionsCopy = proposal.options;
      optionsCopy!.push(`${proposalId}-${i}`);

      proposal.options = optionsCopy;
      option.proposalId = proposalId;
      option.actions = [];

      for (let j = 0; j < actionsPerOption; j++) {
        if (option.actions) {
          let actionId = `${optionId}-${j}`;
          let action = new Action(`${optionId}-${j}`);
          let actionIndex = actionsPerOption * i + j;

          if (option.actions) {
            action.data = data[actionIndex];
            action.from = address.toHexString();
            action.to = to[actionIndex];
            action.value = proposalData.value[actionIndex];
          }

          let actionsCopy = option.actions;
          actionsCopy!.push(actionId);
          option.actions = actionsCopy;

          action.save();
        }
      }

      option.save();
    }

    let guild = Guild.load(address.toHexString());
    if (guild) {
      let proposalsCopy = guild.proposals;
      proposalsCopy!.push(proposalId);
      guild.proposals = proposalsCopy;
      guild.save();
    }
  }

  proposal.contractState = event.params.newState;
  proposal.save();
}

export function handleTokenLocking(event: TokensLocked): void {}

export function handleTokenWithdrawal(event: TokensWithdrawn): void {}

export function handleVoting(event: VoteAdded): void {
  const proposalId = event.params.proposalId.toHexString();
  const id = `${proposalId}-${event.params.voter.toHexString()}`;

  let vote = Vote.load(id);
  let proposal = Proposal.load(proposalId);

  if (!vote) {
    vote = new Vote(id);
    vote.proposalId = proposalId;
    vote.voter = event.params.voter.toHexString();
    // TODO: change to event.params.option when merging refactor branch of dxdao-contracts
    vote.option = event.params.action;
    // TODO: check when one voter votes twice
    if (proposal) {
      let votesCopy = proposal.votes;
      votesCopy!.push(id);
      proposal.votes = votesCopy;
      proposal.save();
    }
  }

  vote.votingPower = event.params.votingPower;

  vote.save();
}


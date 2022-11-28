import { AddGuild, RemoveGuild } from '../../types/GuildRegistry/GuildRegistry';
import { BaseERC20Guild as BaseERC20GuildTemplate } from '../../types/templates';
import { Guild, Token } from '../../types/schema';
import { BaseERC20Guild } from '../../types/templates/BaseERC20Guild/BaseERC20Guild';
import { ERC20 } from '../../types/GuildRegistry/ERC20';

export function handleAddGuild(event: AddGuild): void {
  // Instantiate BaseERC20Guild contract instance
  let address = event.params.guildAddress;
  let contract = BaseERC20Guild.bind(address);

  // Get token config
  let tokenAddress = contract.getToken();
  let tokenContract = ERC20.bind(tokenAddress);
  let token = Token.load(tokenAddress.toHexString());
  if (!token) {
    token = new Token(tokenAddress.toHexString());
  }
  token.name = tokenContract.name();
  token.type = 'ERC20';
  token.symbol = tokenContract.symbol();
  token.decimals = tokenContract.decimals();
  token.save();

  // Create Guild instance.
  // It could already exist as well if it was removed from the registry in the past,
  // so load it instead if it does
  let guild = Guild.load(address.toHexString());
  if (guild == null) {
    guild = new Guild(address.toHex());
  }

  // Save Guild config
  guild.name = contract.getName();
  guild.permissionRegistry = contract.getPermissionRegistry().toHexString();
  guild.proposalTime = contract.getProposalTime();
  guild.lockTime = contract.getLockTime();
  guild.timeForExecution = contract.getTimeForExecution();
  guild.votingPowerForProposalCreation =
    contract.getVotingPowerForProposalCreation();
  guild.votingPowerForProposalExecution =
    contract.getVotingPowerForProposalExecution();
  guild.voteGas = contract.getVoteGas();
  guild.maxGasPrice = contract.getMaxGasPrice();
  guild.maxActiveProposals = contract.getMaxActiveProposals();
  guild.minimumMembersForProposalCreation =
    contract.getMinimumMembersForProposalCreation();
  guild.minimumTokensLockedForProposalCreation =
    contract.getMinimumTokensLockedForProposalCreation();
  guild.token = token.id;
  guild.isDeleted = false;

  guild.save();

  // Instantiate BaseERC20Guild instance
  // TODO: Instantiate the right type of guild instead of base contract.
  BaseERC20GuildTemplate.create(address);
}

export function handleRemoveGuild(event: RemoveGuild): void {
  let id = event.params.guildAddress.toHex();
  let guild = Guild.load(id);

  // This should never happen!
  if (guild == null) return;

  guild.isDeleted = true;
  guild.save();
}


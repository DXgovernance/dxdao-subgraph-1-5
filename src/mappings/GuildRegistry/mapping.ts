import { AddGuild, RemoveGuild } from '../../types/GuildRegistry/GuildRegistry';
import { BaseERC20Guild } from '../../types/templates';
import { Guild } from '../../types/schema'

export function handleAddGuild(event: AddGuild): void {
  let address = event.params.guildAddress;

  let guild = Guild.load(address.toHex())
  if (guild == null) {
    guild = new Guild(address.toHex());
  }
  guild.isDeleted = false;
  guild.save();

  BaseERC20Guild.create(address);
}

export function handleRemoveGuild(event: RemoveGuild): void {
  let id = event.params.guildAddress.toHex();
  let guild = Guild.load(id);
  if (guild == null) return;

  guild.isDeleted = true;
  guild.save();
}


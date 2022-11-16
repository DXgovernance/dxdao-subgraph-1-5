import { AddGuild, RemoveGuild } from '../../types/GuildRegistry/GuildRegistry';
import { Guild } from '../../types/schema';

export function handleAddGuild(event: AddGuild): void {
  let id = event.params.guildAddress.toHex();
  let guild = Guild.load(id);
  if (guild == null) {
    guild = new Guild(id);
  }
  guild.isDeleted = false;
  guild.save();
}

export function handleRemoveGuild(event: RemoveGuild): void {
  let id = event.params.guildAddress.toHex();
  let guild = Guild.load(id);
  if (guild == null) return;

  guild.isDeleted = true;
  guild.save();
}


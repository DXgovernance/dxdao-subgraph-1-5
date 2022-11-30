import { BigInt } from '@graphprotocol/graph-ts';
import { Guild, Member, Token } from '../../types/schema';
import { Transfer } from '../../types/templates/ERC20SnapshotRep/ERC20SnapshotRep';

export function handleTransfer(event: Transfer): void {
  let tokenAddress = event.address.toHexString();
  let token = Token.load(tokenAddress);
  const guild = Guild.load(token!.guildAddress);

  const zeroAddress = '0x0000000000000000000000000000000000000000';

  // TODO: change to !guild.isREPGuild
  if (!guild || tokenAddress != '0x7bc0dedafd60611d430c89353cc30e1a11b90ac7') {
    return;
  }

  if (!guild) return;

  const isMint = event.params.from.toHexString() == zeroAddress;

  let memberId = `${token!.guildAddress}-${
    isMint ? event.params.to.toHexString() : event.params.from.toHexString()
  }`;
  let member = Member.load(memberId);

  if (isMint) {
    if (!member) {
      member = new Member(memberId);
      member.address = event.params.to.toHexString();
      member.tokensLocked = new BigInt(0);

      let guildMembersClone = guild.members;
      guildMembersClone!.push(memberId);
      guild.members = guildMembersClone;

      guild.save();
    }

    member.save();
  }

  // TODO: handle burn logic
  // TODO: get voting power of member
}


import { log } from '@graphprotocol/graph-ts';
import { Guild, Member, Token } from '../../types/schema';
import {
  BaseERC20Guild,
  Transfer,
} from '../../types/templates/BaseERC20Guild/BaseERC20Guild';

export function handleTransfer(event: Transfer): void {
  let tokenAddress = event.address;

  let token = Token.load(tokenAddress.toHexString());
  log.info(`guildAddress {}`, [token!.guildAddress]);
  log.info(`*************************`, []);
  log.info(`*************************`, []);
  log.info(`*************************`, []);

  const guild = Guild.load(token!.guildAddress);
  // const guild = Guild.load('0x140d68e4e3f80cdcf7036de007b3bcec54d38b1f');

  const zeroAddress = '0x0000000000000000000000000000000000000000';
  let memberId = '';

  if (!guild) return;

  const isMint = event.params.from.toHexString() === zeroAddress;

  memberId = `${token!.guildAddress}-${
    isMint ? event.params.to.toHexString() : event.params.from.toHexString()
  }`;
  let member = Member.load(memberId);

  // if (isMint) {
  // mint
  if (!member) {
    member = new Member(memberId);
    member.address = event.params.to.toHexString();

    let guildMembersClone = guild.members;
    guildMembersClone!.push(memberId);
    guild.members = guildMembersClone;

    guild.save();
  }
  // TODO: change to get from contract
  member.tokensLocked = event.params.value;
  member.save();
  // } else {
  //   // burn
  //   memberId = `${guildAddress.toHexString()}-${event.params.to}`;
  // }
}


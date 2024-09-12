import { jidDecode, generateWAMessageFromContent } from "@whiskeysockets/baileys"


export default {
  name: 'hidetag',
  aliases: ['h', 'hidetag'],
  category: 'Groups',
  usage: 'msg',
  pconly: false,
  group: true,
  admin: true,
  botAdmin: true,
  owner: false,
  execute: async (m, client, { body, prefix, args, arg, cmd, groupAdmins, isBotGroupAdmin }) => {
    try {
      const groupMembers = (await client.groupMetadata(m.from)).participants
      let quoted = m.isQuoted ? m.quoted : m;
      let text = args.join(' ')
      if (quoted.isMedia) {
        await m.reply({ forward: quoted, text, force: true, mentions: groupMembers.map(a => a.id) })
      } else {
        await client.sendMessage(m.from, { text: text ? text : "", mentions: groupMembers.map(a => a.id) })
      }
    } catch (e) {
      console.log(e);
    }
  }
}
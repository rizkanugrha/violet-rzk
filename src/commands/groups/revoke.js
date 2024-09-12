
import util from 'util'
import { delay, areJidsSameUser } from "@whiskeysockets/baileys"


export default {
    name: 'revoke',
    aliases: ['revoke'],
    category: 'Groups',
    pconly: false,
    group: true,
    admin: true,
    botAdmin: true,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd }) => {
        try {
            await m.react('🕒')
            const code = await client.groupRevokeInvite(m.from);
            client.sendMessage(m.from, {
                text:
                    "Link Group Telah DiUbah Oleh Admin @" +
                    m.sender.split("@")[0].split(":")[0],
                contextInfo: { mentionedJid: [m.sender] },
            });
            client.sendMessage(
                m.from,
                { text: `New Group Link: https://chat.whatsapp.com/${code}` },
                { quoted: m }
            );

            await m.react('✅')
        } catch (error) {
            // m.reply(util.format(error))
            console.log(error);
            await m.react('🍉')

        }
    }
}
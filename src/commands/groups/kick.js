import util from 'util'
import { delay, areJidsSameUser } from "@whiskeysockets/baileys"


export default {
    name: 'kick',
    aliases: ['kick'],
    category: 'Groups',
    usage: '<reply/tag member>',
    pconly: false,
    group: true,
    admin: true,
    botAdmin: true,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd }) => {
        try {
            await m.react('🕒')

            if (m.quoted) {
                const _user = m.quoted.sender;
                if (_user === m.isOwner) return
                await client.groupParticipantsUpdate(m.from, [_user], 'remove')
            } else if (args.length >= 1 || m.mentionedJid.length >= 1) {
                let _participants = m.mentionedJid.filter(u => !areJidsSameUser(u, client.user.id))
                if (_participants.includes(m.isOwner)) return
                if (_participants.length < 1) return m.reply(`tag user atau reply pesan nya, contoh : ${prefix + cmd} @user`)
                m.reply(`Kick/Remove *${_participants.length}* group members within delay 3 seconds to prevent banned`)
                for (let usr of _participants) {
                    await delay(3000)
                    await client.groupParticipantsUpdate(m.from, [usr], 'remove')
                }
                await m.react('✅')

            } else {
                m.reply(`tag user atau reply pesan nya, contoh : ${prefix + cmd ? cmd : ''} @user`)
            }
        } catch (error) {
            await m.react('🍉')

            console.log(error);
        }
    }
}
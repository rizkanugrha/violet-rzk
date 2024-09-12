
import { delay, areJidsSameUser } from "@whiskeysockets/baileys"

export default {
    name: 'promote',
    aliases: ['promote', 'promot'],
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
                await client.groupParticipantsUpdate(m.from, [_user], 'promote')
            } else if (args.length >= 1 || m.mentionedJid.length >= 1) {
                let _participants = m.mentionedJid.filter(u => !areJidsSameUser(u, client.user.id))
                if (_participants.length < 1) return m.reply(`tag user atau reply pesan nya, contoh : ${prefix + cmd} @user`)
                m.reply(`Promoting *${_participants.length}* group members to be Group Admin within delay 3 seconds to prevent banned`)
                for (let usr of _participants) {
                    if (usr.endsWith('@s.whatsapp.net') && !(_participants.find(v => areJidsSameUser(v.id, usr)))) {

                        await delay(3000)
                        await client.groupParticipantsUpdate(m.from, [usr], 'promote')

                        await m.react('✅')

                    }
                }
            } else {
                m.reply(`tag user atau reply pesan nya, contoh : ${prefix + cmd} @user`)
            }


        } catch (error) {
            await m.react('🍉')

        }

    }
}
import { jidDecode, generateWAMessageFromContent } from "@whiskeysockets/baileys"
import util from 'util'

export default {
    name: 'tagall',
    aliases: ['all', 'announcement', 'tagall'],
    category: 'Groups',
    usage: 'msg',
    pconly: false,
    group: true,
    admin: true,
    botAdmin: true,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, groupMembers }) => {
        try {
            await m.react('🕒')
            let type = m.quoted ? m.quoted.type : m.type

            let text = args.join(' ')
            text = args.length >= 1 ? `> Pengumuman dari @${jidDecode(m.sender).user} : ${args.join(' ')}\n` : '> *Tag All Members*\n'

            for (let i of groupMembers) {
                text += `\n* @${jidDecode(i.id).user}`

            }
            if (/image|video/i.test(type)) {
                let ms = m.isQuoted ? m.quoted : m
                await m.reply({ forward: ms, text, force: true, mentions: groupMembers.map(a => a.id) })

                await m.react('✅')
            } else {
                client.sendMessage(m.from, { text, mentions: groupMembers.map(x => x.id) })
                await m.react('✅')

            }
        } catch (err) {
            console.log(err);
            m.reply(util.format(err))
            await m.react('🍉')

        }

    }
}
import util from 'util';

export default {
    name: 'linkgc',
    aliases: ['gc', 'getlinnk', 'linkgc'],
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

            var group = m.from
            if (/^[0-9]{5,16}-?[0-9]+@g\.us$/.test(args[0])) group = args[0]
            if (!/^[0-9]{5,16}-?[0-9]+@g\.us$/.test(group)) throw 'Hanya bisa dibuka di grup'
            var groupMetadata = await client.groupMetadata(group)
            if (!groupMetadata) throw 'groupMetadata is undefined :\\'
            if (!('participants' in groupMetadata)) throw 'participants is not defined :('
            m.reply('Link group: https://chat.whatsapp.com/' + await client.groupInviteCode(group))

            await m.react('✅')
        } catch (error) {
            await m.react('🍉')
        }
    }
}
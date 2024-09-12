
export const name = 'del'
export const aliases = ['delete', 'del']
export const category = 'Tools'

export default {
    name: 'delete',
    aliases: ['d', 'del', 'delet', 'delete'],
    category: 'Tools',
    usage: '<reply msg>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        if (!m.quoted) return m.reply('Reply to the message you want to delete')
        try {
            await m.react('🕒')

            let bilek = m.message.extendedTextMessage.contextInfo.participant;
            let banh = m.message.extendedTextMessage.contextInfo.stanzaId;
            await client.sendMessage(m.from, { delete: { remoteJid: m.from, fromMe: false, id: banh, participant: bilek } });
            await m.react('✅')

        } catch {
            await client.sendMessage(m.from, { delete: m.quoted.vM.key });
            await m.react('🍉')

        }
    }
}
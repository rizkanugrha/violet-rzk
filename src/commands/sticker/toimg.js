import { statistics } from "../../database/database.js"
export default {
    name: 'toimg',
    aliases: ['toimg', 'stoimg', 'stikertoimg'],
    category: 'Sticker',
    usage: '<reply sticker>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client) => {
        try {

            await m.react('🕒')

            if (m.quoted && m.quoted.type == 'stickerMessage') {
                const media = await client.downloadMediaMessage(m.quoted)
                await client.sendMessage(m.from, { image: media, mimetype: 'image/jpeg', jpegThumbnail: media }, { quoted: m })
                await m.react('✅')
                statistics('sticker')
            } else {
                m.reply('Reply a sticker')
            }
        } catch (error) {

            console.log(error);
            await m.react('🍉')

        }
    }
}
import { Sticker } from "../../utils/sticker.js";
import util from 'util'
import config from "../../utils/config.js";
import { statistics } from "../../database/database.js";
export default {
    name: 'stake',
    aliases: ['stake', 'stickertake', 'stikertake'],
    category: 'Sticker',
    usage: '<pack|author>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        try {

            await m.react('🕒')

            let pack = arg.split('|')[0]
            let author = arg.split('|')[1] || config.author
            if (!pack) return m.reply(`Pack name is required! example: ${prefix + cmd} name pack|author`)

            if (m.quoted && m.quoted.type == 'stickerMessage') {
                const buff = await client.downloadMediaMessage(m.quoted)
                const data = new Sticker(buff, { packname: pack, author: author })
                await client.sendMessage(m.from, await data.toMessage(), { quoted: m })
                statistics('sticker')
                await m.react('✅')
            } else {
                m.reply(`Pack name is required! example: ${prefix + cmd} name pack|author`)
            }
        } catch (error) {

            console.log(error);
            await m.react('🍉')

        }


    }
}
import { Sticker } from "../../utils/sticker.js";
import config from '../../utils/config.js'
import { statistics } from "../../database/database.js";
export default {
    name: 'ttp',
    aliases: ['ttp', 'sttp'],
    category: 'Sticker',
    usage: '<teks/quotes>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { args }) => {
        try {
            m.react('🕒')

            const emojid = Sticker.ttp(args.join(' '))
            const data = new Sticker(emojid, { packname: config.name, author: config.author, packId: '', categories: 'happy' })
            await client.sendMessage(m.from, await data.toMessage(), { quoted: m })
            statistics('sticker')
            await m.react('✅')

        } catch (e) {
            console.error(e + `eeerrr ttp`)
            await m.react('🍉')

        }
    }
}
// pie wi
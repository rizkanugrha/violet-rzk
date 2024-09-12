
import { cropStyle, Sticker } from "../../utils/sticker.js"
import config from '../../utils/config.js'
import { Emoji } from "../../utils/exif.js"
import { isUrl } from '../../utils/utils.js'
import { statistics } from "../../database/database.js"

export default {
    name: 'emoji',
    aliases: ['emo', 'emoji', 'emot', 'e'],
    category: 'Sticker',
    usage: '<emot>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, body, arg, flags, cmd }) => {

        let crop = flags.find(v => cropStyle.map(x => x == v.toLowerCase()))
        let packname = /\|/i.test(body) ? arg.split('|')[0] : `${config.name} `
        let stickerAuthor = /\|/i.test(body) ? arg.split('|')[1] : `${config.author}`
        let categories = Object.keys(Emoji).includes(arg.split('|')[2]) ? arg.split('|')[2] : 'love' || 'love'
        try {

            await m.react('🕒')
            if (args.length == 1) {
                const bahmod = args[0]
                const mot = encodeURI(bahmod)
                const rul = `https://emojicdn.elk.sh/${mot}?style=apple`
                isUrl(rul)
                const data = new Sticker(rul, { packname, author: stickerAuthor, packId: '', categories }, crop)
                await client.sendMessage(m.from, await data.toMessage(), { quoted: m })
                await m.react('✅')
                statistics('sticker')
            } else {
                return m.reply(`Please enter the emoticon! example: ${prefix + cmd} <emot>`)
            }

        } catch (err) {
            console.log(err);
            await m.react('🍉')

        }



    }
}
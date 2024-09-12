import _ from "lodash"
import config from '../../utils/config.js'
import { Sticker } from "../../utils/sticker.js"
import kitchen from '../../lib/emojikitchen.js'
import { statistics } from "../../database/database.js"
export default {
    name: 'smix',
    aliases: ['smix', 'mixsticker', 'stickermix', 'mix'],
    category: 'Sticker',
    usage: '<emot 1+emot 2>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd, url, flags }) => {
        try {
            //const kitchen = require('../../../lib/emojikitchen')
            await m.react('🕒')

            if (flags.find(v => v.match(/shuffle|random/))) {
                const emoji = kitchen.shuffle()
                const res = await kitchen.mix(emoji[0], emoji[1])
                const data = new Sticker(_.sample(res.results).url, { packname: `${config.name} `, author: config.author })
                await client.sendMessage(m.from, await data.toMessage(), { quoted: m })
                await m.react('✅')
                statistics('sticker')
            } else {
                const parsed = kitchen.parseEmoji(body)
                if (parsed.length < 1) return m.reply('emoji not supported, try another one.\n\nDo Note! that not all emojis are supported yet')
                const res = await kitchen.mix(parsed.length == 1 ? parsed[0] : parsed[0], parsed[1])
                const img = _.sample(res.results).url
                if (flags.find(v => v.match(/image|img|i/))) {
                    await client.sendFileFromUrl(m.from, img, `success`)
                    statistics('sticker')
                    await m.react('✅')

                } else {
                    const data = new Sticker(img, { packname: `${config.name} `, author: config.author })
                    await client.sendMessage(m.from, await data.toMessage(), { quoted: m })
                    await m.react('✅')
                    statistics('sticker')
                }
            }
        } catch (error) {
            m.reply('emoji not supported, try another one.\n\nDo Note! that not all emojis are supported')
            console.log(error);
        }

    }
}
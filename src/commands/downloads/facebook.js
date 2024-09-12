import { delay } from '@whiskeysockets/baileys'
import { snapsave } from '../../lib/scrape/fb.js'
import { inlineCode } from '../../lib/formatter.js'

// function anu(teks) {
//     let tanda = '`'
//     return tanda + teks + tanda
// }

export default {
    name: 'fb',
    aliases: ['facebook', 'fbdl', 'fb'],
    category: 'Downloads',
    usage: 'link',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd }) => {
        let text = args.join(' ')
        if (!text) {
            return m.reply(`Please enter the Facebook URL. example : ${prefix}fb https://www.facebook.com/xxxxx`)
        }
        if (!text.match(/facebook/gi)) {
            return m.reply('The URL you entered is not a Facebook URL!')
        }
        await m.react('🕒')

        try {
            let data = await snapsave(text)
            let caption =
                `${inlineCode('Successfully downloaded Facebook videos')}\n- Quality: ${data.list[0].quality}` +
                `\n\n⚡️ _by violet-rzk_`
            await client.sendFileFromUrl(m.from, data.list[0].url, caption, m, '', 'mp4')
            //await client.sendFilek(m.from, data.list[0].url, `fbdl-${Date.now()}.mp4`, caption, m)
            await m.react('✅')
        } catch (e) {
            console.log(e);
            await m.react('🍉')
        }

    }
}

import { YT } from '../../lib/scrape/yt2.js'
import { formatK } from '../../utils/utils.js'
import util from 'util'
import { inlineCode } from '../../lib/formatter.js'

export default {
    name: 'yts',
    aliases: ['yts', 'seachmusik'],
    category: 'Downloads',
    usage: 'link',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd, url, flags }) => {
        if (args.length < 1) return m.reply('query diperlukan')
        try {
            await m.react('🕒')
            const list = await YT.search(args.join(' '));
            let tex = `${inlineCode('Successfully downloaded YouTube MP4')}\n\n`
            let n = 1
            for (let x of list) {
                tex += `\n*${n}. ${x.title}*\n🐓 *Channel :* ${x.author.name}\n⌛ *Duration :* ${x.timestamp}\n👀 *Views :* ${formatK(x.views)}\n📅 *Uploaded :* ${x.ago}\n🔗 *Url :* ${x.url}\n\n`
                n++
            }
            tex += `- ${prefix}ytmp3 for download mp3\n- ${prefix}ytmp4 for download mp4\n\n⚡️ _by violet-rzk_`
            m.reply(tex)
            await m.react('✅')

        } catch (error) {
            console.log(error);

            await m.react('🍉')
        }
    }
}
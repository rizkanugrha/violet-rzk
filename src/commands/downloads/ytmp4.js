import { shortener } from '../../lib/shortener.js'
import { YT } from '../../lib/scrape/yt2.js'
import { ytmp4 } from '../../lib/scrape/yt-1.js'
import { isUrl, getBuffer, humanFileSize, secondsConvert } from '../../utils/utils.js'
import util from 'util'
import { inlineCode } from '../../lib/formatter.js'
export default {
    name: 'ytmp4',
    aliases: ['ytmp4', 'ytmp4dl'],
    category: 'Downloads',
    usage: 'link',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd, url, flags }) => {
        if (args.length < 1 || !isUrl(url) || !YT.isYTUrl(url)) return m.reply(`The URL you entered is not a Youtube URL!\nexample: ${prefix + cmd} https://www.youtube.com/watch?v=Ezzh2joFrzg`)
        try {
            await m.react('🕒')

            const video = await YT.mp4(url)

            // const resolutions = [480, 720, 1080];

            // var resulusi = resolutions[Math.floor(Math.random() * resolutions.length)];
            let caption = `${inlineCode('Successfully downloaded YouTube MP4')}\n\n` +
                `*Title :* ${video.title}\n` +
                `*Channel :* ${video.channel}\n` +
                `*Published :* ${video.date}\n` +
                `*Quality :* ${video.resolutions}\n` +
                `*Durasi :* ${secondsConvert(video.duration)}` +
                `\n\n⚡️ _by violet-rzk_`


            await client.sendFileFromUrl(m.from, video.videoUrl, caption, m)
            await m.react('✅')


        } catch (error) {
            /// m.reply(util.format(error))
            console.log(error);

            await m.react('🍉')
        }
    }
}
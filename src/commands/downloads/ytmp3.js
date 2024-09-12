import { shortener } from '../../lib/shortener.js'
import { YT } from '../../lib/scrape/yt2.js'
import { isUrl, getBuffer, secondsConvert, parseFileSize } from '../../utils/utils.js'
import util from 'util'
import { inlineCode } from '../../lib/formatter.js'

export default {
    name: 'ytmp3',
    aliases: ['ytmp3', 'ytmp3dl'],
    category: 'Downloads',
    usage: 'link',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd, url, flags }) => {
        try {

            if (args.length < 1 || !isUrl(url) || !YT.isYTUrl(url)) return m.reply(`*Usage:*\n${prefix}${cmd} url --args\n*args* is optional (can be filled in or not)\n\n
                *list args:*\n--metadata: download mp3 with metadata tags\n--vn can be played directly via WA\n\nexample: ${prefix}ytmp3 https://youtu.be/0Mal8D63Zew --vn`)

            await m.react('🕒')
            let dl = new Set()

            const video = await YT.mp4(url)
            //    const hasi = await YT.mp3(url)
            // const link = await hasi.path;
            const obj = await YT.mp3(url, '', true)
            dl.add(obj)
            dl = [...dl][0]
            let caption = `${inlineCode('Successfully downloaded YouTube MP3')}\n\n` +
                `*Title :* ${video.title}\n` +
                `*Channel :* ${video.channel}\n` +
                `*Published :* ${video.date}\n` +
                `*Durasi :* ${secondsConvert(video.duration)}\n` +
                `*FileSize :* ${dl.size}` +
                `\n\n⚡️ _by violet-rzk_`
            await client.sendMessage(m.from, { image: { url: video.thumb }, caption: caption }, { quoted: m })
            if (flags.find(v => v.toLowerCase() === 'vn')) {

                await client.sendFile(m.from, dl.path, m, { audio: true, fileName: `${video.title}.mp3`, mimetype: 'audio/mpeg', jpegThumbnail: (await getBuffer(video.thumb)).buffer })
                await m.react('✅')

            } else {
                await client.sendFile(m.from, dl.path, m, { fileName: `${video.title}.mp3`, mimetype: 'audio/mp3', document: true, jpegThumbnail: (await getBuffer(video.thumb)).buffer })
                await m.react('✅')

            }

        } catch (e) {
            console.log(e);

            await m.react('🍉')
        }
    }
}
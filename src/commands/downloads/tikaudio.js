import { delay } from '@whiskeysockets/baileys'
import { tiktok2 } from '../../lib/scrape/tiktok.js'
import { inlineCode } from '../../lib/formatter.js'
function anu(teks) {
    let tanda = '`'
    return tanda + teks + tanda
}

export default {
    name: 'tikaudio',
    aliases: ['tikaudio', 'ta', 'tikaudiodl', 'audiotiktok', 'audiotik'],
    category: 'Downloads',
    usage: 'link',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd }) => {
        let text = args[0]
        if (!text) {
            return m.reply(`Please enter the Tiktok URL. example : ${prefix + cmd} https://vm.tiktok.com/xxxxx`)
        }
        if (!text.match(/tiktok/gi)) {
            return m.reply('The URL you entered is not a TikTok')
        }
        await m.react('🕒')
        try {
            let old = new Date();
            let p = await tiktok2(`${text}`);
            let kemii = `${inlineCode('Successfully downloaded Tiktok  Audio ')}\n\n`
            kemii += `- *Title* : ${p.music_info.title}\n`
            kemii += `- *Author* : ${p.music_info.author}\n`
            kemii += `- *Fetch* : ${((new Date - old) * 1)} ms`
            kemii += `\n\n⚡️ _by violet-rzk_`
            await m.reply(kemii)
            await client.sendFile(m.from, p.music_info.play, m, { audio: true, fileName: `${p.music_info.title}.mp3`, mimetype: 'audio/mpeg' })

            //  await client.sendMessage(m.from, { audio: { url: p.music_info.play }, ppt: true, mimetype: 'audio/mpeg', fileName: `${p.music_info.title}.mp3`, caption: kemii }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            console.log(e);
            await m.react('🍉')
        }
    }
}
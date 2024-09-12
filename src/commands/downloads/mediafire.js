import { mediafiredl } from "../../lib/scrape/mediafire.js";
import util from 'util'
import { shortener } from "../../lib/shortener.js";
import { inlineCode } from "../../lib/formatter.js";

export default {
    name: 'mediafire',
    aliases: ['mf', 'mediafire', 'mfdl'],
    category: 'Downloads',
    usage: 'link',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd }) => {
        try {

            if (!args[0]) return m.reply(`Please enter the Mediafire URL.  example : ${prefix + cmd} https://mediafire.com/xxxxx`)
            if (!args[0].match(/mediafire/gi)) return m.reply(`The URL you entered is not a Mediafire URL!`)
            await m.react('🕒')
            let res = await mediafiredl(args[0])
            let { url, url2, filename, ext, aploud, filesize, filesizeH } = res
            const links = await shortener(url)
            let caption = `${inlineCode('Successfully downloaded Mediafire')}
      
- *Filename:* ${filename}
- *Size:* ${filesizeH}
- *Extension:* ${ext}
- *Uploaded:* ${aploud}
\n\n⚡️ _by violet-rzk_`.trim()

            if (filesize > 50000) {
                await m.reply(`The file size is too big, size: *${filesizeH}MB*\nminimum 50 MB bro, download it yourself...\n*Download link*: ${links}`)
                await m.react('✅')
            } else {
                m.reply(caption)
                await client.sendFilek(m.from, url, filename, '', m, null, { mimetype: ext, asDocument: true })

                await m.react('✅')
            }

        } catch (e) {
            console.log(e);
            await m.react('🍉')
        }
    }
}
import { delay } from '@whiskeysockets/baileys'
import { tiktok2 } from '../../lib/scrape/tiktok.js'
import { inlineCode } from '../../lib/formatter.js'

export default {
    name: 'tiktok',
    aliases: ['tik', 'ta', 'tikdl', 'tiktok', 'tiktokdl', 'tt', 't'],
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
            return m.reply(`Please enter the Tiktok URL. example : ${prefix + cmd} https://vm.tiktok.com/xxxxx`)

        }
        if (!text.match(/tiktok/gi)) {
            return m.reply('The URL you entered is not a TikTok')

        }
        await m.react('🕒')
        try {
            let old = new Date();
            let p = await tiktok2(`${text}`);
            let kemii = `${inlineCode('Successfully downloaded Tiktok')}\n\n`
            kemii += `- *Title* : ${p.title}\n`
            kemii += `- *Author* : ${p.author.nickname}\n`
            kemii += `- *Fetch* : ${((new Date - old) * 1)} ms`
            kemii += `\n\n⚡️ _by violet-rzk_`
            if (p.hasOwnProperty('images')) {
                let images = p.images
                // console.log(images.length);
                client.sendMessage(m.from, { text: `${kemii}\n with ${images.length} images` }, { quoted: m })
                for (let i = 0; i < images.length; i++) {
                    await delay(2000)
                    await client.sendFileFromUrl(m.from, images[i], '', m)
                    //await client.sendMessage(m.from, { image: { url: images[i] }, caption: kemii }, { quoted: m })


                }
                await m.react('✅')

            } else {
                await client.sendFileFromUrl(m.from, p.play, kemii, m, '', 'mp4');
                //  await client.sendMessage(m.from, { video: { buffer: p.play }, fileName: `${p.author.nickname}-tikdl.mp4`, caption: kemii })
                await m.react('✅')

            }
        } catch (e) {
            console.log(e);
            await m.react('🍉')

        }
    }
}
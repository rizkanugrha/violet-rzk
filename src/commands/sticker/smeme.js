import { Sticker } from "../../utils/sticker.js";
import { upload } from "../../lib/function.js";
import config from '../../utils/config.js'
import util from 'util'
import { statistics } from "../../database/database.js";

export default {
    name: 'smeme',
    aliases: ['smeme', 'stickermeme', 'memestiker', 'stikermeme'],
    category: 'Sticker',
    usage: '<teks atas|teks bawah>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd, url, flags }) => {
        try {
            await m.react('🕒')
            if (m.type == 'imageMessage' || m.quoted && m.quoted.type && m.quoted.type == 'imageMessage') {
                let [atas, bawah] = args.join(' ').replace('--nobg', '').replace('--removebg', '').split('|')
                const mediaData = await client.downloadMediaMessage(m.quoted ? m.quoted : m)
                let bgUrl;
                if (flags.find(v => v.match(/nobg|removebg/))) {
                    const removed = await Sticker.removeBG(mediaData)
                    bgUrl = await upload.pomf(removed)
                } else {
                    bgUrl = await upload.pomf(mediaData)
                }
                const res = await Sticker.memeGenerator(atas ? atas : '', bawah ? bawah : '', bgUrl)
                const data = new Sticker(res, { packname: `${config.name}`, author: config.author })
                await client.sendMessage(m.from, await data.toMessage(), { quoted: m })
                await m.react('✅')
                statistics('sticker')
            } else {
                m.reply(`${m.quoted && m.quoted.mtype == 'stickerMessage' ? 'you\'re replied a sticker message, please ' : ''}send/reply image. example :\n${prefix + cmd} aku diatas | kamu dibawah\n\nwith no background use --nobg`)
            }
        } catch (error) {

            console.log(error);
            await m.react('🍉')

        }
    }
}
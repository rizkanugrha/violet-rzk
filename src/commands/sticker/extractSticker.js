import { Sticker } from "../../utils/sticker.js";
import util from 'util'
import { statistics } from "../../database/database.js"


export default {
    name: 'extract',
    aliases: ['extract'],
    category: 'Sticker',
    usage: '<reply sticker>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd, url, flags }) => {
        try {
            await m.react('🕒')
            if (m.quoted && m.quoted.type == 'stickerMessage') {
                const media = await client.downloadMediaMessage(m.quoted);
                const json = await Sticker.extract(media);
                m.reply(util.format(json));
                await m.react('✅')
                statistics('sticker')
            } else {
                m.reply('reply a sticker');
            }
        } catch (error) {

            console.log(error);
            await m.react('🍉')
        }
    }
}
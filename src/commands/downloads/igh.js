import { createRequire } from 'module';
import moment from 'moment-timezone';
const require = createRequire(import.meta.url);
let { igApi, getCookie, shortcodeFormatter, IGPostRegex } = require("insta-fetcher");
import { inlineCode } from '../../lib/formatter.js'
// using constructor
var prbg = [''] //YOUR COOKIE IG

var apikey = prbg[Math.floor(Math.random() * prbg.length)];
let ig = new igApi(apikey);
import util from 'util'

export default {
    name: 'igh',
    aliases: ['igh', 'ighiglight', 'ighdl'],
    category: 'Downloads',
    usage: 'link igh',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd }) => {
        const hRegex = /https:\/\/www\.instagram\.com\/s\/(.*?)\?story_media_id=(\d+)_(\d+)/g
        const ping = Date.now() - m.timestamps // time milliseconds
        try {
            if (!hRegex.test(args[0])) return m.reply('The URL you entered is not a IG Highlight URL!')
            await m.react('🕒')

            const [, h1, mediaId] = /https:\/\/www\.instagram\.com\/s\/(.*?)\?story_media_id=(\d+)_(\d+)/g.exec(args[0])
            const highlightId = Buffer.from(h1, 'base64').toString('binary').match(/\d+/g)[0]

            const data = await ig._getReels(highlightId);

            let reels_media = data.data.reels_media.find(x => x.id.match(highlightId))

            let item = reels_media.items.find(x => x.id.toString().match(mediaId))
            const mentions = item.tappable_objects.length ? item.tappable_objects.filter(v => v.__typename == 'GraphTappableMention') : []

            let caption =
                `${inlineCode('Successfully downloaded IG Highlight.')} - highlight dari @${item.owner.username}\nTaken at : ${moment(item.taken_at_timestamp * 1000).format('DD/MM/YY HH:mm:ss')}` +
                `\n\n⚡️ _by violet-rzk_`


            if (mentions.length) {
                caption += 'Tagged User:\n'
                for (let u of mentions) {
                    caption += `- @${u.username}\n`
                }
            }

            if (!item.is_video) {
                client.sendMessage(m.from, { image: { url: item.display_url }, caption }, { quoted: m })
                await m.react('✅')

            } else
                client.sendMessage(m.from, { video: { url: item.video_resources[0].src }, caption }, { quoted: m })
            //m.reply(`${inlineCode('succeed.')} - highlight from @${item.owner.username}`)
        } catch (error) {
            await m.react('🍉')
            console.log(error);

        }
    }
}
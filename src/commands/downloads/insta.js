import { createRequire } from 'module';
import moment from 'moment-timezone';
import { inlineCode } from '../../lib/formatter.js';
const require = createRequire(import.meta.url);
let { igApi, getCookie, shortcodeFormatter, IGPostRegex } = require("insta-fetcher");
// using constructor
var prbg = [''] //YOUR COOKIE IG
var apikey = prbg[Math.floor(Math.random() * prbg.length)];
let ig = new igApi(apikey);
import util from 'util'


export default {
    name: 'ig',
    aliases: ['ig', 'igdl', 'insta'],
    category: 'Downloads',
    usage: 'link',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd }) => {
        let text = args[0]
        if (/https:\/\/(www\.)?instagram\.com\/stories\/.+/g.test(text)) {
            try {
                await m.react('🕒')
                let u = text.match(/https:\/\/(www\.)?instagram\.com\/stories\/.+/g)[0]
                let s = u.indexOf('?') >= 0 ? u.split('?')[0] : (u.split('').pop() == '/' != true ? `${u}` : u);
                let [username, storyId] = s.split('/stories/')[1].split('/')
                const data = await ig.fetchStories(username);
                let media = data.stories.filter(x => x.id.match(storyId))
                if (media[0].type == "image") {
                    await client.sendFileFromUrl(
                        m.from, media[0].url, `${inlineCode(`Successfully downloaded Stories`)}\n_Stories from @${username}_\nTaken at : ${moment(media[0].taken_at * 1000).format('DD/MM/YY HH:mm:ss')}\n\n⚡️ _by violet-rzk_`, m, '', 'jpeg',
                        { height: media[0].original_height, width: media[0].original_width }
                    )
                    await m.react('✅')
                } else {
                    await client.sendFileFromUrl(
                        m.from, media[0].url, `${inlineCode(`Successfully downloaded Stories`)}\n_Stories from @${username}_\nTaken at : ${moment(media[0].taken_at * 1000).format('DD/MM/YY HH:mm:ss')}\n\n\n\n⚡️ _by violet-rzk_`, m, '', 'mp4',
                        { height: media[0].original_height, width: media[0].original_width }
                    )
                    await m.react('✅')
                }
            } catch (error) {
                console.log(error);
                await m.reply(util.format(error))
                await m.react('🍉')

            }
        } else if (IGPostRegex.test(text)) {
            try {

                await m.react('🕒')

                let { url } = shortcodeFormatter(text);
                let result = await ig.fetchPost(url);
                let arr = result.links;
                let capt = `${inlineCode(`Successfully downloaded Instagram`)}\nmedia from -> @${result.username}` +
                    `\n\n⚡️ _by violet-rzk_`

                //   m.reply(capt)
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].type == "image") {
                        await client.sendFileFromUrl(m.from, arr[i].url, capt, m, '', 'jpeg',
                            { height: arr[i].dimensions.height, width: arr[i].dimensions.width }
                        )
                        await m.react('✅')
                    } else {
                        await client.sendFileFromUrl(m.from, arr[i].url, capt, m, '', 'mp4',
                            { height: arr[i].dimensions.height, width: arr[i].dimensions.width }
                        )
                        await m.react('✅')
                    }
                }
            } catch (error) {
                console.log(error);

                await m.react('🍉')
            }
        }
    }
}
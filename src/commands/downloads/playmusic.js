import { YT } from '../../lib/scrape/yt2.js'
import { formatK } from '../../utils/utils.js'
import util from 'util'
import { inlineCode } from '../../lib/formatter.js';

export default {
    name: 'play',
    aliases: ['play', 'playmusic'],
    category: 'Downloads',
    usage: 'artist - title',
    execute: async (m, client, { prefix, args, cmd }) => {
        try {
            await m.react('🕒');
            client.ytplay = client.ytplay || {};

            if (args.length < 1) {
                return await m.reply(`Please provide a song title.\n\nUsage: ${prefix}${cmd} song-title - artist\nExample: ${prefix}${cmd} samudra janji - bima tarore`);
            }

            // Perform YouTube search
            const list = await YT.search(args.join(' '));
            if (!list || list.length === 0) {
                return await m.reply("No results found.");
            }

            // Limit results to 10
            client.ytplay[m.from] = {
                ytlist: list.slice(0, 10).map((obj, index) => ({
                    index: index + 1,
                    title: obj.title,
                    channel: obj.author.name,
                    duration: obj.timestamp,
                    views: formatK(obj.views),
                    uploaded: obj.ago,
                    url: obj.url
                })),
                key: null
            };

            // Format the search results
            let tex = `${inlineCode('Youtube Music Search Results')}\n\n`;
            tex += client.ytplay[m.from].ytlist.map(item =>
                `*${item.index}.* *${item.title}*\n` +
                `🐓 *Channel:* ${item.channel}\n` +
                `⌛ *Duration:* ${item.duration}\n` +
                `👀 *Views:* ${item.views}\n` +
                `📅 *Uploaded:* ${item.uploaded}`
            ).join("\n\n");

            // Send the search results to the user
            await client.sendMessage(m.from, { text: `${tex}\n⚡️ _by violet-rzk_` }, m);

            // Ask the user to select a number
            let { key } = await client.sendMessage(m.from, { text: `Reply to this message with the index number of the music you want to download.` });
            client.ytplay[m.from].key = key;

        } catch (e) {
            console.error(e);

            await m.react('🍉');
        }
    }
};

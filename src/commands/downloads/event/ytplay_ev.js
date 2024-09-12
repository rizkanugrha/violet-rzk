import { YT } from '../../../lib/scrape/yt2.js'
import { isUrl, getBuffer, humanFileSize, secondsConvert, formatK } from '../../../utils/utils.js'
import util from 'util'
import { inlineCode } from '../../../lib/formatter.js';

export async function execute(m, client, { body, args }) {
    try {
        // Initialize ytplay if it doesn't exist
        client.ytplay = client.ytplay || {};
    } catch (e) {
        console.error(e);
        return;
    }

    // Check if there is an ongoing ytplay session for this user
    if (!client.ytplay[m.from] || !client.ytplay[m.from].ytlist || !client.ytplay[m.from].key) {
        // No active session found
        // return await m.reply("⚠️ No registration data found for this session.");
        return
    }

    const ytlist = client.ytplay[m.from].ytlist;

    // Ensure the message is a reply to the expected key and has valid input
    if (!m.quoted || m.quoted.id !== client.ytplay[m.from].key.id || !m.body) {
        return await m.reply("⚠️ Please reply to the message with a valid index number.");
    }

    const index = parseInt(m.body.trim());
    if (isNaN(index) || index < 1 || index > ytlist.length) {
        return await m.reply("⚠️ Enter a valid number based on the YouTube search list.");
    }

    // Retrieve the selected video from ytlist
    const selectedVideo = ytlist[index - 1];

    // Fetch video details and download links
    try {
        const video = await YT.mp4(selectedVideo.url);
        const audio = await YT.mp3(selectedVideo.url, '', true);

        // Prepare the result for the response
        let caption = `${inlineCode('Successfully Play Music')}\n\n` +
            `*Title:* ${video.title}\n` +
            `*Channel:* ${video.channel}\n` +
            `*Published:* ${video.date}\n` +
            `*Duration:* ${secondsConvert(video.duration)}\n` +
            `*FileSize:* ${humanFileSize(audio.size)}` +
            `\n\n⚡️ _by violet-rzk_`;

        // Send video thumbnail and information to the user
        await client.sendMessage(m.from, { image: { url: video.thumb }, caption: caption }, { quoted: m });


        await client.sendFile(m.from, audio.path, m, {
            audio: true,
            fileName: `${video.title}.mp3`,
            mimetype: 'audio/mpeg',
            jpegThumbnail: (await getBuffer(video.thumb)).buffer
        });
        await m.react('✅');

        // Clear session data
        delete client.ytplay[m.from];

    } catch (error) {
        console.error(error + `ytpla`);
        await m.react('🍉')

    }
}

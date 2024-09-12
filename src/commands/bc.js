import axios from "axios";
import config from "../utils/config.js";
import { runtime } from "../lib/function.js";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
import os from 'os'

export default {
    name: 'bc',
    aliases: ['bc'],
    category: 'Owner',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: true,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        try {
            let text = args.join(' ');
            let getGroups = await client.groupFetchAllParticipating();
            let groups = Object.entries(getGroups)
                .slice(0)
                .map((entry) => entry[1]);

            if (groups.length === 0) {
                return m.reply('No groups found to broadcast.');
            }

            let groupIds = groups.map((v) => v.id);
            m.reply(`Sending Broadcast to ${groupIds.length} Group Chats, Estimated Completion Time ${groupIds.length * 1.5} seconds`);

            for (let groupId of groupIds) {
                try {
                    // Example: Initialize session or connection before sending
                    // await libsignal.initSession(groupId); // Example function to initialize session

                    await sleep(1500);
                    let txt = `「 Broadcast 」\n\n${text}`;
                    client.sendMessage(groupId, { text: txt });
                } catch (error) {
                    console.error(`Error sending broadcast to group ${groupId}:`, error);
                    // Handle error as needed, e.g., retry logic or logging
                }
            }

            m.reply(`Broadcast Successfully Sent to ${groupIds.length} Groups`);
        } catch (err) {
            console.error('Error executing command:', err);
            // Handle main execution error, e.g., notify user or log
        }
    }
}
/**/
import axios from "axios";
import config from "../utils/config.js";
import { runtime } from "../lib/function.js";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
import os from 'os'

export default {
    name: 'tes',
    aliases: ['tes', 'bot'],
    category: 'General',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        //jid, text = '', footer = '', buffer, buttons, copy, urls, list, quoted, options
        /*
     sendButtonCustom: {
                 async value(jid, text, buttons, footer, quoted, options = {})
        */

        let caption =
            ` Aktif
    *_Runtime OS_*
    ${runtime(os.uptime())}
    
    *_Runtime Bot_*
    ${runtime(process.uptime())}
    `
        let wm = `_by ${config.author}_`
        let sgc = `https://chat.whatsapp.com/IxNxHOi27GUCtSE9Ua3vxt`
        await client.sendButton(m.from, [
            [caption, wm, null, [
                ["Menu", prefix + "menu"]
            ], null, [
                    ["Official Group", sgc]
                ], null]
        ], m, {
            contextInfo: {
                mentionedJid: [m.sender]
            }
        });
    }
}

/**
 * Author  : Rizka Nugraha
 * Name    : violet-rzk
 * Version : 2.8.24
 * Update  : 2 Agustus 2024
 * 
 * If you are a reliable programmer or the best developer, please don't change anything.
 * If you want to be appreciated by others, then don't change anything in this script.
 * Please respect me for making this tool from the beginning.
 */

import util from 'util';
import Color from '../lib/color.js';
import { commands, events } from '../lib/loadcmd.js';
import moment from 'moment';
import { cutStr } from '../utils/utils.js';
import config from '../utils/config.js';
import { groupManage, statistics, UserManage } from '../database/database.js';
/**
 * 
 * @param {import('@whiskeysockets/baileys').WASocket} client 
 * @param {any} store 
 * @param {import('@whiskeysockets/baileys').WAMessage} m 
 */


export async function Messages(client, m) {
    try {
        if (m.key.fromMe) {
            await statistics('msgSent')
        } else {
            await statistics('msgRecv')
            await UserManage.add(m.sender)
        }
        let quoted = m.isQuoted ? m.quoted : m;
        let downloadM = async filename => await client.downloadMediaMessage(quoted, filename);
        let times = m.timestamps
        const type = m.type
        const body = m.body
        let pushname = m.pushName
        const isOwner = m.isOwner

        //gruop deklar
        const isGroupMsg = m.isGroup
        let groupMembers = m.groupMember
        let groupAdmins = m.groupAdmins
        let isGroupAdmin = m.isAdmin || m.isOwner
        let isBotGroupAdmin = m.isBotAdmin
        //console.log(m.isBotAdmin);

        let formattedTitle = m.gcName

        const prefix = m.prefix
        const arg = body.substring(body.indexOf(' ') + 1)
        const args = m.args
        const flags = [];
        const isCmd = (m.prefix && m.isCmd) || false
        const cmd = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : null
        let url = m.url

        for (let i of args) {
            if (i.startsWith('--')) flags.push(i.slice(2).toLowerCase())
        }

        // senggel
        if (body == 'bot' || body == 'Bot' || body == 'p' || body == 'P') {
            client.sendMessage(m.from, {
                text:
                    `Dalemm.. Aku on... Langsung saja ${m.prefix}menu @` +
                    m.sender.split("@")[0].split(":")[0],
                contextInfo: { mentionedJid: [m.sender] },
            });
        }

        //fix anu
        if (body == m.prefix) {
            return
        }

        //jika cmd maka composing
        if (isCmd && config.composing) {
            await client.presenceSubscribe(m.from)
            await client.sendPresenceUpdate('composing', m.from)
        }

        //add to db
        if (isGroupMsg) {
            await groupManage.add(m.from, formattedTitle)
        }


        // memunculkan ke log
        if (m.message && !m.isBot && !m.key.fromMe) {
            if (!isCmd) {
                console.log(Color.yellowBright('[MSG] ' + moment(times).format('DD/MM/YYYY HH:mm:ss')), Color.cyan(' ~> ' + body + ` (${(type)}) ` + 'from ' + pushname), Color.yellowBright(m.isGroup ? `in ` + formattedTitle : 'in Private'));
            } else {
                console.log(Color.greenBright('[CMD] ' + moment(times).format('DD/MM/YYYY HH:mm:ss')), Color.blueBright(' ~> ' + cmd + ` [${args.length}] ` + cutStr(body) + ` from ${pushname}`), Color.greenBright(m.isGroup ? `in ` + formattedTitle : 'in Private'));
            }
        }


        // event organizer

        setImmediate(() =>
            events.forEach((event, key) => {

                try {
                    if (typeof event.execute === "function") {
                        event.execute(m, client, { body, prefix, args, arg, cmd, url, flags, isBotGroupAdmin, isGroupAdmin, groupAdmins, groupMembers, formattedTitle })

                    }
                } catch (e) {
                    console.log('[INFO E] : %s', Color.redBright(e + key))
                    console.log(Color.redBright('[ERR EVENT] '), Color.cyan(' ~> ' + ` ${key} [${body.length}] ` + 'from ' + pushname), Color.yellowBright(m.isGroup ? `in ` + formattedTitle : 'in Private'));
                }
            })
        )


        //commandss
        if (!isCmd) return

        const command = commands.get(cmd) || Array.from(commands.values()).find(cmdObj => cmdObj.aliases && cmdObj.aliases.includes(cmd));

        if (!command) return m.reply(`💔 *command not found!!*`)


        if (command?.pconly && isGroupMsg)
            return m.reply(`🟨 ${config.cmdMsg.pconly}`)
        if (command?.group && !isGroupMsg)
            return m.reply(`🟨 ${config.cmdMsg.groupMsg}`)
        if (command?.admin && isGroupMsg && !isGroupAdmin)
            return m.reply(`🟨 ${config.cmdMsg.notGroupAdmin}`)
        if (command?.botAdmin && isGroupMsg && !isBotGroupAdmin)
            return m.reply(`🟨 ${config.cmdMsg.botNotAdmin}`)
        if (command?.owner && !isOwner)
            return m.reply(`🟨 ${config.cmdMsg.owner}`)

        // Check if the command object has an execute function
        if (typeof command.execute !== "function") {
            return
        }



        try {
            await command.execute(m, client, { body, prefix, args, arg, cmd, url, flags, isBotGroupAdmin, isGroupAdmin, groupAdmins, groupMembers, formattedTitle })
            await statistics('cmd')
        } catch (e) {
            console.log('[ERR C] : %s', Color.redBright(e))
            console.log(Color.redBright('[ERR CMD] '), Color.cyan(' ~> ' + ` [${body.length}]` + 'from ' + pushname), Color.yellowBright(m.isGroup ? ` in ` + formattedTitle : 'in Private'));

        }


    } catch (err) {
        await m.reply(util.format(err));
    }
}

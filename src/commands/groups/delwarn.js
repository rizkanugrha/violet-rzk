import util from 'util'
import { delay, areJidsSameUser } from "@whiskeysockets/baileys"
import { groupManage, UserManage } from "../../database/database.js"

export default {
    name: 'unwarn',
    aliases: ['unwarn', 'delwarn'],
    category: 'Groups',
    usage: '<reply/tag member>',
    pconly: false,
    group: true,
    admin: true,
    botAdmin: true,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, groupAdmins, isBotGroupAdmin }) => {
        try {
            await m.react('🕒')

            if (m.quoted) {
                let user = await UserManage.get(m.quoted.sender)
                if (user) {
                    if (user.warn == 0) {
                        if (m.isGroup) {
                            if (isBotGroupAdmin) {
                                m.reply(`He hasn't a warning`)
                            }
                        }

                    } else {
                        if (m.isGroup) {
                            if (isBotGroupAdmin) {
                                m.reply(`he had ${user.warn} warning before`)

                                await UserManage.update(m.quoted.sender, { warn: 0 });
                                //    await m.reply(`Done delete warn ${user}\nkamu memiliki ${user.warn} warning`)
                                user = await UserManage.get(m.quoted.sender)
                                await client.sendMessage(m.from, {
                                    text:
                                        "Done delete warn @" +
                                        m.quoted.sender.split("@")[0].split(":")[0] + ` he now has a ${user.warn} warning`,
                                    contextInfo: { mentionedJid: [m.quoted.sender] },
                                });
                                await m.react('✅')

                            }
                        }
                    }
                }
            } else if (args.length >= 1 || m.mentionedJid.length >= 1) {
                let _participants = m.mentionedJid.filter(u => !areJidsSameUser(u, client.user.id))
                let user = await UserManage.get(_participants)
                if (_participants.length < 1) return m.reply(`tag user or reply he message, example : ${prefix + cmd} @user`)
                if (user) {
                    if (user.warn == 0) {
                        if (m.isGroup) {
                            if (isBotGroupAdmin) {
                                m.reply(`He hasn't a warning`)
                            }
                        }
                    } else {
                        if (m.isGroup) {
                            if (isBotGroupAdmin) {
                                m.reply(`he had ${user.warn} warning before`)

                                await UserManage.update(_participants, { warn: 0 });
                                //    await m.reply(`Done delete warn ${user}\nkamu memiliki ${user.warn} warning`)
                                user = await UserManage.get(_participants)
                                await client.sendMessage(m.from, {
                                    text:
                                        "Done delete warn @" +
                                        user.userId.split("@")[0].split(":")[0] + ` he now has a ${user.warn} warning`,
                                    contextInfo: { mentionedJid: [user.userId] },
                                });
                                await m.react('✅')

                            }
                        }
                    }
                }
            }

        } catch (error) {
            await m.react('🍉')

            console.log(error);
        }
    }
}
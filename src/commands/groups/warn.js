import util from 'util'
import { groupManage, UserManage } from "../../database/database.js"

export default {
    name: 'warn',
    aliases: ['warn'],
    category: 'Groups',
    usage: '<reply msg member>',
    pconly: false,
    group: true,
    admin: true,
    botAdmin: true,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, groupAdmins, isBotGroupAdmin, isGroupAdmin, isOwner, formattedTitle }) => {

        try {
            await m.react('🕒')
            if (m.quoted) {
                let user = await UserManage.get(m.quoted.sender)
                if (user) {
                    let updateWarn = user.warn === 0 ? 1 : user.warn + 1;
                    await UserManage.update(m.quoted.sender, { warn: updateWarn });
                    user = await UserManage.get(m.quoted.sender);

                    await client.sendMessage(m.from, {
                        text:
                            "Warning untuk @" +
                            m.quoted.sender.split("@")[0].split(":")[0] + ` karena telah melanggar peraturan grup atau berkata kasar\ndia sekarang memiliki ${user.warn} warning`,
                        contextInfo: { mentionedJid: [m.quoted.sender] },
                    });
                    await m.react('✅')

                    if (user.warn == 5) {
                        if (m.isGroup) {
                            if (isBotGroupAdmin) {
                                client.groupParticipantsUpdate(m.from, [m.quoted.sender], "remove")
                                await UserManage.update(m.quoted.sender, { warn: 0 });
                            }
                        }
                    }
                    await m.react('✅')

                }
            } else {
                m.reply(`reply pesan member untuk memberikan warning`)
            }
        } catch (error) {
            m.reply(util.format(error))
            await m.react('🍉')

            console.log(error);
        }
    }
}
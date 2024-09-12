import { delay } from "@whiskeysockets/baileys"
import { groupManage, UserManage } from "../../../database/database.js"
import { color } from "../../../utils/utils.js"
import moment from "moment-timezone"
const t = Date.now();

let badwordRegex = /\b(anj(k|g)|ajn?(g|k)|a?njin(g|k)|bajingan|b(a?n)?gsa?t|ko?nto?l|me?me?(k|q)|pe?pe?(k|q)|meki|titi(t|d)|pe?ler|tetek|toket|ngewe|go?blo?k|to?lo?l|idiot|(k|ng)e?nto?(t|d)|jembut|bego|dajj?al|janc(u|o)k|pantek|puki ?(mak)?|kimak|kampang|lonte|col(i|mek?)|pelacur|henceu?t|nigga|fuck|bitch|tits|bastard|asshole|dontol|kontoi|ontol|tai|bajingan|blok|celen(g|k))\b/i;

export const botAdmin = true
export const group = true

export async function execute(m, client, { body, prefix, groupAdmins, isBotGroupAdmin, isGroupAdmin, isOwner, formattedTitle }) {
    if (m.fromMe) return
    if (!m.isGroup) return
    let chat = await groupManage.get(m.from)
    let user = await UserManage.get(m.sender)
    // console.log(chat);
    const bodyLow = body.toLowerCase();
    let isBadword = badwordRegex.exec(bodyLow)

    if (user) {
        if (chat.antiBadword && isBadword) {
            if (isGroupAdmin) return

            let updateWarn = user.warn === 0 ? 1 : user.warn + 1;
            await UserManage.update(m.sender, { warn: updateWarn });
            user = await UserManage.get(m.sender);
            await m.reply('Jangan Toxic ya!\n' + `kamu memiliki ${user.warn} warning`)

            console.log(color('[MISUH]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), color(`${m.text}`), 'from', color(m.pushname), 'in', color(formattedTitle))
            if (user.warn == 5) {
                if (m.isGroup) {
                    if (isBotGroupAdmin) {
                        client.groupParticipantsUpdate(m.from, [m.sender], "remove")
                        await UserManage.update(m.sender, { warn: 0 });
                    }
                }
            }
        }
    }
    return
}
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

import { jidDecode } from "@whiskeysockets/baileys";
import { groupManage } from "../database/database.js";

export async function GroupParticipants(anu, client) {
    try {
        // loadDatabase(anu);

        const botNumber = client.user.id
        let jid = anu.id;
        // console.log(jid);
        let meta = await client.groupMetadata(jid)
        let participants = anu.participants
        const group = await groupManage.get(jid);

        // Periksa status selamat datang dari objek grup yang didapat
        if (group) {
            const welcomeStatus = group.welcome;
            const leaveStatus = group.leave;
            console.log(`Welcome status for group ${jid} is: ${welcomeStatus}`);
            for (let x of participants) {
                if (x == botNumber) return
                let dp = 'https://telegra.ph/file/3ccf9d18530dca4666801.jpg'

                try {
                    dp = await client.profilePictureUrl(x, 'image')
                } catch (error) { } finally {
                    console.log(dp);
                    let textAdd = welcomeStatus.msg.replace('@user', `@${jidDecode(x).user}`).replace('{title}', meta.subject)
                    let textRemove = leaveStatus.msg.replace('@user', `@${jidDecode(x).user}`).replace('{title}', meta.subject)

                    if (anu.action == 'add' || anu.action == 'revoked_membership_requests' && welcomeStatus.status) {

                        client.sendMessage(jid, {
                            text: textAdd,
                            contextInfo: { mentionedJid: [x] }
                        })
                        if (textAdd.includes('{foto}')) {
                            client.sendMessage(jid, { image: { url: dp }, mentions: [x], caption: textAdd.replace('{foto}', '') })
                        } else {
                            client.sendMessage(jid, { text: textAdd, mentions: [x] })
                        }
                    } else if (anu.action == 'remove' && leaveStatus.status) {
                        client.sendMessage(jid, {
                            text: textRemove,
                            contextInfo: { mentionedJid: [x] }// sek ng db urung tk kei {foto}
                        })
                        if (textRemove.includes('{foto}')) {
                            client.sendMessage(jid, { image: { url: dp }, mentions: [x], caption: textRemove.replace('{foto}', '') })
                        } else {
                            client.sendMessage(jid, { text: textRemove, mentions: [x] })
                        }
                    }
                }
                if (anu.action == 'promote') {
                    //  client.sendMessage(jid, { mentions: [x], caption:  })
                    client.sendMessage(jid, {
                        text: `Selamat @${x.split('@')[0]} atas jabatan menjadi admin di *${meta.subject}*`,
                        mentions: [x]
                    })
                } else if (anu.action == 'demote') {
                    client.sendMessage(jid, {
                        text: `kamu @${x.split('@')[0]} telah di demote dari admin di *${meta.subject}*`,
                        mentions: [x]
                    })
                }
            }
        }
    } catch (error) {
        console.log(error);
    }

}
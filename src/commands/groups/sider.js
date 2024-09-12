import { S_WHATSAPP_NET } from "@whiskeysockets/baileys";
const parseMention = (text) => [...text.matchAll(/@?([0-9]{5,16}|0)/g)].map((v) => v[1] + S_WHATSAPP_NET);




export default {
    name: 'sider',
    aliases: ['sider'],
    category: 'Groups',
    pconly: false,
    group: true,
    admin: true,
    botAdmin: true,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url }) => {
        try {
            let messages = store.messages[m.from].array.filter(v => v.key.participant !== '');

            let participantsCount = {};
            let teks, list;
            messages.forEach((message) => {
                const participant = message.key.participant;
                participantsCount[participant] = (participantsCount[participant] || 0) + 1;
            });

            // Menyiapkan array objek hasil
            let resultArray = [];
            for (const participant in participantsCount) {
                resultArray.push({
                    nomor: participant,
                    jumlah: participantsCount[participant]
                });
                list = resultArray.map((v, i) => `${i + 1}.  @${v.nomor.split`@`[0]}: ${v.jumlah} chats`).join('\n')
                teks = `* Sider \n
List chats member:
${list} `
            }
            client.sendMessage(m.from, {
                text: teks,
                mentions: parseMention(list)
            });
        } catch (e) {

            console.log(e);
        }
    }


}
import { jidDecode } from "@whiskeysockets/baileys"
import { getAfk } from "../../../database/database.js"
import moment from "moment-timezone"

export const group = true
export const botAdmin = true

const tanda = '```'
// ebenr urung;v 
// sengojo crud ne tak gawe kokui tak genti sintak e mongose tok
export async function execute(m, client, { body, prefix, cmd }) {
    try {
        if (m.isBot) return
        let listAfk = await getAfk.getAll()
        if (listAfk.length > 0) {
            listAfk.map(async x => {
                if (m.sender == x.jid && x.groupId == m.from) {
                    if (!body.toLowerCase().startsWith(`${prefix}afk`)) {
                        m.reply(`❌ @${m.sender.split('@')[0]} Sekarang tidak AFK!`, m.from, { mentions: [m.sender] })
                        getAfk.delete(m.sender, m.from)
                    }
                } else {
                    var duration = moment.duration(moment().diff(moment(x.waktu)));
                    const times = `${tanda}${duration.days()}d: ${duration.hours()}h: ${duration.minutes()}m: ${duration.seconds()}s:${tanda}`
                    if (body.includes(x.jid.split('@')[0]) && m.from == x.groupId) {
                        if (/image|video/i.test(m.quoted ? m.quoted.mtype : m.mtype)) {
                            await m.reply(`❌ @${x.jid.split('@')[0]} sedang AFK!\n├ Sejak ${times}\n└ Reason : *${x.reason}*`, m.from, { mentions: [x.jid] })
                            let text = `Karena anda sedang ${x.reason}, teman anda mengirimkan gambar.\n\n` +
                                `GRUP = ${x.groupName}\nNOMER = ${m.sender.split('@')[0]}\nPESAN = ${body.replace(`@${jidDecode(x.jid).user}`, `@TAG`)}`
                            let ms = m.quoted ? m.getQuotedObj() : m
                            await client.copyNForward(x.jid, client.cMod(x.jid, ms, text, client.user.id), true)
                        } else {
                            await m.reply(`❌ @${x.jid.split('@')[0]} sedang AFK!\n├ Sejak ${times}\n└ Reason : *${x.reason}*`, m.from, { mentions: [x.jid] })
                            let text = `Karena anda sedang ${x.reason}, teman anda mengirimkan pesan.\n\n` +
                                `GRUP = ${x.groupName}\nNOMER = ${m.sender.split('@')[0]}\nPESAN = ${body.replace(`@${jidDecode(x.jid).user}`, `@TAG`)}`
                            client.sendMessage(x.jid, { text })
                        } // jir bro ;v
                    }
                }
            })
        }
    } catch (e) {
        m.reply(`${e}`)
        console.log(e)
    }
}
import moment from "moment-timezone"
import { getAfk } from "../../database/database.js"
import util from 'util'
const tanda = '```'
export default {
    name: 'afk',
    aliases: ['afk'],
    category: 'Groups',
    usage: 'reason',
    pconly: false,
    group: true,
    admin: false,
    botAdmin: true,
    owner: false,
    execute: async (m, client, { args, formattedTitle, prefix, body }) => {
        // console.log(m.sender, )
        try {
            const isAfk = await getAfk.get(m.sender, m.from)//eh wes ono add lali,gubolok ra djhapus rangaruh ndlogok jarabn pr, ngaruh to kan findall
            console.log(isAfk);
            await m.react('🕒')

            if (m.isGroup) {
                console.log(isAfk);
                if (isAfk) {
                    if (args.length >= 1) {
                        await getAfk.update(m.sender, m.from, moment(), args.join(' '))
                        m.reply(`✅ ${m.pushName} NOW AFK!!`)
                        await m.react('✅')

                    } else {
                        getAfk.update(m.sender, m.from, moment(), '-')
                        m.reply(`✅ ${m.pushName} NOW AFK!!`)
                        await m.react('✅')

                    }
                } else {
                    if (args.length >= 1) {
                        getAfk.add(m.sender, m.from, formattedTitle, moment(), args.join(' '))
                        m.reply(`✅ ${m.pushName} NOW AFK!!`)
                        await m.react('✅')

                    } else {
                        getAfk.add(m.sender, m.from, formattedTitle, moment(), 'radong')
                        m.reply(`✅ ${m.pushName} NOW AFK!!`)
                        await m.react('✅')

                    }
                }
            }

        } catch (error) {
            console.log(error);
            await m.react('🍉')

        }
    }
}
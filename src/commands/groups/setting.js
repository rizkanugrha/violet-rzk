
import { isUrl } from '../../utils/utils.js';
import config from '../../utils/config.js'
import util from 'util';
const opts = ['open', 'close', 'dp', 'title', 'desc'];
import cron from 'node-cron'


export default {
    name: 'setting',
    aliases: ['set', 'setting'],
    category: 'Groups',
    usage: '<open/close/dp/title/desc>',
    pconly: false,
    group: true,
    admin: true,
    botAdmin: true,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url }) => {
        try {
            await m.react('🕒')
            let _text = args.slice(1).join(' ')

            if (/^lock|tutup|close$/.test(args[0])) {
                if (/^jam|time$/.test(args[1])) {
                    let [jam, menit] = args.slice(2).join(' ').split(':')
                    var closed = cron.schedule(`${menit} ${jam} * * *`, async () => {
                        console.log('cloesd grup');
                        await client.groupSettingUpdate(m.from, 'announcement')
                        m.reply('success close group otomatis')

                        await m.react('✅')
                    }, {
                        scheduled: true,
                        timezone: "Asia/Jakarta"
                    });

                    m.reply(`berhasil set close otomatis jam ${jam}:${menit} wib`)
                    closed.start();
                } else {
                    await client.groupSettingUpdate(m.from, 'announcement')
                    m.reply('success close group')
                    await m.react('✅')

                }
            } else if (/^buka|open|unlock$/.test(args[0])) {
                // let time = args[2]
                if (/^jam|time$/.test(args[1])) {
                    // let time = args[2]
                    let [jam, menit] = args.slice(2).join(' ').split(':')
                    var opend = cron.schedule(`${menit} ${jam} * * *`, async () => {
                        console.log('opened grup');
                        await client.groupSettingUpdate(m.from, 'not_announcement')
                        m.reply('success open group otomatis')
                        await m.react('✅')

                    }, {
                        scheduled: true,
                        timezone: "Asia/Jakarta"
                    });

                    m.reply(`berhasil set open otomatis jam ${jam}:${menit} wib`)
                    opend.start();
                } else {
                    await client.groupSettingUpdate(m.from, 'not_announcement')
                    m.reply('success open group')
                    await m.react('✅')

                }
            } else if (args[0] === 'image' || args[0] === 'dp') {
                if (m.mtype == 'imageMessage' || m.quoted && m.quoted.mtype == 'imageMessage') {
                    const message = m.quoted ? m.quoted : m
                    const buffer = await client.downloadMediaMessage(message)
                    await client.updateProfilePicture(m.from, buffer)
                    await m.react('✅')

                } else if (isUrl(url)) {
                    await client.updateProfilePicture(m.from, { url })
                    await m.react('✅')


                } else {
                    m.reply(`send/reply image, or you can use url that containing image`)
                }
            } else if (/^title|name|nama|subject$/.test(args[0])) {
                if (_text.length < 1) return m.reply(`Mengubah nama group, example: ${prefix + cmd} ${args[0]} ${config.name}`)
                const _before = (await client.groupMetadata(m.from)).subject
                await client.groupUpdateSubject(m.from, _text)
                m.reply(`Berhasil mengubah nama group.\n\nBefore : ${_before}\nAfter : ${_text}`)
                await m.react('✅')


            } else if (/^desc|desk|deskripsi|description|rules$/.test(args[0])) {
                if (_text.length < 1) return m.reply(`Mengubah deskripsi group, example: ${prefix + cmd} ${args[0]} ssstt... dilarang mengontol wkwkwk!`)
                await client.groupUpdateDescription(m.from, _text)
                await m.react('✅')

            } else {
                m.reply(`masukkan opsi, contoh: ${prefix + cmd} close => menutup group\n\nlist opsi:\n-${opts.join('\n-')}`)
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
            await m.react('🍉')

        }
    }
}



import util from 'util';
import { groupManage } from '../../database/database.js';

export default {
    name: 'setwelcome',
    aliases: ['setwel', 'setwelcome'],
    category: 'Groups',
    usage: '<on/off/msg>',
    pconly: false,
    group: true,
    admin: true,
    botAdmin: true,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url }) => {
        try {
            await m.react('🕒')

            let json = await groupManage.get(m.from);
            if (json) {
                if (args[0] == 'on') {
                    if (json.welcome.status) return m.reply('welcome sudah aktif sebelumnya ✅')
                    json.welcome.status = true
                    console.log(json.welcome.status);
                    await groupManage.update(m.from, json)
                    m.reply('Welcome Message telah diaktifkan dengan msg: \n' + json.welcome.msg)

                    await m.react('✅')
                } else if (args[0] == 'off') {
                    if (!json.welcome.status) return m.reply('welcome sudah off sebelumnya ❌')
                    json.welcome.status = false
                    await groupManage.update(m.from, json)
                    m.reply('Welcome Message telah Non-aktifkan')
                    await m.react('✅')

                } else if (args[0] == 'msg') {
                    const q = args.slice(1).join(' ')
                    if (!q) return m.reply(`pesan diperlukan, contoh: ${prefix + cmd} msg sugeng rawuh @user wonten ing group {title}`)
                    json.welcome.msg = q
                    await groupManage.update(m.from, json)
                    m.reply('Welcome Message telah diubah ke : \n' + q)
                    await m.react('✅')

                } else {
                    m.reply(`Custom pesan welcome untuk menyambut member yang baru join!
*Penggunaan :*
• ${prefix}setwelcome <msg|on|off>
• msg <custom welcome> : set pesan welcome
• on : mengaktifkan
• off : menonaktifkan
    
*Format :*
• @user : pesan dengan tag (selamat datang @user)
• {title} : pesan dengan nama grup (selamat datang di grup *Title*)
• {foto} : pesan dengan foto
    
*Contoh :*
• ${prefix}setwelcome msg Halo selamat datang @user di grup {title}, silahkan memperkenalkan diri!`)
                }
            }

        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
            await m.react('🍉')

        }
    }


}
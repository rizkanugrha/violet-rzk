import { cropStyle, Sticker } from "../../utils/sticker.js"
import config from '../../utils/config.js'
import { Emoji } from "../../utils/exif.js"
import { isUrl } from '../../utils/utils.js'
import util from 'util'
import fetch from 'node-fetch'
import { statistics } from '../../database/database.js'

export default {
    name: 'sticker',
    aliases: ['s', 'sticker', 'stiker'],
    category: 'Sticker',
    usage: '<send/reply media>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        let crop = flags.find(v => cropStyle.map(x => x == v.toLowerCase()))
        let packname = /\|/i.test(body) ? arg.split('|')[0] : `${config.name} `
        let stickerAuthor = /\|/i.test(body) ? arg.split('|')[1] : `${config.author}`
        let categories = Object.keys(Emoji).includes(arg.split('|')[2]) ? arg.split('|')[2] : 'greet' || 'greet'
        try {

            await m.react('🕒')

            if (m.type == 'imageMessage' || m.quoted && m.quoted.type == 'imageMessage') {
                const message = m.quoted ? m.quoted : m
                const buff = await client.downloadMediaMessage(message)
                if (flags.find(v => v.match(/nobg|removebg/))) {
                    const data = Sticker.removeBG(buff)
                    const hasil = new Sticker(data, { packname, author: stickerAuthor, packId: '', categories }, crop)
                    await client.sendMessage(m.from, await hasil.toMessage(), { quoted: m })
                    statistics('sticker')
                    await m.react('✅')
                } else {
                    const data = new Sticker(buff, { packname, author: stickerAuthor, packId: '', categories }, crop)
                    await client.sendMessage(m.from, await data.toMessage(), { quoted: m })
                    statistics('sticker')
                    await m.react('✅')
                }

            } else if (m.type == 'videoMessage' || m.quoted && m.quoted.type == 'videoMessage') {
                if (m.quoted ? m.quoted.seconds > 15 : m.message.videoMessage.seconds > 15) return m.reply('too long duration, max 15 seconds')
                const message = m.quoted ? m.quoted : m
                const buff = await client.downloadMediaMessage(message)
                let data = await mp4ToWebp(buff, { pack: packname, author: stickerAuthor })
                //  const data = new Sticker(buff, { packname, author: stickerAuthor, packId: '', categories })
                await client.sendMessage(m.from, { sticker: data }, { quoted: m })
                statistics('sticker')
                await m.react('✅')

            } else if (m.quoted && m.quoted.type == 'stickerMessage' && !m.quoted.isAnimated) {
                const buff = await client.downloadMediaMessage(m.quoted)
                if (flags.find(v => v.match(/nobg|removebg/))) {
                    const data = Sticker.removeBG(buff)
                    const hasil = new Sticker(data, { packname, author: stickerAuthor, packId: '', categories }, crop)
                    await client.sendMessage(m.from, await hasil.toMessage(), { quoted: m })
                    statistics('sticker')
                    await m.react('✅')
                } else {
                    const data = new Sticker(buff, { packname, author: stickerAuthor, packId: '', categories }, crop)
                    await client.sendMessage(m.from, await data.toMessage(), { quoted: m })
                    statistics('sticker')
                    await m.react('✅')
                }

            } else if (isUrl(url)) {
                const data = new Sticker(url, { packname, author: stickerAuthor, packId: '', categories }, crop)
                await client.sendMessage(m.from, await data.toMessage(), { quoted: m })
                statistics('sticker')

                await m.react('✅')

            } else if (flags.find(v => v.match(/args|help/))) {
                m.reply(`*list argumen :*\n\n${cropStyle.map(x => '--' + x).join('\n')}\n\nexample : ${prefix + cmd} --circle`)
            } else {
                m.reply(`send/reply media. media is video or image\n\nexample :\n${prefix + cmd} https://s.id/REl2\n${prefix}sticker send/reply media\n\nor you can add --args\n*list argumen :*\n\n${cropStyle.map(x => '--' + x).join('\n')}\n\nexample : ${prefix + cmd} --nobg`)
            }
        } catch (error) {
            console.log(error);
            await m.react('🍉')

        }
    }
}


async function mp4ToWebp(file, stickerMetadata) {
    if (stickerMetadata) {
        if (!stickerMetadata.pack) stickerMetadata.pack = '‎'
        if (!stickerMetadata.author) stickerMetadata.author = '‎'
        if (!stickerMetadata.crop) stickerMetadata.crop = false
    } else if (!stickerMetadata) {
        stickerMetadata = { pack: '‎', author: '‎', crop: false }
    }
    let getBase64 = file.toString('base64')
    const Format = {
        file: `data:video/mp4;base64,${getBase64}`,
        processOptions: {
            crop: stickerMetadata?.crop,
            startTime: '00:00:00.0',
            endTime: '00:00:7.0',
            loop: 0
        },
        stickerMetadata: {
            ...stickerMetadata
        },
        sessionInfo: {
            WA_VERSION: '2.2106.5',
            PAGE_UA: 'WhatsApp/2.2037.6 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
            WA_AUTOMATE_VERSION: '3.6.10 UPDATE AVAILABLE: 3.6.11',
            BROWSER_VERSION: 'HeadlessChrome/88.0.4324.190',
            OS: 'Windows Server 2016',
            START_TS: 1614310326309,
            NUM: '6247',
            LAUNCH_TIME_MS: 7934,
            PHONE_VERSION: '2.20.205.16'
        },
        config: {
            sessionId: 'session',
            headless: true,
            qrTimeout: 20,
            authTimeout: 0,
            cacheEnabled: false,
            useChrome: true,
            killProcessOnBrowserClose: true,
            throwErrorOnTosBlock: false,
            chromiumArgs: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--aggressive-cache-discard',
                '--disable-cache',
                '--disable-application-cache',
                '--disable-offline-load-stale-cache',
                '--disk-cache-size=0'
            ],
            executablePath: 'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
            skipBrokenMethodsCheck: true,
            stickerServerEndpoint: true
        }
    }
    let res = await fetch('https://sticker-api.openwa.dev/convertMp4BufferToWebpDataUrl', {
        method: 'post',
        headers: {
            Accept: 'application/json, text/plain, /',
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(Format)
    })
    return Buffer.from((await res.text()).split(';base64,')[1], 'base64')
}

import ilovepdfSDK from 'ilovepdf-sdk';
const sdk = new ilovepdfSDK('project_public_d473cb924d5a2a866b5608e086c96e1b_nP756053ef1b9eae5272501d8fd63c4a9885e', 'secret_key_9f94a5c6bb54c95604389024e34542a0_Zs6Sdc27ed3e243f688128392df420b9b8d32');
import { writeFile, writeFileSync }
    from 'fs'
import { join } from 'path';

const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};

export default {
    name: 'doctopdf',
    aliases: ['doctopdf'],
    category: 'Tools',
    usage: '<reply docx>',
    pconly: true,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        try {
            await m.react('🕒')

            if (!m.quoted) return m.reply('Reply word file')
            let mediaType = m.quoted ? m.quoted.mtype : m.mtype || '';
            let ran = getRandom('.docx')
            let ran2 = getRandom('.pdf')
            let msg = m.quoted ? m.quoted : m;
            let filename = join(process.cwd(), '/src/temp/' + ran)
            let hasil = join(process.cwd(), '/src/temp/' + ran2)
            const buffer = await client.downloadMediaMessage(msg)
            if (/document/i.test(mediaType)) {
                writeFileSync(filename, buffer)
                const task = await sdk.createTask('officepdf');
                await task.addFile(`${filename}`);
                await task.process();
                await task.download(hasil);
                console.log('ok');
                client.sendMessage(m.from, { document: { url: hasil }, mimetype: 'application/pdf', fileName: `${Date.now()}-docpdf.pdf` }, { quoted: m })
                await m.react('✅')

            }
        } catch (err) {
            console.log(err);
            await m.react('🍉')

        }
    }
}
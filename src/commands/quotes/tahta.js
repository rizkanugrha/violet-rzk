import { unlinkSync, writeFileSync, readFile, unlink } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};


export default {
    name: 'tahta',
    aliases: ['tahta'],
    category: 'Quotes',
    usage: 'nama',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd, url, flags }) => {
        if (!args.length >= 1) return
        const tulisan = args[0]
        let ran = './src/temp/gambar/' + getRandom('.jpg');

        await m.react('🕒')


        // if (tulisan.length >= 2) return client.reply(from, 'Max 1 kata', id) 
        const fixHeight = 'HARTA\nTAHTA\n' + tulisan.toUpperCase()
        spawn('convert', [
            //'./media/images/mentah.jpg',
            '-font',
            './src/font/frzquadb.ttf',
            '-size',
            '2000x2000',
            'xc:black',
            '-pointsize',
            '350',
            '-gravity',
            'center',
            '-tile',
            './src/font/tiles3.png',
            '-annotate',
            '+5+16',
            fixHeight,
            '-alpha',
            'set',
            '-background',
            'none',
            '-wave',
            '10x150',
            '-trim',
            '+repage',
            '-bordercolor',
            'black',
            '-border',
            '70',
            ran
        ])
            .on('error', () => m.reply('Error convert'))
            .on('exit', () => {
                let temp = './src/temp/gambar/'
                let fileOutputPath = join(ran)
                readFile(fileOutputPath, { encoding: 'base64' }, async (err, base64) => {
                    if (err) return m.reply('There was an error when reading the .jpg file') && console.log(err)
                    try {

                        // await client.sendRawWebpAsSticker(from, base64, true)
                        await client.sendMessage(m.chat, { image: { url: fileOutputPath } }, { quoted: m })
                        // unlink(fileOutputPath, { encoding: 'base64' })
                        await m.react('✅')

                    } catch (e) {
                        console.log(e)
                        await m.react('🍉')

                    }
                    //  client.sendImage(from, './quote/hasiltt.jpg')
                })
            })

    }
}

import { unlinkSync, writeFileSync, readFileSync, unlink } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import util from 'util';
import { inlineCode } from '../../lib/formatter.js';
const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};


let udi = [

    '8d',
    'bass',
    'blown',
    'chorus',
    'deep',
    'distortion',
    'earrape',
    'fast',
    'fat',
    'flanger',
    'highpass',
    'lowpass',
    'nightcore',
    'pitch',
    'robot',
    'reverse',
    'reverb',
    'slow',
    'smooth',
    'tupai',
    'underwater',
]

export default {
    name: 'audio',
    aliases: ['audio', 'audio'],
    category: 'Audio',
    usage: '<reply audio/video>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd }) => {
        try {
            await m.react('🕒')

            if (args.length == 0) return m.reply(`Reply your audio, vn, or video that will be modified.\n\n*List effect:*\n${udi.map(x => x).join('\n')}\n\nexample : ${prefix + cmd} tupai`);
            if (!m.quoted) return m.reply(`reply audio\ncontoh: ${prefix + cmd} tupai`)
            let mediaType = m.quoted ? m.quoted.type : m.type || '';

            let msg = m.quoted ? m.quoted : m;
            const buffer = await client.downloadMediaMessage(msg)
            let set;
            //  if(!msg) return m.reply(`Reply audio, vn, atau video kamu yang akan dimodifikasi.\n\n*List effect:*\n${udi.map(x => x).join('\n')}\n\nexample : ${prefix + cmd} tupai`)

            if (/8d/.test(args[0])) {
                set = '-af apulsator=hz=0.125';
            } else if (/bass/.test(args[0])) {
                set = '-af equalizer=f=94:width_type=o:width=2:g=30';
            } else if (/blown/.test(args[0])) {
                set = '-af acrusher=.1:1:64:0:log';
            } else if (/deep/.test(args[0])) {
                set = '-af atempo=4/4,asetrate=44500*2/3';
            } else if (/earrape/.test(args[0])) {
                set = '-af volume=12';
            } else if (/fast/.test(args[0])) {
                set = '-filter:a "atempo=1.63,asetrate=44100"';
            } else if (/fat/.test(args[0])) {
                set = '-filter:a "atempo=1.6,asetrate=22100"';
            } else if (/nightcore/.test(args[0])) {
                set = '-filter:a atempo=1.06,asetrate=44100*1.25';
            } else if (/reverse/.test(args[0])) {
                set = '-filter_complex "areverse"';
            } else if (/robot/.test(args[0])) {
                set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"';
            } else if (/slow/.test(args[0])) {
                set = '-filter:a "atempo=0.7,asetrate=44100"';
            } else if (/smooth/.test(args[0])) {
                set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"';
            } else if (/tupai|squirrel|chipmunk/.test(args[0])) {
                set = '-filter:a "atempo=0.5,asetrate=65100"';
            } else if (/reverb/.test(args[0])) {
                set = '-filter:a "aecho=0.8:0.9:1000:0.3"';
            } else if (/chorus/.test(args[0])) {
                set = '-filter:a "chorus=0.7:0.9:55:0.4:0.25:2"';
            } else if (/flanger/.test(args[0])) {
                set = '-filter:a "flanger=delay=20:depth=0.2"';
            } else if (/distortion/.test(args[0])) {
                set = '-filter:a "aecho=0.8:0.9:1000:0.3,firequalizer=gain_entry=\'entry(0,15);entry(250,0);entry(4000,15)\'"';
            } else if (/pitch/.test(args[0])) {
                set = '-filter:a "asetrate=44100*1.25,atempo=1.25"';
            } else if (/highpass/.test(args[0])) {
                set = '-filter:a "highpass=f=500"';
            } else if (/lowpass/.test(args[0])) {
                set = '-filter:a "lowpass=f=500"';
            } else if (/underwater/.test(args[0])) {
                set = '-af "asetrate=44100*0.5,atempo=2,lowpass=f=300"';
            } else {
                return m.reply(`Wrong audio effect your inputs.\n\n*List effect:*\n${udi.map(x => x).join('\n')}\n\nexample : ${prefix + cmd} tupai`);
            }

            //   if(!/audio|document|video/i.test(mediaType)) throw m.reply(`Reply audio, vn, atau video kamu yang akan dimodifikasi.\n\n*List effect:*\n${udi.map(x => x).join('\n')}\n\nexample : ${prefix + cmd} tupai`)

            if (/audio|document|video/i.test(mediaType)) {
                let ran = getRandom('.mp3')
                let filename = join(process.cwd(), '/src/assets/temp/audio/' + ran)
                let outputFilename = join(`${Date.now()}-output.mp3`)
                const outputDir = join(process.cwd(), '/src/assets/temp/audio/')
                const outputPath = join(outputDir, outputFilename)
                writeFileSync(filename, buffer)
                exec(`ffmpeg -i ${filename} ${set} ${outputPath}`, async (err, stderr, stdout) => {
                    if (err) throw err;
                    try {
                        let buff = readFileSync(outputPath)
                        await m.reply(`${inlineCode('Successfully converter Audio effect')}\n\n⚡️ _by violet-rzk_`)
                        await client.sendMessage(m.from, { audio: { url: outputPath }, ppt: true, mimetype: 'audio/mpeg', filename: `bass-${Date.now().mp3}` }, { quoted: m });
                        console.log(`file dikirm ke chat = `, outputPath)
                        await m.react('✅')

                    } catch (e) {
                        await m.react('🍉')
                        console.log(e, "gagal gkirim file");
                    } finally {
                        unlinkSync(filename)
                        unlinkSync(outputPath)
                    }

                })
            } else {
                return m.reply(`Reply your audio, vn, or video that will be modified.\n\n*List effect:*\n${udi.map(x => x).join('\n')}\n\nexample : ${prefix + cmd} tupai`)
            }
        } catch (error) {
            console.log(error);
            await m.react('🍉')
        }

    }
}
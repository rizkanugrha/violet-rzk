
import ffmpeg from 'fluent-ffmpeg'
import { existsSync, readFileSync, readdirSync, statSync, watchFile, writeFileSync, promises as fsPromises, unlinkSync } from 'fs';
import {
    fileURLToPath,
    pathToFileURL
} from 'url'
import { randomBytes } from 'crypto'
import { exec } from 'child_process'
import { join } from 'path';
import { statistics } from '../../database/database.js';
export default {
    name: 'tovid',
    aliases: ['tovid', 'stovid'],
    category: 'Sticker',
    usage: '<reply sticker>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        if (m.quoted && m.quoted.type == 'stickerMessage') {

            await m.react('🕒')

            async function convertWebPtoMP4(inputPath, outputPath) {
                return new Promise((resolve, reject) => {
                    // Convert WebP to PNG images using ImageMagick
                    try {
                        const convertCmd = `convert ${inputPath}/*.webp ${inputPath}/%03d.png`;
                        exec(convertCmd, (err, stdout, stderr) => {
                            if (err) {
                                console.error('Error converting WebP to PNG:', err);
                                reject(err);
                                return;
                            }

                            // Create MP4 from PNG images using ffmpeg
                            const ffmpegCmd = `ffmpeg -r 11 -i ${inputPath}/%03d.png -c:v libx264 -pix_fmt yuv420p ${outputPath}`;
                            exec(ffmpegCmd, (err, stdout, stderr) => {
                                if (err) {
                                    console.error('Error creating MP4:', err);
                                    reject(err);
                                    return;
                                }
                                console.log('MP4 created successfully!');
                                resolve();
                            });
                        });
                    } catch (e) {
                        console.log(e);
                    }

                });
            }
            //import { promises as fsPromises } from 'fs';


            async function convertAndSendWebPtoMP4(buffer, m) {
                const inputDir = join(process.cwd(), '/src/assets/temp/webp/');
                const outputDir = join(process.cwd(), '/src/assets/temp/video/');
                const fileName = `${Date.now()}-${randomBytes(3).toString('hex')}.mp4`;
                const outputPath = join(outputDir, fileName);
                // const fileUrl = pathToFileURL(outputPath).href; // Convert file path to file URL

                // Write buffer to file
                const webpFilePath = join(inputDir, `${Date.now()}-${randomBytes(3).toString('hex')}.webp`);
                writeFileSync(webpFilePath, buffer.toString('binary'), 'binary');
                console.log('WebP file written:', webpFilePath);

                try {
                    // Ensure output directory exists, create if it doesn't
                    await fsPromises.mkdir(outputDir, { recursive: true });
                    console.log('Output directory created:', outputDir);
                } catch (err) {
                    await m.react('🍉')
                    console.error('Error creating output directory:', err);
                    throw err;
                }

                try {
                    // Convert WebP to MP4
                    await convertWebPtoMP4(inputDir, outputPath);
                    console.log('MP4 conversion completed:', outputPath);

                    // Send MP4 file
                    await client.sendMessage(m.from, { video: { url: outputPath }, caption: 'Done convert sticker to video' }, { quoted: m });

                    await m.react('✅')
                    statistics('sticker')
                    console.log('MP4 file sent to chat:', outputPath);
                } catch (err) {
                    console.error('Error converting WebP to MP4:', err);
                    await m.react('🍉')
                    throw err;
                } finally {
                    const files = readdirSync(inputDir);
                    files.forEach(file => {
                        const filePath = join(inputDir, file);
                        unlinkSync(filePath);
                        // unlinkSync(outputPath)

                        console.log(`Deleted file: ${filePath}`);
                    });
                    // unlinkSync(outputPath)
                }
            }

            const buff = await m.quoted.download();
            await convertAndSendWebPtoMP4(buff, m);

        } else {
            m.reply(`reply a sticker dengan ${prefix}${cmd}`)
            await m.react('🍉')

        }

    }
}
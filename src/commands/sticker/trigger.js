import { loadImage, createCanvas } from "canvas";
import GIFEncoder from "gifencoder";
import config from '../../utils/config.js'
import { unlinkSync, writeFileSync, writeFile, readFileSync, unlink } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { statistics } from '../../database/database.js'
export default {
    name: 'trigger',
    aliases: ['strigger', 'trigger'],
    category: 'Sticker',
    usage: '<send/reply media>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        let packname = /\|/i.test(body) ? arg.split('|')[0] : `${config.name} `;
        let stickerAuthor = /\|/i.test(body) ? arg.split('|')[1] : `${config.author}`;

        try {
            await m.react('🕒')
            if (m.type == 'imageMessage' || (m.quoted && m.quoted.type == 'imageMessage')) {
                let ran = getRandom('.jpg');
                let filename = join(process.cwd(), '/src/assets/temp/gambar/' + ran);
                let ran2 = getRandom('.gif');
                let filename2 = join(process.cwd(), '/src/assets/src/temp/video/' + ran2);
                let outputFilename = `${Date.now()}-output.mp4`;
                let set = '-movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2"';
                const outputDir = join(process.cwd(), '/src/assets/src/temp/video/');
                const outputPath = join(outputDir, outputFilename);
                const message = m.quoted ? m.quoted : m;
                const buff = await client.downloadMediaMessage(message);
                writeFileSync(filename, buff);
                const gifData = await trigger(filename);
                writeFile(filename2, gifData, "binary", async (err) => {
                    if (err) throw err;
                    console.log("The file has been saved!");

                    exec(`ffmpeg -i ${filename2} ${set} ${outputPath}`, async (err, stderr, stdout) => {
                        if (err) throw err;

                        try {
                            let buff = readFileSync(outputPath);
                            let data = await mp4ToWebp(buff, { pack: packname, author: stickerAuthor });
                            console.log("data ok", data);
                            await client.sendMessage(m.from, { sticker: data }, { quoted: m });
                            await m.react('✅')
                            statistics('sticker')
                        } catch (error) {
                            console.error("Error processing video to sticker:", error);
                        } finally {
                            unlinkSync(filename);
                            unlinkSync(filename2);
                            unlinkSync(outputPath);
                        }
                    });
                });
            }
        } catch (error) {
            console.error("Error:", error);
            await m.react('🍉')
        }
    }
}

async function trigger(image) {
    if (!image) throw new Error("image was not provided!");
    const base = await loadImage(process.cwd() + "/src/assets/triggered.png");
    const img = await loadImage(image);
    const GIF = new GIFEncoder(256, 310);
    GIF.start();
    GIF.setRepeat(0);
    GIF.setDelay(15);
    const canvas = createCanvas(256, 310);
    const ctx = canvas.getContext("2d");
    const BR = 30;
    const LR = 20;
    let i = 0;
    while (i < 9) {
        ctx.clearRect(0, 0, 256, 310);
        ctx.drawImage(
            img,
            Math.floor(Math.random() * BR) - BR,
            Math.floor(Math.random() * BR) - BR,
            256 + BR,
            310 - 54 + BR
        );
        ctx.fillStyle = "#FF000033";
        ctx.fillRect(0, 0, 256, 310);
        ctx.drawImage(
            base,
            Math.floor(Math.random() * LR) - LR,
            310 - 54 + Math.floor(Math.random() * LR) - LR,
            256 + LR,
            54 + LR
        );
        GIF.addFrame(ctx);
        i++;
    }
    GIF.finish();
    return GIF.out.getData();
};

const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};




async function mp4ToWebp(file, stickerMetadata) {
    try {
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
                endTime: '00:00:07.0',
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
        const res = await fetch('https://sticker-api.openwa.dev/convertMp4BufferToWebpDataUrl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Format)
        });

        if (!res.ok) {
            throw new Error(`Failed to convert MP4 to WebP: ${res.status} ${res.statusText}`);
        }

        const responseData = await res.text();

        const base64Data = responseData.split(';base64,')[1];
        if (!base64Data) throw new Error('Invalid WebP data');

        return Buffer.from(base64Data, 'base64');
    } catch (error) {
        console.error("Error in mp4ToWebp:", error);
        throw error;
    }
}

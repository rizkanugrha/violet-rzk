/**
 * Author  : Rizka Nugraha
 * Name    : violet-rzk
 * Version : 2.8.24
 * Update  : 2 Agustus 2024
 * 
 * If you are a reliable programmer or the best developer, please don't change anything.
 * If you want to be appreciated by others, then don't change anything in this script.
 * Please respect me for making this tool from the beginning.
 */

import ffmpeg from 'fluent-ffmpeg'
import { randomBytes } from 'crypto'
import { writeFileSync, readFileSync, unlinkSync, existsSync, promises } from 'fs'
import { isUrl } from '../utils/utils.js'
import { getHttpStream, toBuffer } from '@whiskeysockets/baileys'
import sharp from 'sharp'
import { spawn } from 'child_process'
import path from 'path'
import { fileTypeFromBuffer } from 'file-type'
/**
 * mboh radong
 * @param {Buffer} data video mp4 buffer
 * @returns {Promise<Buffer} webp Buffer
 */

async function toGif(data) {
    try {
        const input = `./src/temp/${randomBytes(3).toString('hex')}.webp`
        const output = `./src/temp/${randomBytes(3).toString('hex')}.gif`
        writeFileSync(input, data.toString('binary'), 'binary')
        const file = await new Promise((resolve) => {
            spawn(`convert`, [
                input,
                output
            ])
                .on('error', (err) => { throw err })
                .on('exit', () => resolve(output))
        })
        let result = readFileSync(file)
        try {
            unlinkSync(input)
            unlinkSync(output)
        } catch (error) {
            console.log(error);
        }
        return result
    } catch (error) {
        console.log(error);
    }
}

async function toMp4(data) {
    try {
        let inPath = `./src/temp/${randomBytes(3).toString('hex')}.gif`
        const input = existsSync(data) ? data : save(data, inPath)
        const output = `./src/temp/${randomBytes(3).toString('hex')}.mp4`
        const file = await new Promise((resolve) => {
            ffmpeg(input)
                .outputOptions([
                    "-pix_fmt yuv420p",
                    "-c:v libx264",
                    "-movflags +faststart",
                    "-filter:v crop='floor(in_w/2)*2:floor(in_h/2)*2'",
                ])
                .toFormat('mp4')
                .noAudio()
                .save(output)
                .on('exit', () => resolve(output))
        })
        let result = await promises.readFile(file)
        return result
    } catch (error) {
        console.log(error);
    }
}

/**
 * mboh radong
 * @param {Buffer|URL|string} data video mp4 buffer | url | path
 * @returns {Promise<string>} file path
 */
function toAudio1(buffer, ext) {
    return ffmpeg(buffer, [
        '-vn',
        '-c:a', 'libopus',
        '-b:a', '128k',
        '-vbr', 'on',
        '-compression_level', '10'
    ], ext, 'opus')
}

async function toAudio(data) {
    return new Promise(async (resolve, reject) => {
        try {
            const get = await toBuffer(await getHttpStream(data))
            const inputPath = `./src/temp/vid/video_${randomBytes(3).toString('hex')}.${(await fileTypeFromBuffer(get)).ext}`
            const input = Buffer.isBuffer(data)
                ? save(data, inputPath)
                : existsSync(data)
                    ? data
                    : isUrl(data)
                        ? save(get, inputPath)
                        : data

            const output = `./src/temp/audio/${randomBytes(3).toString('hex')}.mp3`
            const file = await new Promise((resolve) => {
                ffmpeg(input)
                    .audioFrequency(44100)
                    .audioChannels(2)
                    .audioBitrate('128k')
                    .audioCodec('libmp3lame')
                    .audioQuality(5)
                    .toFormat('mp3')
                    .save(output)
                    .on('end', () => resolve(output))
            })
            resolve(file)
        } catch (error) {
            console.log(error);
        }
    })
}

/**
 * convert mp3 to 8D Audio
 * @param {string|Buffer} input 
 * @returns
 */
const EightD = async (input) => {
    const inputPath = `./src/temp/audio/ori/${randomBytes(3).toString('hex')}.mp3`
    input = Buffer.isBuffer(input) ? save(input, inputPath) : input
    const output = `./src/temp/audio/${randomBytes(3).toString('hex')}.mp3`
    const file = await new Promise((resolve) => {
        ffmpeg(input)
            .audioFilter(['apulsator=hz=0.125'])
            .audioFrequency(44100)
            .audioChannels(2)
            .audioBitrate('128k')
            .audioCodec('libmp3lame')
            .audioQuality(5)
            .toFormat('mp3')
            .save(output)
            .on('end', () => resolve(output))
    })
    return file
}

/**
 * write file from buffer
 * @param {Buffer} buffer buffer
 * @param {string} path path to save file
 * @returns 
 */
function save(buffer, path) {
    try {
        writeFileSync(path, buffer.toString('binary'), 'binary')
        return path
    } catch (error) {
        console.log(error);
    }
}

/**
 * Resize image 
 * @param {Buffer} buffer 
 * @param {Number} width 
 * @param {Number} height 
 * @returns {Promise<Buffer>}
 */
const resizeImage = (buffer, width, height) => {
    if (!Buffer.isBuffer(buffer)) throw 'Input is not a Buffer'
    return new Promise(async (resolve) => {
        sharp(buffer)
            .resize(width, height, { fit: 'contain' })
            .toBuffer()
            .then(resolve)
    })
}

/**
 * 
 * @param {Buffer|string} data Buffer | path | url
 * @param {string} attachExtension media extension, eg: jpeg
 * @param {string} result output result path | buffer
 * @returns 
 */
const _parseInput = async (data, attachExtension, result = 'path') => {
    const get = await toBuffer(await getHttpStream(data))
    const inputPath = `./src/temp/file_${randomBytes(3).toString('hex')}.${attachExtension ? attachExtension : (await fileTypeFromBuffer(get)).ext}`
    const out = Buffer.isBuffer(data)
        ? save(data, inputPath)
        : existsSync(data)
            ? data
            : isUrl(data)
                ? save(get, inputPath)
                : data
    if (result == 'path') {
        return out
    } else if (result == 'buffer') {
        const buff = await promises.readFile(out)
        try {
            await promises.unlink(out)
        } catch (error) {
            throw error
        }
        return buff
    }
}

export {
    toGif,
    toMp4,
    toAudio,
    toAudio1,
    EightD,
    _parseInput,
    resizeImage,
    save
}
/**
 * Author  : Gimenz
 * ReModified : Rizka Nugraha
 * Name    : violet-rzk
 * Version : 2.8.24
 * Update  : 2 Agustus 2024
 * 
 * If you are a reliable programmer or the best developer, please don't change anything.
 * If you want to be appreciated by others, then don't change anything in this script.
 * Please respect me for making this tool from the beginning.
 */
import { S_WHATSAPP_NET } from '@whiskeysockets/baileys';
const { version: _version } = '../package.json';
import { randomBytes } from 'crypto';
import { existsSync, readFileSync, readdirSync, statSync, watchFile, readdir, promises, createReadStream } from 'fs';
import { basename, join, dirname } from 'path';
import chalk from 'chalk';
import moment from 'moment';
import { lookup } from 'mime-types';
import FormData from 'form-data';
import axios from 'axios';
import got from 'got';
// import Buffer from 'file-type';
import { Readable } from 'stream';
import { fileURLToPath } from "url"
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileTypeFromBuffer, fileTypeFromStream } from 'file-type';

export function color(text, color) {
    return !color ? chalk.green(text) : color.startsWith('#') ? chalk.hex(color)(text) : chalk.keyword(color)(text);

}

export function bgColor(text, color) {
    return !color
        ? chalk.bgGreen(text)
        : color.startsWith('#')
            ? chalk.bgHex(color)(text)
            : chalk.bgKeyword(color)(text);
}

export function processTime(timestamp, now) {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds();

}

export function isUrl(url) {
    // Implementation for isUrl
    return new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi).test(url)
}

export function cutStr(message) {
    if (message.length >= 20) {
        return `${message.substring(0, 500)}`;
    } else {
        return `${message}`;
    }
}

export async function getBuffer(input, optionsOverride = {}) {
    try {
        if (existsSync(input)) {
            return {
                mimetype: lookup(input),
                buffer: readFileSync(input)
            }
        } else {
            const response = await axios(input, {
                responseType: 'arraybuffer',
                ...optionsOverride,
            })
            return {
                mimetype: response.headers['content-type'],
                buffer: response.data,
            };
        }
        // return Buffer.from(response.data, 'binary').toString('base64')
    } catch (error) {
        console.log('TCL: getDUrl -> error', error);
    }
}

// fetchBuffer = async (file, options = {}) => {
//     try {
//        if (this.isUrl(file)) {
//           const buffer = await (await axios.get(file, {
//              responseType: "arraybuffer",
//              ...options
//           })).data
//           return buffer
//        } else {
//           const buffer = fs.readFileSync(file)
//           return buffer
//        }
//     } catch (e) {
//        return ({
//           status: false,
//           msg: e.message
//        })
//     }
//  }


export function parseFileSize(size) {
    return parseFloat(size) * (
        /GB/i.test(size)
            ? 1000000
            : /MB/i.test(size)
                ? 1000
                : /KB/i.test(size)
                    ? 1
                    : /bytes?/i.test(size)
                        ? 0.001
                        : /B/i.test(size)
                            ? 0.1
                            : 0
    )
}

export function humanFileSize(bytes, si = true, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
    );

    return bytes.toFixed(dp) + ' ' + units[u];
}


export async function fetchAPI(api, params, options = {}) {
    try {
        const res = await axios({
            url: (api) + params,
            method: options.method || 'GET',
            data: options.data,
            ...options
        });
        return res.data;
    } catch (error) {
        throw new Error(error);
    }
}

export async function fetchFilesize(url, options = {}) {
    try {
        const data = await axios(url, ...options)
        return data.headers['content-length']
    } catch (error) {
        throw error
    }
}

export function formatPhone(number) {
    let formatted = number.replace(/\D/g, '');
    if (formatted.startsWith('0')) {
        formatted = formatted.substr(1) + S_WHATSAPP_NET;
    } else if (formatted.startsWith('62')) {
        formatted = formatted.substr(2) + S_WHATSAPP_NET;
    }
    return number.endsWith(S_WHATSAPP_NET) ? number : '62' + formatted;
}

export function shrt(url, ...args) {
    let id = randomBytes(32).toString('base64').replace(/\W\D/gi, '').slice(0, 5);

    let data = {
        id,
        url,
    }
    Object.assign(data, ...args)
    if (tempDB.some(x => x.url == url)) return data
    tempDB.push(data);
    return data
}

export function secondsConvert(seconds, hour = false) {
    const format = val => `0${Math.floor(val)}`.slice(-2)
    const hours = seconds / 3600
    const minutes = (seconds % 3600) / 60
    const res = hour ? [hours, minutes, seconds % 60] : [minutes, seconds % 60]

    return res.map(format).join(':')
}

export function randRGB() {
    const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    return {
        r: randomBetween(0, 255),
        g: randomBetween(0, 255),
        b: randomBetween(0, 255),
        a: randomBetween(0, 255)
    }
}


export async function isTiktokVideo(link) {
    const a = await got.get(link)
    let url = new URL(a.url)
    return {
        isVideo: !isNaN(basename(url.pathname)),
        isUser: basename(url.pathname).startsWith('@'),
        url: url.origin + url.pathname,
        pathname: url.pathname
    }
}


export function formatK(number, locale = 'id-ID') {
    return new Intl.NumberFormat(locale, { notation: 'compact' }).format(number)

}

export function nocache(module, cb = () => { }) {
    console.log(color(`Module ${module} is now Watched`))
    watchFile(require.resolve(module), async () => {
        await uncache(require.resolve(module))
        cb(module)
    })
}

export function uncache(module = '.') {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(module)]
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

export function maskStr(str) {
    var first4 = str.substring(0, 4);
    var last5 = str.substring(str.length - 2);

    mask = str.substring(4, str.length - 2).replace(/\d/g, "*");
    return first4 + mask + last5
}



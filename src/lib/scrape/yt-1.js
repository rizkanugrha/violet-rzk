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

import axios from 'axios';
import fetch from 'node-fetch';
import { parseFileSize, secondsConvert } from '../../utils/utils.js'
const ndas = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
    'sec-ch-ua-mobile': '?0',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
};

async function yt(url) {
    try {
        const response = await axios.post('https://id-y2mate.com/mates/analyzeV2/ajax', new URLSearchParams({
            k_query: url,
            k_page: 'home',
            hl: 'id',
            q_auto: 0
        }), {
            headers: {
                ...ndas,
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'cookie': '_ga=GA1.1.986083864.1721899125; _ga_79G1567X4W=GS1.1.1721899125.1.1.1721899139.0.0.0',
                'origin': 'https://www.y2mate.com'
            }
        });
        return response.data;
    } catch (error) {
        console.error('yt error:', error);
        return { status: false, message: "Can't get metadata" };
    }
}

export async function ytmp3(url) {
    try {
        const info = await yt(url);
        const response = await axios.post('https://id-y2mate.com/mates/convertV2/index', new URLSearchParams({
            vid: info.vid,
            k: info.links.mp3.mp3128.k
        }), {
            headers: {
                ...ndas,
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        });

        const thumb = `https://i.ytimg.com/vi/${info.vid}/maxresdefault.jpg`;
        const thumbStatus = await fetch(thumb);
        const thumbImg = thumbStatus.status !== 200 ? `https://i.ytimg.com/vi/${info.vid}/hqdefault.jpg` : thumb;

        const result = {
            status: true,
            title: response.data.title,
            channel: info.a,
            duration: info.t,
            size: info.links.mp3.mp3128.size,
            sizeH: parseFileSize(info.links.mp3.mp3128.size),
            type: response.data.ftype,
            quality: `${response.data.fquality}Kbps`,
            id: info.vid,
            thumbnail: thumbImg,
            url: response.data.dlink
        };

        return result;
    } catch (error) {
        console.error('ytmp3 error:', error);
        return { status: false, message: "Can't get metadata" };
    }
}

export async function ytmp4(url, quality) {
    try {
        const info = await yt(url);

        // Determine video quality based on availability
        let qualityHD = info.links.mp4["137"] ? 137 : 299;
        let qualityH = info.links.mp4["134"] ? 134 : 18;
        const resolutions = [360, 480, 720, 1080];

        var resulusi = resolutions[Math.floor(Math.random() * resolutions.length)];
        let res;
        if (resulusi === 1080) {
            res = qualityHD;
        } else if (resulusi === 720) {
            res = 22;
        } else if (resulusi === 480) {
            res = 135;
        } else if (resulusi === 360 || resulusi === undefined || resulusi === 0) {
            res = qualityH; // Default to 360p
        }

        const response = await axios.post('https://id-y2mate.com/mates/convertV2/index', new URLSearchParams({
            vid: info.vid,
            k: info.links.mp4[`${res}`].k
        }), {
            headers: {
                ...ndas,
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        });

        const thumb = `https://i.ytimg.com/vi/${info.vid}/maxresdefault.jpg`;
        const thumbStatus = await fetch(thumb);
        const thumbImg = thumbStatus.status !== 200 ? `https://i.ytimg.com/vi/${info.vid}/hqdefault.jpg` : thumb;

        const result = {
            status: true,
            title: response.data.title,
            channel: info.a,
            duration: info.t,
            size: info.links.mp4[`${res}`].size,
            sizeH: parseFileSize(info.links.mp3.mp3128.size),
            type: response.data.ftype,
            quality: response.data.fquality,
            id: info.vid,
            thumbnail: thumbImg,
            url: decodeURIComponent(response.data.dlink)
        };

        return result;
    } catch (error) {
        console.error('ytmp4 error:', error);
        return { status: false, message: "Can't get metadata" };
    }
}

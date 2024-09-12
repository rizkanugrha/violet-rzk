/**
 * Author  : Gimenz
 * ReModified : Rizka Nugraha
 * Name    : nganu
 * Version : 1.0
 * Update  : 12 Januari 2022
 * 
 * If you are a reliable programmer or the best developer, please don't change anything.
 * If you want to be appreciated by others, then don't change anything in this script.
 * Please respect me for making this tool from the beginning.
 */


import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';
import * as readline from 'node:readline';
import ffmpeg from 'fluent-ffmpeg';
import NodeID3 from 'node-id3';
import fs, { readFileSync, statSync } from 'fs';
import { getBuffer, bgColor, color } from '../../utils/utils.js';
import { searchMusics } from 'node-youtube-music';
import { randomBytes } from 'crypto';
const ytIdRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/

class YT {
    constructor() { }

    /**
     * is Youtube URL?
     * @param {string|URL} url youtube url
     * @returns Returns true if the given YouTube URL.
     */
    static isYTUrl = (url) => {
        return ytIdRegex.test(url)
    }

    /**
     * get video id from url
     * @param {string|URL} url the youtube url want to get video id
     * @returns 
     */
    static getVideoID = (url) => {
        if (!this.isYTUrl(url)) throw new Error('is not YouTube URL')
        return ytIdRegex.exec(url)[1]
    }

    /**
     * @typedef {Object} IMetadata
     * @property {string} Title track title
     * @property {string} Artist track Artist
     * @property {string} Image track thumbnail url
     * @property {string} Album track album
     * @property {string} Year track release date
     */

    /**
     * Write Track Tag Metadata
     * @param {string} filePath 
     * @param {IMetadata} Metadata 
     */
    static WriteTags = async (filePath, Metadata) => {
        NodeID3.write(
            {
                title: Metadata.Title,
                artist: Metadata.Artist,
                originalArtist: Metadata.Artist,
                image: {
                    mime: 'jpeg',
                    type: {
                        id: 3,
                        name: 'front cover',
                    },
                    imageBuffer: (await getBuffer(Metadata.Image)).buffer,
                    description: `Cover of ${Metadata.Title}`,
                },
                album: Metadata.Album,
                year: Metadata.Year || ''
            },
            filePath
        );
    }

    /**
     * 
     * @param {string} query 
     * @returns 
     */
    static search = async (query, options = {}) => {
        const search = await yts.search({ query, hl: 'id', gl: 'ID', ...options })
        return search.videos
    }

    /**
     * @typedef {Object} TrackSearchResult
     * @property {boolean} isYtMusic is from YT Music search?
     * @property {string} title music title
     * @property {string} artist music artist
     * @property {string} id YouTube ID
     * @property {string} url YouTube URL
     * @property {string} album music album
     * @property {Object} duration music duration {seconds, label}
     * @property {string} image Cover Art
     */

    /**
     * search track with details
     * @param {string} query 
     * @returns {Promise<TrackSearchResult[]>}
     */
    static searchTrack = (query) => {
        return new Promise(async (resolve, reject) => {
            try {
                let ytMusic = await searchMusics(query);
                let result = []
                for (let i = 0; i < ytMusic.length; i++) {
                    result.push({
                        isYtMusic: true,
                        title: `${ytMusic[i].title} - ${ytMusic[i].artists.map(x => x.name).join(' ')}`,
                        artist: ytMusic[i].artists.map(x => x.name).join(' '),
                        id: ytMusic[i].youtubeId,
                        url: 'https://youtu.be/' + ytMusic[i].youtubeId,
                        album: ytMusic[i].album,
                        duration: {
                            seconds: ytMusic[i].duration.totalSeconds,
                            label: ytMusic[i].duration.label
                        },
                        image: ytMusic[i].thumbnailUrl.replace('w120-h120', 'w600-h600')
                    })
                }
                resolve(result)
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * @typedef {Object} MusicResult
     * @property {TrackSearchResult} meta music meta
     * @property {string} path file path
     */

    /**
     * Download music with full tag metadata
     * @param {string|TrackSearchResult[]} query title of track want to download
     * @returns {Promise<MusicResult>} filepath of the result
     */
    static downloadMusic = async (query) => {
        try {
            const getTrack = Array.isArray(query) ? query : await this.searchTrack(query);
            const search = getTrack[0]//await this.searchTrack(query)
            const videoInfo = await ytdl.getInfo('https://www.youtube.com/watch?v=' + search.id, {
                requestOptions: {
                    headers: {
                        cookie: 'VISITOR_PRIVACY_METADATA=CgJJRBIEGgAgGA%3D%3D; VISITOR_INFO1_LIVE=LQLGpU7QiY8; VISITOR_PRIVACY_METADATA=CgJJRBIEGgAgGA%3D%3D; PREF=f7=4100&tz=Asia.Bangkok; SID=g.a000mAi7WSU3ndwivw_rWkKvMwNixIXUiHZinvSKuCKR7B0nR20UicJXL5eKJnwDKWOnZ2-6yAACgYKAcUSARcSFQHGX2MiXg5mgv_OKXbAu3eFzlQhgxoVAUF8yKrfCQM5KDtf8n5ehljf3kXJ0076; __Secure-1PSID=g.a000mAi7WSU3ndwivw_rWkKvMwNixIXUiHZinvSKuCKR7B0nR20U9P1ocTa0q5PlB9BFqwfCpgACgYKAeUSARcSFQHGX2MiljvWO4y-3OFHblqOSLMQ5RoVAUF8yKryRhuT7VfGc2VffMsqfkBe0076; __Secure-3PSID=g.a000mAi7WSU3ndwivw_rWkKvMwNixIXUiHZinvSKuCKR7B0nR20UBAuFyy2JirD9j3Oa0T0KBgACgYKAdISARcSFQHGX2MiJOEyUIC9TAzrTtxJb9l-2hoVAUF8yKpALNJCLCsmJarfGecnM6110076; HSID=AiSBo8dnjco_0a4Hw; SSID=AqaktRR_GvQJRf5UJ; APISID=Z1ekhJ2CYcjibwBb/AQGL9tWTZXy80g52b; SAPISID=ElGpGpDdZlIdv2CO/A-nQYT5LEtKOoKIQB; __Secure-1PAPISID=ElGpGpDdZlIdv2CO/A-nQYT5LEtKOoKIQB; __Secure-3PAPISID=ElGpGpDdZlIdv2CO/A-nQYT5LEtKOoKIQB; YSC=Pwrfs8oBSAI; LOGIN_INFO=AFmmF2swRgIhAOaNNj-BLrp3auY22bHsLEu8ZNEBk_Sahvfh489wtVfLAiEAqGyw6cfuT7QXgctdwpkCUNi0bV--djAZ6k4us8sONYs:QUQ3MjNmeklkdTRxWU1qdDRxVU5RanBHVUpnYk05ZUJOZ3A5R2VHbEV2SUxwcWpkeU5XYjhnRDhUNGN1MVc3NVVyYjVnaFhQdk5ENnh0NVgxVHpZRzdSTlpmdXdzNFFCVXQ5TmRPQTVWSEJJdnhvWXN5ajNHUXV2WjRid2VPcEVtd3VPWUw1c2tzNk5zd2NpZGJuUS1XUHlmNFhHZjBaTEF3; __Secure-1PSIDTS=sidts-CjEBUFGoh-Jxh-XxjIPmXNCIhf75uIGXWHkUmlLiXiryCnn2il2jkbvmaY1JrHKTGZFgEAA; __Secure-3PSIDTS=sidts-CjEBUFGoh-Jxh-XxjIPmXNCIhf75uIGXWHkUmlLiXiryCnn2il2jkbvmaY1JrHKTGZFgEAA; SIDCC=AKEyXzUvwzJjPLSvq1z1FPTjyQY7B78yuwwjr2ARq3baf_yVOQRuTmT1DdpkyeCwBJVOfhGYBXw; __Secure-1PSIDCC=AKEyXzW828C2zaJkLFni3Ra4PGcaR10UHywxuKMbcFlOyzmWdFjtel9jHLboahQ6vdFUL0J_iw; __Secure-3PSIDCC=AKEyXzVJ7UcHLWpp6fjhBCVUL6zlisS86BoAVfifso_XtGhI-VlmI697imBQljz0yugDWa9sXg'
                    }
                }
            }, { lang: 'id' });
            let stream = ytdl(search.id, { filter: 'audioonly', quality: 140 });
            let songPath = `./src/temp/audio/${randomBytes(3).toString('hex')}.mp3`
            stream.on('error', (err) => console.log(err))

            const file = await new Promise((resolve) => {
                ffmpeg(stream)
                    .audioFrequency(44100)
                    .audioChannels(2)
                    .audioBitrate(128)
                    .audioCodec('libmp3lame')
                    .audioQuality(5)
                    .toFormat('mp3')
                    .save(songPath)
                    .on('end', () => resolve(songPath))
            });
            await this.WriteTags(file, { Title: search.title, Artist: search.artist, Image: search.image, Album: search.album, Year: videoInfo.videoDetails.publishDate.split('-')[0] });
            return {
                meta: search,
                path: file,
                size: statSync(songPath).size
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    /**
     * get downloadable video urls
     * @param {string|URL} query videoID or YouTube URL
     * @param {string} quality 
     * @returns
     */
    static mp4 = async (query, quality = 134) => {
        try {
            if (!query) throw new Error('Video ID or YouTube Url is required')
            const cookie = ytdl.createAgent(JSON.parse(readFileSync('./src/lib/scrape/cookies.json')))
            const videoId = this.isYTUrl(query) ? this.getVideoID(query) : query
            const videoInfo = await ytdl.getInfo('https://www.youtube.com/watch?v=' + videoId, { cookie });
            const format = ytdl.chooseFormat(videoInfo.formats, { format: quality, filter: 'videoandaudio' })
            return {
                title: videoInfo.videoDetails.title,
                thumb: videoInfo.videoDetails.thumbnails.slice(-1)[0].url,
                date: videoInfo.videoDetails.publishDate,
                duration: videoInfo.videoDetails.lengthSeconds,
                channel: videoInfo.videoDetails.ownerChannelName,
                quality: format.qualityLabel,
                contentLength: format.contentLength,
                videoUrl: format.url
            }
        } catch (error) {
            throw error
        }
    }

    /**
     * Download YouTube to mp3
     * @param {string|URL} url YouTube link want to download to mp3
     * @param {IMetadata} metadata track metadata
     * @param {boolean} autoWriteTags if set true, it will auto write tags meta following the YouTube info
     * @returns 
     */
    static mp3 = async (url, metadata = {}, autoWriteTags = false) => {
        try {
            if (!url) throw new Error('Video ID or YouTube Url is required')
            const cookie = ytdl.createAgent(JSON.parse(readFileSync('./src/lib/scrape/cookies.json')))

            url = this.isYTUrl(url) ? 'https://www.youtube.com/watch?v=' + this.getVideoID(url) : url
            const { videoDetails } = await ytdl.getInfo(url, { cookie });
            let stream = ytdl(url, { filter: 'audioonly', quality: 140 });
            let songPath = `./src/assets/temp/audio/${randomBytes(3).toString('hex')}.mp3`

            let starttime;
            stream.once('response', () => {
                starttime = Date.now();
            });
            stream.on('progress', (chunkLength, downloaded, total) => {
                const percent = downloaded / total;
                const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
                const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
                process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
                process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`);
                process.stdout.write(`, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `);
                readline.moveCursor(process.stdout, 0, -1);
                //let txt = `${bgColor(color('[FFMPEG]]', 'black'), '#38ef7d')} ${color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE')} ${gradient.summer('[Converting..]')} ${gradient.cristal(p.targetSize)} kb`
            });
            stream.on('end', () => process.stdout.write('\n\n'));
            stream.on('error', (err) => console.log(err))

            const file = await new Promise((resolve) => {
                ffmpeg(stream)
                    .audioFrequency(44100)
                    .audioChannels(2)
                    .audioBitrate(128)
                    .audioCodec('libmp3lame')
                    .audioQuality(5)
                    .toFormat('mp3')
                    .save(songPath)
                    .on('end', () => {
                        resolve(songPath)
                    })
            });
            if (Object.keys(metadata).length !== 0) {
                await this.WriteTags(file, metadata)
            }
            if (autoWriteTags) {
                await this.WriteTags(file, { Title: videoDetails.title, Album: videoDetails.author.name, Year: videoDetails.publishDate.split('-')[0], Image: videoDetails.thumbnails.slice(-1)[0].url })
            }
            return {
                meta: {
                    title: videoDetails.title,
                    channel: videoDetails.author.name,
                    seconds: videoDetails.lengthSeconds,
                    image: videoDetails.thumbnails.slice(-1)[0].url
                },
                path: file,
                size: statSync(songPath).size
            }
        } catch (error) {
            throw error
        }
    }
}

export { YT };

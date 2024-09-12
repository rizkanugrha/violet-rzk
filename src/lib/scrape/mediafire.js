import got from 'got'
import { parseFileSize } from '../function.js'
import * as cheerio from 'cheerio';

const ndas = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
    'sec-ch-ua-mobile': '?0',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
}


export async function mediafiredl(url) {
    const data = await got(url, {
        headers: {
            ...ndas
        }
    }).text()
    const $ = cheerio.load(data)
    const Url = ($('#downloadButton').attr('href') || '').trim()
    const url2 = ($('#download_link > a.retry').attr('href') || '').trim()
    const $intro = $('div.dl-info > div.intro')
    const filename = $intro.find('div.filename').text().trim()
    const filetype = $intro.find('div.filetype > span').eq(0).text().trim()
    const ext = /\(\.(.*?)\)/.exec($intro.find('div.filetype > span').eq(1).text())?.[1]?.trim() || 'bin'
    const $li = $('div.dl-info > ul.details > li')
    const aploud = $li.eq(1).find('span').text().trim()
    const filesizeH = $li.eq(0).find('span').text().trim()
    const filesize = parseFileSize(filesizeH)

    const result = {
        url: Url || url2,
        url2,
        filename,
        filetype,
        ext,
        aploud,
        filesizeH,
        filesize
    }
    return result
}
// mediafiredl(`https://www.mediafire.com/file/bmqdrdhzf7du2ap/GET_Cookies_Fp_PLus.crx/file`).then(res => {
//     console.log(res)
// })
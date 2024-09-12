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

import axios from "axios";

export function tiktok2(query) {
    return new Promise(async (resolve, reject) => {
        try {
            const encodedParams = new URLSearchParams();
            encodedParams.set('url', query);
            encodedParams.set('hd', '1');

            const response = await axios({
                method: 'POST',
                url: 'https://tikwm.com/api/',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Cookie': 'current_language=en',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
                },
                data: encodedParams
            });
            const videos = response.data.data;

            resolve(videos);
        } catch (error) {
            reject(error);
        }
    });
}
/*import ytdl from "@distube/ytdl-core";
import { YT } from "./src/lib/scrape/yt2.js";

YT.mp3('https://youtu.be/gT1_lxq-5Ps?si=BBPN-HPFvzhTQwE1').then(async res => {
    console.log(res);

})*/
// let headersSimSimi = {
//     "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
//     Accept: "application/json, text/javascript, */*; q=0.01",
//     "X-Requested-With": "XMLHttpRequest",
//     "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
//     Referer: "https://simsimi.vn/"
// }; const url = "https://simsimi.vn/web/simtalk";
// try {
//     const response = await axios.post(url, `text=hai&lc=id`, {
//         headers: headersSimSimi
//     });
//     console.log(response.data.success);

// } catch (error) {
//     console.error("Error asking SimSimi:", error);
//     throw error;
// }
// import { uploadImage } from "./src/utils/utils.js";
// import { upload } from "./src/lib/function.js";
// let file = './src/assets/img-menu.jpg'
// const anu = await upload.telegra(file)
// console.log(anu)
// import axios from 'axios'
// async function aio(url) {
//     try {
//         const response = await axios.post("https://aiovd.com/wp-json/aio-dl/video-data",
//             {
//                 url: url
//             },
//             {
//                 headers: {
//                     'Accept': '*/*',
//                     'Content-Type': 'application/json'
//                 }
//             });

//         const res = response.data;
//         const result = {
//             data: res.medias
//         };

//         return result;
//     } catch (e) {
//         throw e
//     }
// }
// await aio('https://youtu.be/kbSigY0yrBM?si=0DD182Kx-Jcyndqn').then(res => console.log(res))
import { YT } from "./src/lib/scrape/yt2.js";
import { humanFileSize } from "./src/utils/utils.js";

await YT.mp3('https://www.youtube.com/watch?v=7Jm2Il2U-c0').then(res => console.log((res.size)))
import FormData from "form-data"
import Jimp from "jimp"


export default {
    name: 'remini',
    aliases: ['img-hd', 'hd', 'remini'],
    category: 'Tools',
    usage: '<reply img>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        let mess = m.quoted ? m.quoted : m;
        // let mime = (q.msg || q).mimetype || q.mediaType || ""
        if (!mess)
            return m.reply(`Send/reply image\nexample : ${prefix + cmd}`)

        if (m.type == 'imageMessage' || m.quoted && m.quoted.type == 'imageMessage') {
            let img = await client.downloadMediaMessage(mess)
            try {
                await m.react('🕒')

                const hail = await processing(img, "enhance")
                //await client.sendFileFromUrl(m.from, hail, '', m)
                client.sendFilek(m.from, hail, "", "Sudah Jadi HD Kak >//<", m)

                await m.react('✅')

            } catch (error) {
                console.log(error);
                await m.react('🍉')

            }
        } else {
            m.reply(`File type images only!`)
            await m.react('🍉')

        }
    }
}


async function processing(urlPath, method) {
    return new Promise(async (resolve, reject) => {
        let Methods = ["enhance"]
        Methods.includes(method) ? (method = method) : (method = Methods[0]);
        let buffer,
            Form = new FormData(),
            scheme = "https" + "://" + "inferenceengine" + ".vyro" + ".ai/" + method;
        Form.append("model_version", 1, {
            "Content-Transfer-Encoding": "binary",
            contentType: "multipart/form-data; charset=uttf-8",
        });
        Form.append("image", Buffer.from(urlPath), {
            filename: "enhance_image_body.jpg",
            contentType: "image/jpeg",
        });
        Form.submit(
            {
                url: scheme,
                host: "inferenceengine" + ".vyro" + ".ai",
                path: "/" + method,
                protocol: "https:",
                headers: {
                    "User-Agent": "okhttp/4.9.3",
                    Connection: "Keep-Alive",
                    "Accept-Encoding": "gzip",
                },
            },
            function (err, res) {
                if (err) reject();
                let data = [];
                res
                    .on("data", function (chunk, resp) {
                        data.push(chunk);
                    })
                    .on("end", () => {
                        resolve(Buffer.concat(data));
                    });
                res.on("error", (e) => {
                    reject();
                });
            }
        );
    });
}

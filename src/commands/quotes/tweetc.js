
export default {
    name: 'tweetc',
    aliases: ['tc', 'tweetc'],
    category: 'Quotes',
    usage: 'quotesmu',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd, url, flags }) => {
        try {
            await m.react('🕒')

            if (!m.text) return m.reply(`Please enter the text. example: ${prefix + cmd} You're my love!`)
            let replies = Math.floor(Math.random() * 100) + 1
            let likes = Math.floor(Math.random() * 1000) + 1
            let retweets = Math.floor(Math.random() * 100) + 1
            let api = `https://some-random-api.com/canvas/misc/tweet?displayname=${m.pushName}&username=${m.pushName}&avatar=https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg&comment=${m.text}&replies=${replies + 'k'}&likes=${likes + 'k'}&retweets=${retweets + "k"}&theme=dark`
            await client.sendMessage(m.from, { image: { url: api } }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            console.log(e);
            await m.react('🍉')
        }

    }
}
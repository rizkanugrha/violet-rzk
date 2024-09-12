
export default {
    name: 'menfess',
    aliases: ['menfess'],
    category: 'Quotes',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd, url, flags }) => {
        client.menfess = client.menfess ? client.menfess : {}
        const fakes = { "key": { "participants": "0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, "participant": "0@s.whatsapp.net" }

        let text = args.join(' ')
        if (!text) return m.reply(`*Cara penggunaan :*\n\n${prefix + cmd} nomor|nama pengirim|pesan\n\n*Note:* nama pengirim boleh nama samaran atau anonymous.\n\n*Contoh:* ${prefix + cmd} ${m.sender.split`@`[0]}|Anonymous|Hai.`);
        let [jid, name, pesan] = text.split('|');
        if ((!jid || !name || !pesan)) return m.reply(`*Cara penggunaan :*\n\n${prefix + cmd} nomor|nama pengirim|pesan\n\n*Note:* nama pengirim boleh nama samaran atau anonymous.\n\n*Contoh:* ${prefix + cmd} ${m.sender.split`@`[0]}|Anonymous|Hai.`);
        jid = jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        let data = (await client.onWhatsApp(jid))[0] || {};
        if (!data.exists) return m.reply('Nomer tidak terdaftar di whatsapp.');
        if (jid == m.sender) return m.reply('tidak bisa mengirim pesan menfess ke diri sendiri.')
        let mf = Object.values(client.menfess).find(mf => mf.status === true)
        if (mf) return !0
        try {
            let id = + new Date
            let tek = `Hai @${data.jid.split('@')[0]}, kamu menerima pesan Menfess nih.\n\nDari: *${name}*\nPesan: \n${pesan}\n\nMau balas pesan ini kak? bisa kok kak. tinggal ketik pesan kakak lalu kirim, nanti saya sampaikan ke *${name}*.`
            await client.sendMessage(data.jid, { text: tek, quoted: m });

            client.menfess[id] = {
                id,
                dari: m.sender,
                nama: name,
                penerima: data.jid,
                pesan: pesan,
                status: false
            };
            m.reply('Berhasil mengirim pesan menfess.');
            console.log(client.menfess[id]);
        } catch (e) {
            console.log(e)
            m.reply('eror');
        }
    }
}
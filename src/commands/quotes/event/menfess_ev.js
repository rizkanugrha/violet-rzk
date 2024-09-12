const delay = time => new Promise(res => setTimeout(res, time))
const tanda = '```'
// ebenr urung;v 
// sengojo crud ne tak gawe kokui tak genti sintak e mongose tok
export const pconly = true
export async function execute(m, client, { body, prefix, args, arg, cmd, url, flags, msg, command, isOwner }) {
    if (!m.from.endsWith('@s.whatsapp.net')) return !0;
    client.menfess = client.menfess ? client.menfess : {};
    let mf = Object.values(client.menfess).find(v => v.status === false && v.penerima == m.sender)
    if (!mf) return !0
    // console.log({ text: m.text, type: m.quoted?.mtype })
    console.log(mf)
    if ((m.text === 'BALAS PESAN' || m.text === '') && m.quoted.type == 'extendedTextMessage') return m.reply("Silahkan kirim pesan balasan kamu.\nKetik pesan sesuatu lalu kirim, maka pesan otomatis masuk ke target balas pesan.");
    else {
        let txt = `Hai kak @${mf.dari.split('@')[0]}, kamu menerima balasan nih.\n\nPesan yang kamu kirim sebelumnya:\n${mf.pesan}\n\nPesan balasannya:\n${m.text}\n`.trim();
        await m.reply(mf.dari, { text: txt }, null)
        console.log(client.menfess[mf.id]);

        m.reply('Berhasil Mengirim balasan.')
        delay(1500)
        delete client.menfess[mf.id]
        return !0

    }
}
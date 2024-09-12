
export default {
    name: 'pddikti',
    aliases: ['pddikti', 'mhs'],
    category: 'Internet',
    usage: 'nama mhs',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: true,
    execute: async (m, client, { prefix, args, cmd, url, flags }) => {
        try {
            let text = args.join(' ')
            await m.react('🕒')
            if (!text) return m.reply(`*_Masukan Nama Mahasiswa/Siswa Yang Ingin Kamu Cari !_*`);
            m.reply('Sedang mencari Orangnya... Silahkan tunggu');
            let res = await fetch('https://api-frontend.kemdikbud.go.id/hit_mhs/' + text);
            if (!res.ok) return m.reply('Tidak Ditemukan');
            let json = await res.json();
            let message = '';

            json.mahasiswa.forEach(data => {
                let nama = data.text;
                let websiteLink = data['website-link'];
                let website = `https://pddikti.kemdikbud.go.id${websiteLink}`;
                message += `\n > PDDIKTI
Nama = ${nama}\n\nData Ditemukan pada website = ${website}\n\n\n`;
            });
            const mySecret = 'Nomer kamu'
            m.reply(message);
            m.react('✅')
        } catch (err) {
            console.log(err);
            m.reply(util.format(err))
            await m.react('🍉')
        }

    }
}
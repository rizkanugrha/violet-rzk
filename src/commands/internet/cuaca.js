import fetch from "node-fetch"
import { inlineCode } from "../../lib/formatter.js"

export default {
    name: 'cuaca',
    aliases: ['weather', 'cuaca'],
    category: 'Internet',
    usage: 'kota/kab',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd, url, flags }) => {
        try {
            await m.react('🕒')

            let text = args.join(' ')
            if (!text) {
                return m.reply(`Please entered the Cities. example :${prefix + cmd} Jakarta`);
            }

            // await m.reply(`${global.wait}`);
            let teksenc = encodeURIComponent(text);

            let res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${text}&units=metric&appid=7334353e61d5c9df6db96b1a70e80325`);


            if (!res.ok) {
                return m.reply('Cities not found');
            }

            let json = await res.json();

            if (json.cod != 200) {
                console.log(json);
            }

            let gustKmph = json.wind.gust * 3.6;

            let sunriseTime = json.sys.sunrise ? new Date(json.sys.sunrise * 1000).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Jakarta'
            }) : 'Tidak Tersedia';
            let sunsetTime = json.sys.sunset ? new Date(json.sys.sunset * 1000).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Jakarta'
            }) : 'Tidak Tersedia';
            let predictionTime = new Date(json.dt * 1000 + json.timezone * 1000).toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta'
            });

            let groundLevelPressure = json.main.grnd_level !== undefined ? json.main.grnd_level + ' hPa' : 'Tidak Tersedia';
            let seaLevelPressure = json.main.sea_level !== undefined ? json.main.sea_level + ' hPa' : 'Tidak Tersedia';

            m.reply(`
> > Prakiraan Cuaca ${text} <
🤩 Koordinat: ${json.coord.lat}, ${json.coord.lon} https://www.google.com/maps/place/${teksenc}/@${json.coord.lat},${json.coord.lon}
🌍 Lokasi: ${json.name}, ${json.sys.country}
🌦️ Cuaca: ${json.weather[0].description}, intinya: ${json.weather[0].main}
🌡️ Suhu saat ini: ${json.main.temp} °C
🔥 Suhu tertinggi: ${json.main.temp_max} °C
❄️ Suhu terendah: ${json.main.temp_min} °C
😊 Terasa seperti: ${json.main.feels_like} °C
💧 Kelembapan: ${json.main.humidity} %
💨 Angin: ${json.wind.speed} km/jam, ${json.wind.deg} derajat, guncangan ${gustKmph.toFixed(2)} km/jam
☔ Curah Hujan (1 Jam): ${json.rain ? json.rain['1h'] || 0 : 0} mm
☁ Persen Awan: ${json.clouds ? json.clouds.all || 0 : 0} %
🌬️ Tekanan (Udara): ${json.main.pressure} hPa
⛳ Tingkat Tanah: ${groundLevelPressure}
🌊 Tingkat Laut: ${seaLevelPressure}
👀 Jarak Pandang: ${json.visibility ? `${(json.visibility / 1000).toFixed(2)} km` : 'Tidak Tersedia'}
🔮 Prediksi di waktu: ${predictionTime} WIB
🌄 Waktu Sunrise: ${sunriseTime} WIB
🌅 Waktu Sunset: ${sunsetTime} WIB
      

⚡️ _by violet-rzk_
`.trim());
            await m.react('✅')


        } catch (err) {
            console.log(err);

            await m.react('🍉')

        }

    }
}

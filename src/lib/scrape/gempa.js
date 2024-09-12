import got from 'got'
import * as cheerio from 'cheerio'
import EventEmitter from 'node:events';
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

class GempaEmitter extends EventEmitter { }

const gempaEmitter = new GempaEmitter();

let cekgempadirasa = [];
let cekgempaNow = []
let cekRealtime = []
let intervalId = null;


async function gempadirasa() {
    const html = await got('https://www.bmkg.go.id/gempabumi/gempabumi-dirasakan.bmkg').text();
    const $ = cheerio.load(html);
    const results = [];

    $('div.table-responsive > table.table > tbody > tr').each(async function () {
        const el = $(this).find('td');
        const when = el.eq(1).text().split(' ').join(' ');
        const locate = el.eq(2).text().split(' ')
        const latitude = locate[0]
        const longitude = locate[2]
        const magnitude = el.eq(3).text();
        const depth = el.eq(4).text();
        const location = el.eq(5).find('a').text().trim();
        const warning = el.eq(5).find('span.label').map(function () {
            return $(this).text().replace(/\t/g, ' ').trim();
        }).toArray().join(' '); // Join warnings without commas
        const imagemap = $('div.modal-body > div > div:nth-child(1) > img').attr('src')

        // Format output without commas
        // const formattedResult = `*Terjadi Gempa Bumi Dirasakan* <\n\n- *Waktu Terjadi:* ${when}\n- *Lintang - Bujur:* ${latitude} LS - ${longitude} BT\n- *Magnitudo:* ${magnitude}\n- *Kedalaman:* ${depth} \n- *Wilayah:* ${location}\n- *Dirasakan (Skala MMI):* ${warning}\n- *Link maps :* https://www.google.com/maps?q=${latitude},${longitude}`;

        //  results.push(formattedResult);
        results.push({
            when,
            latitude,
            longitude,
            magnitude,
            depth,
            location,
            warning
        })
    });
    return results.map((v) => v)
}


async function gempadirasaCek() {
    try {
        const newData = await gempadirasa();

        const filename = join(process.cwd(), '/src/data/gempadirasa.json');
        try {
            cekgempadirasa = JSON.parse(readFileSync(filename, 'utf-8'));
        } catch (e) {
            console.log('No previous data found, creating a new file.');
        }
        if (newData.length && JSON.stringify(newData) !== JSON.stringify(cekgempadirasa)) {
            gempaEmitter.emit('gempadirasa', newData);
            //cekgempadirasa = newData;
            writeFileSync(filename, JSON.stringify(newData, null, 2));
        }
    } catch (error) {
        console.error(error);
    }
}



async function gempaNow() {
    const html = await got('https://www.bmkg.go.id/gempabumi/gempabumi-terkini.bmkg').text()
    const $ = cheerio.load(html)
    const results = []
    $('div.table-responsive > table.table > tbody > tr').each(async function () {
        const el = $(this).find('td')
        const when = el.eq(1).text().split(' ').join(' ')
        const latitude = el.eq(2).text().trim()
        const longitude = el.eq(3).text().trim()
        const magnitude = el.eq(4).text().trim()
        const depth = el.eq(5).text().trim()
        const location = el.eq(6).text().trim()

        // const format = `*Gempa Bumi Terjadi Sekarang*\n\n- *Waktu Terjadi:* ${when}\n- *Lintang - Bujur:* ${latitude} LS - ${longitude} BT\n- *Magnitudo:* ${magnitude}\n- *Kedalaman:* ${depth}\n- *Wilayah:* ${location}\n- *Link maps :* https://www.google.com/maps?q=${latitude},${longitude}`
        //results.push(format);
        results.push({
            when,
            latitude,
            longitude,
            magnitude,
            depth,
            location
        })
    })

    return results.map((v) => v)
}


async function gempaNowCek() {
    try {
        const newData = await gempaNow();
        const filename = join(process.cwd(), '/src/data/gempanow.json');
        try {
            cekgempaNow = JSON.parse(readFileSync(filename, 'utf-8'));
        } catch (e) {
            console.log('No previous data found, creating a new file.');
        }

        if (newData.length && JSON.stringify(newData) !== JSON.stringify(cekgempaNow)) {
            gempaEmitter.emit('gempanow', newData);
            writeFileSync(filename, JSON.stringify(newData, null, 2));
        }
    } catch (error) {
        console.error(error);
    }
}

async function gempaRealtime() {
    const html = await got('https://www.bmkg.go.id/gempabumi/gempabumi-realtime.bmkg').text()
    const $ = cheerio.load(html)
    const results = []
    $('table.table tbody tr').each(async function () {
        const $td = $(this).find('td')
        const when = $td.eq(1).text().split(' ')
        const date = when[0]
        const time = when[1]
        const latitude = $td.eq(2).text()
        const longitude = $td.eq(3).text()
        const magnitude = $td.eq(4).text()
        const depth = $td.eq(5).text()
        const _location = $td.eq(6)
        const location = _location.find('a').text().split(',').map((v) => v.trim())
        const isConfirmed = /\(Confirmed\)/i.test(_location.text())
        results.push({
            date,
            time,
            latitude,
            longitude,
            magnitude,
            depth,
            location,
            isConfirmed
        })
        //const format = `*Gempa Bumi Terjadi Sekarang*\n\n- *Waktu Terjadi:* ${date} ${time}\n- *Lintang - Bujur:* ${latitude} LS - ${longitude} BT\n- *Magnitudo:* ${magnitude}\n- *Kedalaman:* ${depth}\n- *Wilayah:* ${location}\n- *Terkonfirmasi:* ${isConfirmed}\n*Link maps :* https://www.google.com/maps?q=${latitude},${longitude}`
        // results.push(format)
    })
    return results.map((v) => v)
}


async function gempaRealCek() {
    try {
        const newData = await gempaRealtime();
        const filename = join(process.cwd(), '/src/data/gemparealtime.json');
        try {
            cekRealtime = JSON.parse(readFileSync(filename, 'utf-8'));
        } catch (e) {
            console.log('No previous data found, creating a new file.');
        }
        if (newData.length && JSON.stringify(newData) !== JSON.stringify(cekRealtime)) {
            gempaEmitter.emit('realtime', newData);
            //cekRealtime = newData;
            writeFileSync(filename, JSON.stringify(newData, null, 2));

        }
    } catch (error) {
        console.error(error);
    }
}

function startMonitoring() {
    if (!intervalId) {
        intervalId = setInterval(() => {
            gempadirasaCek();
            gempaNowCek();
            gempaRealCek();
        }, 10000); // Check every 10 seconds
        console.log('Started monitoring for both Gempa dirasa and Gempa now data.');
    }

}
export { startMonitoring, gempaEmitter };
/*
gempaEmitter.on('gempadirasa', (data) => {
    console.log('Gempa dirasa:', data[0]); // or handle the data as needed
});
gempaEmitter.on('gempanow', (data) => {
    console.log('Gempa now:', data[0]); // or handle the data as needed
});
gempaEmitter.on('realtime', (data) => {
    console.log('Gempa trt:', data[0]); // or handle the data as needed
});
startMonitoring()
*/

// mapboxEndpoint = `https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/pin-l+tes(0.10,96.38)/0.10,96.38,6.95,0/1280x800?access_token=pk.eyJ1Ijoicml6a2EzMiIsImEiOiJjbHl2bmU0N3AwbjE0MmxvZWkzZ3N4cXlyIn0.72l90rdSr9UOlRsdHHB5_A`
//https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/0.10,96.38,0/1280x800?access_token=pk.eyJ1Ijoicml6a2EzMiIsImEiOiJjbHl2bmU0N3AwbjE0MmxvZWkzZ3N4cXlyIn0.72l90rdSr9UOlRsdHHB5_A
//Google My Maps.
//https://www.google.com/maps?q=-6.92,127.07
//https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/geojson(%7B%22type%22%3A%22Point%22%2C%22coordinates%22%3A%5B135.48%2C-3.42%5D%7D)/135.48,-3.42,4/1280x800?access_token=pk.eyJ1Ijoicml6a2EzMiIsImEiOiJjbHl2bmU0N3AwbjE0MmxvZWkzZ3N4cXlyIn0.72l90rdSr9UOlRsdHHB5_A

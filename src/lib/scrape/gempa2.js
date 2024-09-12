import axios from 'axios';
import events from 'node:events';
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

let intervalId = null;

class GempaEmitter extends events { }

let gempaEvent = new GempaEmitter();

async function buatFile(filename, data) {
    try {
        let lokal = join(process.cwd(), `/src/database/${filename}`);
        writeFileSync(lokal, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.log('gagal create file', e);
    }
}

async function bacaFile(filename) {
    try {
        let lokal = join(process.cwd(), `/src/database/${filename}`);
        const data = readFileSync(lokal, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return null; // If file doesn't exist or there's an error, return null
    }
}

async function gempabumi() {
    try {
        const apiURL = "https://bmkg-content-inatews.storage.googleapis.com";
        let array = [];
        const datane = await axios.get(`${apiURL}/datagempa.json?t=${Date.now()}`).then((res) => {
            return res.data;
        });
        let alertMsg = datane.info;
        array.push({
            'id': alertMsg.eventid,
            'date': alertMsg.date,
            'time': alertMsg.time,
            'lintang': alertMsg.latitude,
            'bujur': alertMsg.longitude,
            'magnitude': alertMsg.magnitude,
            'kedalaman': alertMsg.depth,
            'wilayah': alertMsg.area
        });
        return array;
    } catch (e) {
        console.log('web data bmkg error', e);
    }
}

async function realtimedata() {
    try {
        const apiURL = "https://bmkg-content-inatews.storage.googleapis.com";
        let array = [];
        const datane = await axios.get(`${apiURL}/lastQL.json?t=${Date.now()}`).then((res) => {
            return res.data.features[0];
        });
        let res = datane.properties;
        array.push({
            'id': res.id,
            'date': new Date(res.time).toLocaleDateString("id"),
            'time': new Date(res.time).toLocaleTimeString("us", {
                timeZone: "Asia/Jakarta",
            }),
            'lintang': datane.geometry.coordinates[1],
            'bujur': datane.geometry.coordinates[0],
            'magnitude': Number(res.mag).toFixed(1),
            'kedalaman': Number(res.depth).toFixed(1),
            'wilayah': res.place
        });
        return array;
    } catch (e) {
        console.log('web data bmkg error', e);
    }
}

async function cekgempabumi() {
    try {
        let cekgempa = [];
        let alertMsg = await gempabumi();
        gempaEvent.emit("gempamasuk", JSON.stringify(alertMsg));
        let filename = 'gempa.json';
        cekgempa = await bacaFile(filename);

        if (!cekgempa || alertMsg[0].id !== cekgempa[0]?.id) {
            await buatFile(filename, alertMsg);
            gempaEvent.emit('gempaterjadi', alertMsg);
        }
    } catch (e) {
        console.log('Failed to check earthquake data', e);
    }
}

async function cekrealtime() {
    try {
        let realtime = [];
        let pesan = await realtimedata();
        gempaEvent.emit('realmasuk', JSON.stringify(pesan));
        let filename = 'realtime.json';
        realtime = await bacaFile(filename);
        if (!realtime || pesan[0].id !== realtime[0]?.id) {
            await buatFile(filename, pesan);
            gempaEvent.emit('realtime', pesan);
        }
    } catch (e) {
        console.log('Failed to check real-time data', e);
    }
}

function startMonitoring() {
    if (!intervalId) {
        intervalId = setInterval(() => {
            cekgempabumi();
            cekrealtime();
        }, 10000); // Check every 10 seconds
        console.log('Started monitoring Gempa now.');
    }
}

export { gempaEvent, startMonitoring };

/* Uncomment and fix the event listeners to test:

gempaEvent.on('gempaterjadi', (msg) => {
    const data = JSON.parse(msg);
    console.log('New Earthquake Detected: ', data[0].id);
});

gempaEvent.on('realtime', (msg) => {
    if (typeof msg === 'string') {
        console.log(msg); // Output the "data still the same" message
    } else {
        console.log('New Realtime Data: ', msg[0].id);
    }
});

*/

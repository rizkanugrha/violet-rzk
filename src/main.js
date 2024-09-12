//editen 2:33wib
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

import 'dotenv/config';

import makeWASocket, {
    delay,
    useMultiFileAuthState,
    fetchLatestWaWebVersion,
    makeInMemoryStore,
    jidNormalizedUser,
    PHONENUMBER_MCC,
    DisconnectReason,
    Browsers,
    makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import os from 'os';
import cfonts from 'cfonts';
//import chalk from 'chalk';
import { exec } from 'child_process';
import config from './utils/config.js';
import { GroupParticipants } from './handlers/group-participants.js';
import { Messages } from './handlers/message.js';
import treeKill from './utils/tree-kill.js';
import serialize, { Client } from './utils/serialize.js';
import { formatSize, parseFileSize, sendTelegram } from './lib/function.js';
import { loadCommands } from './lib/loadcmd.js';
import { openDB } from './database/database.js'

const logger = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` }).child({ class: 'client' });
logger.level = 'fatal';

const usePairingCode = process.env.PAIRING_NUMBER;
const store = makeInMemoryStore({ logger });
global.store = store
if (process.env.WRITE_STORE === 'true') store.readFromFile(`./src/database/${process.env.SESSION_NAME}/store.json`);
// check available file
const pathContacts = `./src/database/${process.env.SESSION_NAME}/contacts.json`;
const pathMetadata = `./src/database/${process.env.SESSION_NAME}/groupMetadata.json`;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
import { gempaEvent, startMonitoring } from './lib/scrape/gempa2.js';

const startBot = async () => {
    await openDB()
    await loadCommands()

    const { state, saveCreds } = await useMultiFileAuthState(`./src/database/${process.env.SESSION_NAME}`);
    const { version, isLatest } = await fetchLatestWaWebVersion();

    /** cfonts  */
    cfonts.say(`LOVE YOU..`, {
        font: 'shade',
        align: 'center',
        gradient: ['#12c2e9', '#c471ed'],
        transitionGradient: true,
        letterSpacing: 3,
    });
    cfonts.say(`'${config.name}' Coded By ${config.author}`, {
        font: 'console',
        align: 'center',
        gradient: ['#DCE35B', '#45B649'],
        transitionGradient: true,
    });
    /**end cfonts */
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

    const client = makeWASocket.default({
        version: [2, 3000, 1015901307],
        logger,
        printQRInTerminal: !usePairingCode,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        browser: Browsers.macOS("Safari"),
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        retryRequestDelayMs: 10,
        transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
        defaultQueryTimeoutMs: undefined,
        maxMsgRetryCount: 15,
        appStateMacVerification: {
            patch: true,
            snapshot: true,
        },
        getMessage: async key => {
            const jid = jidNormalizedUser(key.remoteJid);
            const msg = await store.loadMessage(jid, key.id);

            return msg?.message || '';
        },
        shouldSyncHistoryMessage: msg => {
            console.log(`\x1b[32mMemuat Chat [${msg.progress}%]\x1b[39m`);
            return !!msg.syncType;
        },
    });

    store?.bind(client.ev);
    await Client({ client, store });

    // login dengan pairing
    if (usePairingCode && !client.authState.creds.registered) {
        let phoneNumber = usePairingCode.replace(/[^0-9]/g, '');

        if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) throw "Start with your country's WhatsApp code, Example : 62xxx";

        await delay(3000);
        let code = await client.requestPairingCode(phoneNumber);
        console.log(`\x1b[32m${code?.match(/.{1,4}/g)?.join('-') || code}\x1b[39m`);
    }

    // ngewei info, restart or close
    client.ev.on('connection.update', async update => {
        const {
            lastDisconnect,
            connection
        } = update
        if (connection) {
            console.info(`Connection Status : ${connection}`)
        }


        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode

            switch (reason) {
                case DisconnectReason.badSession:
                    console.info(`Bad Session File, Restart Required`)
                    startBot()
                    break
                case DisconnectReason.connectionClosed:
                    console.info("Connection Closed, Restart Required")
                    startBot()
                    break
                case DisconnectReason.connectionLost:
                    console.info("Connection Lost from Server, Reconnecting...")
                    startBot()
                    break
                case DisconnectReason.connectionReplaced:
                    console.info("Connection Replaced, Restart Required")
                    startBot()
                    break
                case DisconnectReason.restartRequired:
                    console.info("Restart Required, Restarting...")
                    startBot()
                    break
                case DisconnectReason.loggedOut:
                    console.error("Device has Logged Out, please rescan again...")
                    client.end()
                    fs.rmSync(`./session`, {
                        recursive: true,
                        force: true
                    })
                    exec("npm run stop:pm2", (err) => {
                        if (err) return treeKill(process.pid)
                    })
                    break
                case DisconnectReason.multideviceMismatch:
                    console.error("Need Multi Device Version, please update and rescan again...")
                    client.end()
                    fs.rmSync(`./session`, {
                        recursive: true,
                        force: true
                    })
                    exec("npm run stop:pm2", (err) => {
                        if (err) return treeKill(process.pid)
                    })
                    break
                default:
                    console.log("I don't understand this issue")
                    startBot()
            }
        }

        if (connection === "open") {
            client.sendMessage(jidNormalizedUser(client.user.id), { text: `${client.user?.name} has Connected...` });
            console.clear();
            cfonts.say("Cie Konek botnya", {
                font: "tiny",
                align: "center",
                colors: ["red"]
            });
        }
    });

    gempaEvent.on('gempaterjadi', async (data) => {
        var groupIds = ['120363297357822992@g.us', '120363298363876699@g.us', '120363275463567709@g.us']
        const format = `*Terjadi Gempa Bumi* <\n\n`
        client.sendMessage('6285314240519@s.whatsapp.net', { text: `Sending Broadcast gempa dirasa to ${groupIds.length} Group Chats, Estimated Completion Time ${groupIds.length * 3} seconds` });

        for (let groupId of groupIds) {
            try {
                if (parseFloat(data[0].magnitude) > 5.0) {
                    format += `- *Waktu Terjadi:* ${data[0].date} ${data[0].time}\n- *Lintang - Bujur:* ${data[0].lintang} - ${data[0].bujur}\n- *Magnitude:* ${data[0].magnitude}\n- *Kedalaman:* ${data[0].kedalaman} \n- *Wilayah:* ${data[0].wilayah}\n- *Link Sumber :* https://inatews.bmkg.go.id/web/detail?name=${data[0].id}&day=578\n\nHati-hati terhadap gempabumi susulan yang mungkin terjadi\n\n> >Data by BMKG`;
                    await sleep(3000);
                    client.sendMessage(
                        groupId, { text: `${format}` }
                    );
                } else {
                    format += `- *Waktu Terjadi:* ${data[0].date} ${data[0].time}\n- *Lintang - Bujur:* ${data[0].lintang} - ${data[0].bujur}\n- *Magnitude:* ${data[0].magnitude}\n- *Kedalaman:* ${data[0].kedalaman} \n- *Wilayah:* ${data[0].wilayah}\n- *Link Sumber :* https://inatews.bmkg.go.id/web/detail?name=${data[0].id}&day=476\n\nHati-hati terhadap gempabumi susulan yang mungkin terjadi\n\n> >Data by BMKG`;
                    await sleep(3000);
                    client.sendMessage(
                        groupId, { text: `${format}` }
                    );
                }

                // await client.sendMessage(groupId, { image: { url: imageBuffer }, caption: format, mimetype: 'image/jpeg' })
            } catch (error) {
                console.log(`Error sending broadcast to group ${groupIds}:`, error);
                client.sendMessage('6285314240519@s.whatsapp.net', { text: `erroe send gempa drasa` })
            }
        }


        client.sendMessage('6285314240519@s.whatsapp.net', { text: `Broadcast Successfully Sent gempa dirasa to ${groupIds.length} Groups` });
        console.log('Gempa dirasa:', format); // or handle the data as needed
    });

    gempaEvent.on('realtime', async (data) => {
        let groupIds = ['120363297357822992@g.us', '120363298363876699@g.us', '120363275463567709@g.us']

        client.sendMessage('6285314240519@s.whatsapp.net', { text: `Sending Broadcast gempa realtime to ${groupIds.length} Group Chats, Estimated Completion Time ${groupIds.length * 3} seconds` });
        const format = `*Terjadi Gempa Bumi* <\n\n- *Waktu Terjadi:* ${data[0].date} ${data[0].time}\n- *Lintang - Bujur:* ${data[0].lintang} LS - ${data[0].bujur} BT\n- *Magnitude:* ${data[0].magnitude}\n- *Kedalaman:* ${data[0].kedalaman} \n- *Wilayah:* ${data[0].wilayah}\n- *Link Sumber :* https://inatews.bmkg.go.id/web/detail2?name=${data[0].id}&day=326\n\nHati-hati terhadap gempabumi susulan yang mungkin terjadi\n\n> >Data by BMKG`;

        for (let groupId of groupIds) {
            try {
                await sleep(3000);
                client.sendMessage(
                    groupId, { text: `${format}` }
                );

                //   await client.sendMessage(groupId, { image: { buffer: url }, caption: format, mimetype: 'image/jpeg' })
            } catch (error) {
                console.log(`Error sending broadcast to group ${groupId}:`, error);
                client.sendMessage('6285314240519@s.whatsapp.net', { text: `erroe send gempa relytime` })

            }
        }

        client.sendMessage('6285314240519@s.whatsapp.net', { text: `Broadcast Successfully Sent gempa realtime to ${groupIds.length} Groups` });
        console.log('Gempa realtime:', format); // or handle the data as needed
    });

    startMonitoring()

    //endgempa

    // write session kang
    client.ev.on('creds.update', saveCreds);

    // contacts
    if (fs.existsSync(pathContacts)) {
        store.contacts = JSON.parse(fs.readFileSync(pathContacts, 'utf-8'));
    } else {
        fs.writeFileSync(pathContacts, JSON.stringify({}));
    }
    // group metadata
    if (fs.existsSync(pathMetadata)) {
        store.groupMetadata = JSON.parse(fs.readFileSync(pathMetadata, 'utf-8'));
    } else {
        fs.writeFileSync(pathMetadata, JSON.stringify({}));
    }

    // add contacts update to store
    client.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = jidNormalizedUser(contact.id);
            if (store && store.contacts) store.contacts[id] = { ...(store.contacts?.[id] || {}), ...(contact || {}) };
        }
    });

    // add contacts upsert to store
    client.ev.on('contacts.upsert', update => {
        for (let contact of update) {
            let id = jidNormalizedUser(contact.id);
            if (store && store.contacts) store.contacts[id] = { ...(contact || {}), isContact: true };
        }
    });

    // nambah perubahan grup ke store
    client.ev.on('groups.update', updates => {
        for (const update of updates) {
            const id = update.id;
            if (store.groupMetadata[id]) {
                store.groupMetadata[id] = { ...(store.groupMetadata[id] || {}), ...(update || {}) };
            }
        }
    });

    // case 'revoked_membership_requests':
    // merubah status member 
    client.ev.on('group-participants.update', async (anu) =>
        await GroupParticipants(anu, client)
    )



    // bagian pepmbaca status ono ng kene
    client.ev.on('messages.upsert', async ({ messages }) => {
        if (!messages[0].message) return;
        let m = await serialize(client, messages[0], store);
        if (m.key.fromMe) return

        if (config.autoRead) {
            client.readMessages([m.key])
        }
        // nambah semua metadata ke store
        if (store.groupMetadata && Object.keys(store.groupMetadata).length === 0) store.groupMetadata = await client.groupFetchAllParticipating();

        // untuk membaca pesan status
        if (m.key && !m.key.fromMe && m.key.remoteJid === 'status@broadcast') {
            if (m.type === 'protocolMessage' && m.message.protocolMessage.type === 0) return;
            await client.readMessages([m.key]);
            await client.sendMessage('status@broadcast', {
                react: {
                    text: '💚',
                    key: m.key,
                }
            }, {
                statusJidList: [m.key.participant]
            })
        }

        // status self apa publik
        if (process.env.SELF === 'false' && !m.isOwner) return;

        await Messages(client, m)
    });

    client.ws.on('CB:call', call => {
        call.id = call.content[0].attrs['call-id'];
        call.from = call.content[0].attrs['call-creator'];
        if (call.content[0].tag === 'offer' && process.env.antiCall) {
            client.rejectCall(call.id, call.from); // Reject call if antiCall is enabled
        }
    });

    setInterval(async () => {
        // write contacts and metadata
        if (store.groupMetadata) fs.writeFileSync(pathMetadata, JSON.stringify(store.groupMetadata));
        if (store.contacts) fs.writeFileSync(pathContacts, JSON.stringify(store.contacts));

        // write store
        if (process.env.WRITE_STORE === 'true') store.writeToFile(`./src/database/${process.env.SESSION_NAME}/store.json`);

        // untuk auto restart ketika RAM sisa 300MB
        const memoryUsage = os.totalmem() - os.freemem();

        if (memoryUsage > os.totalmem() - parseFileSize(process.env.AUTO_RESTART, false)) {
            await client.sendMessage(jidNormalizedUser(client.user.id), { text: `penggunaan RAM mencapai *${formatSize(memoryUsage)}* waktunya merestart...` }, { ephemeralExpiration: 24 * 60 * 60 * 1000 });
            exec('npm run restart:pm2', err => {
                if (err) return process.send('reset');
            });
        }
    }, 10 * 1000); // tiap 10 detik

    /** auto clear smpah session*/
    /*if (!fs.readdir("./session", async function (err, files) {
        if (err) {
            console.error(err)
        }
        setInterval(() => {
            let file = files.filter(item => item.startsWith('pre-key') || item.startsWith('sender-key') || item.startsWith('session-') || item.startsWith('app-state'));
            file.forEach(function (a) {
                fs.unlinkSync(`./session/${a}`)
            });
        }, 30 * 1000); // every 30 second
    }));
*/

    process.on('uncaughtException', console.error);
    process.on('unhandledRejection', console.error);
};

startBot();

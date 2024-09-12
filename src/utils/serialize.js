
import { createRequire } from 'module';
const require = createRequire(import.meta.url);


var baileys, {
	isJidGroup,
	jidNormalizedUser,
	extractMessageContent,
	generateForwardMessageContent,
	areJidsSameUser,
	downloadMediaMessage,
	generateThumbnail,
	prepareWAMessageMedia,
	generateWAMessageFromContent,
	S_WHATSAPP_NET,
	proto
} = require('@whiskeysockets/baileys');
import path from 'path';
import fs, { statSync, unlinkSync, unlink, existsSync, readFileSync, writeFileSync } from 'fs';
import pino from 'pino';
import { parsePhoneNumber } from 'libphonenumber-js';
import { fileTypeFromBuffer } from 'file-type';
import config from './config.js'
import util from 'util'
import { download, escapeRegExp } from '../lib/function.js';
import _ from "lodash";
const parseMention = (text) => [...text.matchAll(/@?([0-9]{5,16}|0)/g)].map((v) => v[1] + S_WHATSAPP_NET);
import Jimp from "jimp";
import { toAudio1 } from '../lib/converter.js'

function generateID(length = 32, id = '') {
	id += randomBytes(Math.floor((length - id.length) / 2)).toString('hex');
	while (id.length < length) id += '0';
	return id.toUpperCase();
}


export const getContentType = content => {
	if (content) {
		const keys = Object.keys(content);
		const key = keys.find(k => (k === 'conversation' || k.endsWith('Message') || k.includes('V2') || k.includes('V3')) && k !== 'senderKeyDistributionMessage');
		return key;
	}
};

export function Client({ client, store }) {
	const clients = Object.defineProperties(client, {
		getName: {
			value(jid) {
				let id = jidNormalizedUser(jid);
				if (id.endsWith('g.us')) {
					let metadata = store.groupMetadata?.[id];
					return metadata.subject;
				} else {
					let metadata = store.contacts[id];
					return metadata?.name || metadata?.verifiedName || metadata?.notify || parsePhoneNumber('+' + id.split('@')[0]).format('INTERNATIONAL');
				}
			},
		},

		sendContact: {
			async value(jid, number, quoted, options = {}) {
				let list = [];
				for (let v of number) {
					if (v.endsWith('g.us')) continue;
					v = v.replace(/\D+/g, '');
					list.push({
						displayName: client.getName(v + '@s.whatsapp.net'),
						vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${client.getName(v + '@s.whatsapp.net')}\nFN:${client.getName(v + '@s.whatsapp.net')}\nitem1.TEL;waid=${v}:${v}\nEND:VCARD`,
					});
				}
				return client.sendMessage(
					jid,
					{
						contacts: {
							displayName: `${list.length} Contact`,
							contacts: list,
						},
					},
					{ quoted, ...options }
				);
			},
			enumerable: true,
		},

		parseMention: {
			value(text) {
				return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net') || [];
			},
		},

		downloadMediaMessage: {
			async value(message, filename) {
				let media = await downloadMediaMessage(
					message,
					'buffer',
					{},
					{
						logger: pino({ timestamp: () => `,"time":"${new Date().toJSON()}"`, level: 'fatal' }).child({ class: 'client' }),
						reuploadRequest: client.updateMediaMessage,
					}
				);

				if (filename) {
					let mime = await fileTypeFromBuffer(media);
					let filePath = path.join(process.cwd(), `${filename}.${mime.ext}`);
					fs.promises.writeFile(filePath, media);
					return filePath;
				}

				return media;
			},
			enumerable: true,
		},

		copyNForward: {
			async value(jid, message, forceForward = false, options = {}) {
				let vtype
				let mtype = getContentType(message.message)
				if (options.readViewOnce && message.message.viewOnceMessageV2?.message) {
					vtype = Object.keys(message.message.viewOnceMessageV2.message)[0]
					delete message.message.viewOnceMessageV2.message[vtype].viewOnce
					message.message = proto.Message.fromObject(
						JSON.parse(JSON.stringify(message.message.viewOnceMessageV2.message))
					)
					// console.log(message.message);
					// message.message[vtype].contextInfo = message.message?.viewOnceMessage?.contextInfo
				}

				let content = generateForwardMessageContent(message, forceForward)
				let ctype = getContentType(content)
				let context = {}
				// if (mtype != "conversation") context = message.message[mtype].contextInfo
				content[ctype].contextInfo = {
					...context,
					...content[ctype].contextInfo,
				}
				const waMessage = generateWAMessageFromContent(jid, content, options ? {
					...content[ctype],
					...options,
					...(options.contextInfo ? {
						contextInfo: {
							...content[ctype].contextInfo,
							mentionedJid: options.mentions ? options.mentions : [],
							...options.contextInfo
						}
					} : {})
				} : {})
				await client.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
				return waMessage
			},
			enumerable: true,
		},

		cMod: {
			value(jid, message, text = '', sender = client.user.jid, options = {}) {
				if (options.mentions && !Array.isArray(options.mentions)) options.mentions = [options.mentions];

				// Create a copy of the message object
				let copy = JSON.parse(JSON.stringify(message));

				// Remove unnecessary properties
				delete copy.message.messageContextInfo;
				delete copy.message.senderKeyDistributionMessage;

				// Handle the message type and content
				let mtype = Object.keys(copy.message)[0];
				let msg = copy.message;
				let content = msg[mtype];

				if (typeof content === 'string') msg[mtype] = text || content;
				else if (content.caption) content.caption = text || content.caption;
				else if (content.text) content.text = text || content.text;

				if (typeof content !== 'string') {
					msg[mtype] = { ...content, ...options };
					msg[mtype].contextInfo = {
						...(content.contextInfo || {}),
						mentionedJid: options.mentions || content.contextInfo?.mentionedJid || []
					};
				}

				// Set the sender info
				if (copy.participant) sender = copy.participant = sender || copy.participant;
				else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;

				if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
				else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;

				// Update the message key
				copy.key.remoteJid = jid;
				copy.key.fromMe = areJidsSameUser(sender, client.user.id) || false;

				// Return the updated message object
				return proto.WebMessageInfo.fromObject(copy);
			},

			enumerable: true,
		},
		sendFile: {
			async value(jid, path, quoted, options = {}) {
				let mimetype = 'audio/mp4'//getDevice(quoted.id) == 'ios' ? 'audio/mpeg' : 'audio/mp4'
				let opt = { fileName: options.fileName || '', ...options }
				if (options.audio) opt['audio'] = Buffer.isBuffer(path) ? { buffer: path, mimetype } : { url: path, mimetype }
				if (options.document) opt['document'] = Buffer.isBuffer(path) ? { buffer: path, mimetype: options.mimetype } : { url: path, mimetype: options.mimetype }
				if (options.image) opt['image'] = Buffer.isBuffer(path) ? { buffer: path, mimetype: options.mimetype } : { url: path, mimetype: options.mimetype }
				await client.sendMessage(jid, opt, { quoted })

				try {
					if (options.unlink) {
						console.log('unlink');
						unlinkSync(path)
					}
				} catch (error) {
					console.log(error);
				}

			}
		},
		sendFileFromUrl: {
			async value(jid, url, caption = '', quoted = '', mentionedJid, extension, options = {}, axiosOptions = {}) {
				let filepath;
				try {
					const { filepath: downloadedFilePath, mimetype } = await download(url, extension, axiosOptions);
					filepath = downloadedFilePath;
					let { size } = statSync(filepath);
					// statistics('filesize', size);
					mentionedJid = mentionedJid ? parseMention(mentionedJid) : [];
					let mime = mimetype.split('/')[0];
					let thumb = await generateThumbnail(filepath, mime);
					if (mimetype == 'image/gif' || options.gif) {
						const message = await prepareWAMessageMedia({ video: { url: filepath }, caption, gifPlayback: true, gifAttribution: 1, mentions: mentionedJid, jpegThumbnail: thumb.thumbnail, ...options }, { upload: client.waUploadToServer });
						let media = generateWAMessageFromContent(jid, { videoMessage: message.videoMessage }, { quoted, mediaUploadTimeoutMs: 600000 });
						await client.relayMessage(jid, media.message, { messageId: media.key.id });
					} else if (mime == 'video') {
						const message = await prepareWAMessageMedia({ video: { url: filepath }, caption, mentions: mentionedJid, jpegThumbnail: thumb.thumbnail, ...options }, { upload: client.waUploadToServer });
						let media = generateWAMessageFromContent(jid, { videoMessage: message.videoMessage }, { quoted, mediaUploadTimeoutMs: 600000 });
						await client.relayMessage(jid, media.message, { messageId: media.key.id });
					} else if (mime == 'image') {
						const message = await prepareWAMessageMedia({ image: { url: filepath }, caption, mentions: mentionedJid, jpegThumbnail: thumb.thumbnail, ...options }, { upload: client.waUploadToServer });
						let media = generateWAMessageFromContent(jid, { imageMessage: message.imageMessage }, { quoted, mediaUploadTimeoutMs: 600000 });
						await client.relayMessage(jid, media.message, { messageId: media.key.id });
					} else if (mime == 'audio') {
						let msg;
						await client.sendPresenceUpdate('recording', jid);
						const message = await prepareWAMessageMedia({ [options.audio ? 'audio' : 'document']: { url: filepath }, mimetype: mimetype, fileName: options.fileName }, { upload: client.waUploadToServer });
						if (options.audio) msg = { audioMessage: message.audioMessage };
						else msg = { documentMessage: message.documentMessage };
						let media = generateWAMessageFromContent(jid, msg, { quoted, mediaUploadTimeoutMs: 600000 });
						await client.relayMessage(jid, media.message, { messageId: media.key.id });
					} else {
						const message = await prepareWAMessageMedia({ document: { url: filepath }, mimetype: mimetype, fileName: options.fileName }, { upload: client.waUploadToServer });
						let media = generateWAMessageFromContent(jid, { documentMessage: message.documentMessage }, { quoted, mediaUploadTimeoutMs: 600000 });
						await client.relayMessage(jid, media.message, { messageId: media.key.id });
					}
					console.log(filepath);
					unlink(filepath, (err) => {
						if (err) {
							console.error(`Error deleting file '${filepath}':`, err);
						} else {
							console.log(`File '${filepath}' deleted successfully.`);
						}
					});
				} catch (error) {
					console.error('Error sending file:', error);
					if (filepath) {
						unlink(filepath, (err) => {
							if (err) {
								console.error(`Error deleting file '${filepath}':`, err);
							} else {
								console.log(`File '${filepath}' deleted successfully.`);
							}
						});
					}
					client.sendMessage(jid, { text: `error nganu => ${util.format(error)} ` }, { quoted });
				}
			}
		},

		sendFilek: {
			async value(jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) {
				let type = await client.getFile(path, true)
				let { res, data: file, filename: pathFile } = type
				if (res && res.status !== 200 || file.length <= 65536) {
					try { throw { json: JSON.parse(file.toString()) } }
					catch (e) { if (e.json) throw e.json }
				}
				let opt = { filename }
				if (quoted) opt.quoted = quoted
				if (!type) options.asDocument = true
				let mtype = '', mimetype = options.mimetype || type.mime, convert
				if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
				else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
				else if (/video/.test(type.mime)) mtype = 'video'
				else if (/audio/.test(type.mime)) (
					convert = await toAudio1(file, type.ext),
					file = convert.data,
					pathFile = convert.filename,
					mtype = 'audio',
					mimetype = options.mimetype || 'audio/ogg; codecs=opus'
				)
				else mtype = 'document'
				if (options.asDocument) mtype = 'document'

				delete options.asSticker
				delete options.asLocation
				delete options.asVideo
				delete options.asDocument
				delete options.asImage

				let message = {
					...options,
					caption,
					ptt,
					[mtype]: { url: pathFile },
					mimetype,
					fileName: filename || pathFile.split('/').pop()
				}
				/**
				 * @type {import('@whiskeysockets/baileys').proto.WebMessageInfo}
				 */
				let m
				try {
					m = await client.sendMessage(jid, message, { ...opt, ...options })
				} catch (e) {
					console.error(e)
					m = null
				} finally {
					if (!m) m = await client.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options })
					file = null // releasing the memory
					return m
				}
			}
		},

		sendCard: {
			async value(jid, title, image, btn = [], options = {}) {
				async function createImage(url) {
					const { imageMessage } = await generateWAMessageContent({
						image: {
							url
						}
					}, {
						upload: client.waUploadToServer
					});
					return imageMessage;
				};
				const cards = await Promise.all(image.map(async (url, index) => ({
					header: proto.Message.InteractiveMessage.Header.fromObject({
						title: `${index + 1}/${image.length}`,
						hasMediaAttachment: true,
						imageMessage: await createImage(url)
					}),
					nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
						buttons: btn
					})
				})));
				const msg = generateWAMessageFromContent(jid, {
					viewOnceMessage: {
						message: {
							messageContextInfo: {
								deviceListMetadata: {},
								deviceListMetadataVersion: 2
							},
							interactiveMessage: proto.Message.InteractiveMessage.fromObject({
								footer: proto.Message.InteractiveMessage.Footer.create({ text: "Powered By Rasya" }),
								body: proto.Message.InteractiveMessage.Body.fromObject({
									text: title
								}),
								carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
									cards
								})
							})
						}
					}
				}, {});

				await client.relayMessage(msg.key.remoteJid, msg.message, {
					messageId: msg.key.id
				}, { quoted: msg });
			}
		},


		sendButtonCustom: {
			async value(jid, text, buttons, footer, quoted, options = {}) {
				let msg = generateWAMessageFromContent(jid, {
					viewOnceMessage: {
						message: {
							"messageContextInfo": {
								"deviceListMetadata": {},
								"deviceListMetadataVersion": 2
							},
							interactiveMessage: proto.Message.InteractiveMessage.create({
								...options,
								body: proto.Message.InteractiveMessage.Body.create({
									text: text
								}),
								footer: proto.Message.InteractiveMessage.Footer.create({
									text: footer
								}),
								nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
									buttons: [
										JSON.stringify(buttons)
									]
								})
							})
						}
					}
				}, {});

				await client.relayMessage(msg.key.remoteJid, msg.message, {
					messageId: msg.key.id,
					quoted: quoted,
				});
			}
		},

		sendList: {
			async value(jid, text, list, footer, quoted, options = {}) {
				let msg = generateWAMessageFromContent(jid, {
					viewOnceMessage: {
						message: {
							"messageContextInfo": {
								"deviceListMetadata": {},
								"deviceListMetadataVersion": 2
							},
							interactiveMessage: proto.Message.InteractiveMessage.create({
								...options,
								body: proto.Message.InteractiveMessage.Body.create({
									text: text
								}),
								footer: proto.Message.InteractiveMessage.Footer.create({
									text: footer
								}),
								nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
									buttons: [
										{
											"name": "single_select",
											"buttonParamsJson": JSON.stringify(list)
										}
									],
								})
							})
						}
					}
				}, {});

				await client.relayMessage(msg.key.remoteJid, msg.message, {
					messageId: msg.key.id,
					quoted: quoted,
				});
			}
		},

		getFile: {
			/**
				   * getBuffer hehe
				   * @param {fs.PathLike} PATH
				   * @param {Boolean} saveToFile
				   */
			async value(PATH, saveToFile = false) {
				let res; let filename;
				const data = Buffer.isBuffer(PATH) ? PATH : PATH instanceof ArrayBuffer ? PATH.toBuffer() : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0);
				if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer');
				const type = await fileTypeFromBuffer(data) || {
					mime: 'application/octet-stream',
					ext: '.bin',
				};
				if (data && saveToFile && !filename) (filename = path.join(process.cwd(), './src/assets/temp' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data));
				return {
					res,
					filename,
					...type,
					data,
					deleteFile() {
						return filename && fs.promises.unlink(filename);
					},
				};
			},
			enumerable: true,
		},

		sendButton: {
			async value(jid, messages, quoted, options) {
				messages.length > 1 ? await client.sendCarousel(jid, messages, quoted, options) : await client.sendNCarousel(jid, ...messages?.[0], quoted, options);
			}
		},
		sendNCarousel: {
			async value(jid, text = "", footer = "", buffer = null, buttons = [], copy = null, urls = null, list = null, quoted, options) {
				let img, video;
				if (buffer) {
					if (/^https?:\/\//i.test(buffer)) {
						try {
							const response = await fetch(buffer);
							const contentType = response.headers.get("content-type");
							if (/^image\//i.test(contentType)) {
								img = await prepareWAMessageMedia({
									image: {
										url: buffer
									}
								}, {
									upload: client.waUploadToServer,
									...options
								});
							} else if (/^video\//i.test(contentType)) {
								video = await prepareWAMessageMedia({
									video: {
										url: buffer
									}
								}, {
									upload: client.waUploadToServer,
									...options
								});
							} else {
								console.error("Jenis MIME tidak kompatibel:", contentType);
							}
						} catch (error) {
							console.error("Gagal mendapatkan jenis MIME:", error);
						}
					} else {
						try {
							const type = await client.getFile(buffer);
							if (/^image\//i.test(type.mime)) {
								img = await prepareWAMessageMedia({
									image: /^https?:\/\//i.test(buffer) ? {
										url: buffer
									} : type && type?.data
								}, {
									upload: client.waUploadToServer,
									...options
								});
							} else if (/^video\//i.test(type.mime)) {
								video = await prepareWAMessageMedia({
									video: /^https?:\/\//i.test(buffer) ? {
										url: buffer
									} : type && type?.data
								}, {
									upload: client.waUploadToServer,
									...options
								});
							}
						} catch (error) {
							console.error("Gagal mendapatkan tipe file:", error);
						}
					}
				}
				const sources = [{
					data: buttons,
					name: "quick_reply",
					getParams: btn => ({
						display_text: btn?.[0] || "",
						id: btn?.[1] || ""
					})
				}, {
					data: copy,
					name: "cta_copy",
					getParams: cpy => ({
						display_text: cpy?.[0] || "",
						copy_code: cpy?.[1] || ""
					})
				}, {
					data: urls,
					name: "cta_url",
					getParams: url => ({
						display_text: url?.[0] || "",
						url: url?.[1] || "",
						merchant_url: url?.[1] || ""
					})
				}, {
					data: list,
					name: "single_select",
					getParams: lister => ({
						title: lister?.[0] || "",
						sections: lister?.[1] || []
					})
				}];
				const dynamicButtons = _.chain(sources).filter(source => !_.isEmpty(source.data)).flatMap(({
					data,
					name,
					getParams
				}) => _.map(data, item => ({
					name: name,
					buttonParamsJson: JSON.stringify(getParams(item))
				}))).value();
				const interactiveMessage = {
					body: {
						text: text || namebot
					},
					footer: {
						text: footer || wm
					},
					header: {
						hasMediaAttachment: img?.imageMessage || video?.videoMessage ? true : false,
						imageMessage: img?.imageMessage || null,
						videoMessage: video?.videoMessage || null
					},
					nativeFlowMessage: {
						buttons: dynamicButtons.filter(Boolean),
						messageParamsJson: JSON.stringify({
							from: "api",
							templateId: Date.now()
						})
					},
					...mergeContext(client, text, options)
				};
				const messageContent = proto.Message.fromObject({
					viewOnceMessage: {
						message: {
							messageContextInfo: {
								deviceListMetadata: {},
								deviceListMetadataVersion: 2
							},
							interactiveMessage: interactiveMessage
						}
					}
				});
				const msgs = generateWAMessageFromContent(jid, messageContent, {
					userJid: client.user.jid,
					quoted: quoted,
					upload: client.waUploadToServer
				});
				await client.relayMessage(jid, msgs.message, {
					messageId: msgs.key.id
				});
			}
		},
		sendCarousel: {
			async value(jid, messages, quoted, options) {
				if (messages.length > 1) {
					const cards = await Promise.all(messages.map(async ([text = "", footer = "", buffer = null, buttons = [], copy = null, urls = null, list = null]) => {
						let img, video;
						if (/^https?:\/\//i.test(buffer)) {
							try {
								const response = await fetch(buffer);
								const contentType = response.headers.get("content-type");
								if (/^image\//i.test(contentType)) {
									img = await prepareWAMessageMedia({
										image: {
											url: buffer
										}
									}, {
										upload: client.waUploadToServer,
										...options
									});
								} else if (/^video\//i.test(contentType)) {
									video = await prepareWAMessageMedia({
										video: {
											url: buffer
										}
									}, {
										upload: client.waUploadToServer,
										...options
									});
								} else {
									console.error("Jenis MIME tidak kompatibel:", contentType);
								}
							} catch (error) {
								console.error("Gagal mendapatkan jenis MIME:", error);
							}
						} else {
							try {
								const type = await client.getFile(buffer);
								if (/^image\//i.test(type.mime)) {
									img = await prepareWAMessageMedia({
										image: /^https?:\/\//i.test(buffer) ? {
											url: buffer
										} : type && type?.data
									}, {
										upload: client.waUploadToServer,
										...options
									});
								} else if (/^video\//i.test(type.mime)) {
									video = await prepareWAMessageMedia({
										video: /^https?:\/\//i.test(buffer) ? {
											url: buffer
										} : type && type?.data
									}, {
										upload: client.waUploadToServer,
										...options
									});
								}
							} catch (error) {
								console.error("Gagal mendapatkan tipe file:", error);
							}
						}
						const sources = [{
							data: buttons,
							name: "quick_reply",
							getParams: btn => ({
								display_text: btn?.[0] || "",
								id: btn?.[1] || ""
							})
						}, {
							data: copy,
							name: "cta_copy",
							getParams: cpy => ({
								display_text: cpy?.[0] || "",
								copy_code: cpy?.[1] || ""
							})
						}, {
							data: urls,
							name: "cta_url",
							getParams: url => ({
								display_text: url?.[0] || "",
								url: url?.[1] || "",
								merchant_url: url?.[1] || ""
							})
						}, {
							data: list,
							name: "single_select",
							getParams: lister => ({
								title: lister?.[0] || "",
								sections: lister?.[1] || []
							})
						}];
						const dynamicButtons = _.chain(sources).filter(source => !_.isEmpty(source.data)).flatMap(({
							data,
							name,
							getParams
						}) => _.map(data, item => ({
							name: name,
							buttonParamsJson: JSON.stringify(getParams(item))
						}))).value();
						return {
							body: proto.Message.InteractiveMessage.Body.fromObject({
								text: text || namebot
							}),
							footer: proto.Message.InteractiveMessage.Footer.fromObject({
								text: footer || wm
							}),
							header: proto.Message.InteractiveMessage.Header.fromObject({
								title: "Carousel Message",
								subtitle: botdate,
								hasMediaAttachment: img?.imageMessage || video?.videoMessage ? true : false,
								imageMessage: img?.imageMessage || null,
								videoMessage: video?.videoMessage || null
							}),
							nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
								buttons: dynamicButtons.filter(Boolean),
								messageParamsJson: JSON.stringify({
									from: "api",
									templateId: Date.now()
								})
							}),
							...mergeContext(client, text, options)
						};
					}));
					const interactiveMessage = proto.Message.InteractiveMessage.create({
						body: proto.Message.InteractiveMessage.Body.fromObject({
							text: namebot
						}),
						footer: proto.Message.InteractiveMessage.Footer.fromObject({
							text: wm
						}),
						header: proto.Message.InteractiveMessage.Header.fromObject({
							title: author,
							subtitle: botdate,
							hasMediaAttachment: false
						}),
						carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
							cards: cards
						}),
						...mergeContext(client, text, options)
					});
					const messageContent = proto.Message.fromObject({
						viewOnceMessage: {
							message: {
								messageContextInfo: {
									deviceListMetadata: {},
									deviceListMetadataVersion: 2
								},
								interactiveMessage: interactiveMessage
							}
						}
					});
					const msgs = generateWAMessageFromContent(jid, messageContent, {
						userJid: client.user.jid,
						quoted: quoted,
						upload: client.waUploadToServer,

					});
					await client.relayMessage(jid, msgs.message, {
						messageId: msgs.key.id
					});
				} else {
					await client.sendNCarousel(jid, ...messages?.[0], quoted, options);
				}
			}
		},
		sendCta: {
			async value(jid, buttons, body, footer, header, subtitle, quoted, options = {}) {
				const messageContent = proto.Message.fromObject({
					viewOnceMessage: {
						message: {
							messageContextInfo: {
								deviceListMetadata: {},
								deviceListMetadataVersion: 2
							},
							interactiveMessage: proto.Message.InteractiveMessage.create({
								body: proto.Message.InteractiveMessage.Body.create({
									text: body || namebot
								}),
								footer: proto.Message.InteractiveMessage.Footer.create({
									text: footer || wm
								}),
								header: proto.Message.InteractiveMessage.Header.create({
									title: header || author,
									subtitle: subtitle || botdate,
									hasMediaAttachment: false
								}),
								nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
									buttons: [...buttons],
									messageParamsJson: JSON.stringify({
										from: "api",
										templateId: Date.now()
									})
								}),
								...mergeContext(client, text, options)
							})
						}
					}
				});
				const msgs = generateWAMessageFromContent(jid, messageContent, {
					userJid: client.user.jid,
					quoted: quoted,
					upload: client.waUploadToServer
				});
				await client.relayMessage(jid, msgs.message, {
					messageId: msgs.key.id
				});
			}
		},
		ctaButton: {
			get() {
				class Button {
					constructor() {
						this._title = "";
						this._subtitle = "";
						this._body = "";
						this._footer = "";
						this._buttons = [];
						this._data = null;
						this._contextInfo = {};
						this._currentSelectionIndex = -1;
						this._currentSectionIndex = -1;
					}
					setType(type) {
						this._type = type;
						return this;
					}
					setBody(body) {
						this._body = body;
						return this;
					}
					setFooter(footer) {
						this._footer = footer;
						return this;
					}
					makeRow(header = "", title = "", description = "", id = "") {
						if (this._currentSelectionIndex === -1 || this._currentSectionIndex === -1) {
							throw new Error("You need to create a selection and a section first");
						}
						const buttonParams = JSON.parse(this._buttons[this._currentSelectionIndex].buttonParamsJson);
						buttonParams.sections[this._currentSectionIndex].rows.push({
							header: header,
							title: title,
							description: description,
							id: id
						});
						this._buttons[this._currentSelectionIndex].buttonParamsJson = JSON.stringify(buttonParams);
						return this;
					}
					makeSections(title = "") {
						if (this._currentSelectionIndex === -1) {
							throw new Error("You need to create a selection first");
						}
						const buttonParams = JSON.parse(this._buttons[this._currentSelectionIndex].buttonParamsJson);
						buttonParams.sections.push({
							title: title,
							rows: []
						});
						this._currentSectionIndex = buttonParams.sections.length - 1;
						this._buttons[this._currentSelectionIndex].buttonParamsJson = JSON.stringify(buttonParams);
						return this;
					}
					addSelection(title) {
						this._buttons.push({
							name: "single_select",
							buttonParamsJson: JSON.stringify({
								title: title,
								sections: []
							})
						});
						this._currentSelectionIndex = this._buttons.length - 1;
						this._currentSectionIndex = -1;
						return this;
					}
					addReply(display_text = "", id = "") {
						this._buttons.push({
							name: "quick_reply",
							buttonParamsJson: JSON.stringify({
								display_text: display_text,
								id: id
							})
						});
						return this;
					}
					addCopy(display_text = "", id = "") {
						this._buttons.push({
							name: "cta_copy",
							buttonParamsJson: JSON.stringify({
								display_text: display_text,
								copy_code: id
							})
						});
						return this;
					}
					addUrl(display_text = "", url = "") {
						this._buttons.push({
							name: "cta_url",
							buttonParamsJson: JSON.stringify({
								display_text: display_text,
								url: url,
								merchant_url: url
							})
						});
						return this;
					}
					setVideo(path, options = {}) {
						if (!path) throw new Error("URL or buffer needed");
						this._data = Buffer.isBuffer(path) ? {
							video: path,
							...options
						} : {
							video: {
								url: path
							},
							...options
						};
						return this;
					}
					setImage(path, options = {}) {
						if (!path) throw new Error("URL or buffer needed");
						this._data = Buffer.isBuffer(path) ? {
							image: path,
							...options
						} : {
							image: {
								url: path
							},
							...options
						};
						return this;
					}
					setDocument(path, options = {}) {
						if (!path) throw new Error("URL or buffer needed");
						this._data = Buffer.isBuffer(path) ? {
							document: path,
							...options
						} : {
							document: {
								url: path
							},
							...options
						};
						return this;
					}
					setTitle(title) {
						this._title = title;
						return this;
					}
					setSubtitle(subtitle) {
						this._subtitle = subtitle;
						return this;
					}
					async run(jid, client, quoted = {}) {
						const message = {
							body: proto.Message.InteractiveMessage.Body.create({
								text: this._body
							}),
							footer: proto.Message.InteractiveMessage.Footer.create({
								text: this._footer
							}),
							header: proto.Message.InteractiveMessage.Header.create({
								title: this._title,
								subtitle: this._subtitle,
								hasMediaAttachment: !!this._data,
								...this._data ? await prepareWAMessageMedia(this._data, {
									upload: client.waUploadToServer
								}) : {}
							})
						};
						const msg = generateWAMessageFromContent(jid, {
							viewOnceMessage: {
								message: {
									interactiveMessage: proto.Message.InteractiveMessage.create({
										...message,
										contextInfo: this._contextInfo,
										nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
											buttons: this._buttons,
											messageParamsJson: JSON.stringify({
												from: "api",
												templateId: Date.now()
											})
										})
									})
								}
							}
						}, {
							quoted: quoted
						});
						await client.relayMessage(msg.key.remoteJid, msg.message, {
							messageId: msg.key.id
						});
						return msg;
					}
				}
				const button = new Button();
				return button;
			}
		},
		resize: {
			async value(image, width, height) {
				const imageTo = await Jimp.read(image);
				const imageOut = await imageTo.resize(width, height).getBufferAsync(Jimp.MIME_JPEG);
				return imageOut;
			}
		}


	});

	return clients;
}


export default async function serialize(client, msg, store) {
	const m = {};

	if (!msg.message) return;

	// oke
	if (!msg) return msg;

	//let M = proto.WebMessageInfo
	m.message = parseMessage(msg.message);

	if (msg.key) {
		m.key = msg.key;
		m.from = m.key.remoteJid.startsWith('status') ? jidNormalizedUser(m.key?.participant || msg.participant) : jidNormalizedUser(m.key.remoteJid);
		m.fromMe = m.key.fromMe;
		m.id = m.key.id;
		m.device = /^3A/.test(m.id) ? 'ios' : m.id.startsWith('3EB') ? 'web' : /^.{21}/.test(m.id) ? 'android' : /^.{18}/.test(m.id) ? 'desktop' : 'unknown';
		m.isBot = (m.id.startsWith("BAE5") && m.id.length === 16) || (m.id.startsWith("3EB0") && m.key.id.length === 12)
		m.isGroup = m.from.endsWith('@g.us') || isJidGroup(m.key.remoteJid);
		m.participant = jidNormalizedUser(msg?.participant || m.key.participant) || false;
		m.sender = jidNormalizedUser(m.fromMe ? client.user.id : m.isGroup ? m.participant : m.from);
	}

	if (m.isGroup) {
		if (!(m.from in store.groupMetadata)) store.groupMetadata[m.from] = await client.groupMetadata(m.from);
		m.metadata = store.groupMetadata[m.from];
		m.gcName = m.isGroup ? m.metadata.subject : ''
		m.groupMember = m.isGroup ? m.metadata.participants : []
		m.groupAdmins = m.isGroup && m.metadata.participants.reduce((memberAdmin, memberNow) => (memberNow.admin ? memberAdmin.push({ id: memberNow.id, admin: memberNow.admin }) : [...memberAdmin]) && memberAdmin, []);
		m.isAdmin = m.isGroup && !!m.groupAdmins.find(member => member.id === m.sender);
		m.isBotAdmin = m.isGroup && !!m.groupAdmins.find(member => member.id === jidNormalizedUser(client.user.id));
	}

	m.pushName = msg.pushName;
	m.isOwner = m.sender && JSON.parse(process.env.OWNER).includes(m.sender.replace(/\D+/g, ''));

	if (m.message) {
		m.type = getContentType(m.message) || Object.keys(m.message)[0];
		m.msg = parseMessage(m.message[m.type]) || m.message[m.type];
		m.mentions = [...(m.msg?.contextInfo?.mentionedJid || []), ...(m.msg?.contextInfo?.groupMentions?.map(v => v.groupJid) || [])];
		m.body = m.msg?.text || m.msg?.conversation || m.msg?.caption || m.message?.conversation || m.msg?.selectedButtonId || m.msg?.singleSelectReply?.selectedRowId || m.msg?.selectedId || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || m.msg?.name || '';
		m.prefix = config.prefix //new RegExp('^[^]', 'gi').test(m.body) ? m.body.match(new RegExp('^[^]', 'gi'))[0] : '';
		m.isCmd = m.body.startsWith(config.prefix)
		m.command = m.body && m.body.trim().replace(m.prefix, '').trim().split(/ +/).shift();
		m.args =
			m.body
				.trim()
				.replace(new RegExp('^' + escapeRegExp(m.prefix), 'i'), '')
				.replace(m.command, '')
				.split(/ +/)
				.filter(a => a) || [];
		m.text = m.args.join(' ').trim();
		m.expiration = m.msg?.contextInfo?.expiration || 0;
		m.timestamps = (typeof msg.messageTimestamp === "number" ? msg.messageTimestamp : msg.messageTimestamp.low ? msg.messageTimestamp.low : msg.messageTimestamp.high) * 1000 || Date.now()
		m.download = async function download() {
			return (m.type || downloadMediaMessage(m.msg) ||
				m.msg.thumbnailDirectPath) ? await downloadMediaMessage(msg, 'buffer', { reuploadRequest: client.updateMediaMessage }) : Buffer.from(m.body, 'utf-8')
		};
		m.react = async (reaction) => await client.sendMessage(m.from, {
			react: {
				text: reaction,
				key: m.key,
			}
		})


		m.isMedia = !!m.msg?.mimetype || !!m.msg?.thumbnailDirectPath;
		m.url = (m.body.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi) || [])[0] || '';
		m.isQuoted = false;
		if (m.msg?.contextInfo?.quotedMessage) {
			m.isQuoted = true;
			m.quoted = {};
			m.quoted.message = parseMessage(m.msg?.contextInfo?.quotedMessage);

			if (m.quoted.message) {
				m.quoted.type = getContentType(m.quoted.message) || Object.keys(m.quoted.message)[0];
				m.quoted.msg = parseMessage(m.quoted.message[m.quoted.type]) || m.quoted.message[m.quoted.type];
				m.quoted.isMedia = !!m.quoted.msg?.mimetype || !!m.quoted.msg?.thumbnailDirectPath;
				m.quoted.key = {
					remoteJid: m.msg?.contextInfo?.remoteJid || m.from,
					participant: jidNormalizedUser(m.msg?.contextInfo?.participant),
					fromMe: areJidsSameUser(jidNormalizedUser(m.msg?.contextInfo?.participant), jidNormalizedUser(client?.user?.id)),
					id: m.msg?.contextInfo?.stanzaId,
				};
				m.quoted.from = /g\.us|status/.test(m.msg?.contextInfo?.remoteJid) ? m.quoted.key.participant : m.quoted.key.remoteJid;
				m.quoted.fromMe = m.quoted.key.fromMe;
				m.quoted.id = m.msg?.contextInfo?.stanzaId;
				m.quoted.device = /^3A/.test(m.quoted.id) ? 'ios' : /^3E/.test(m.quoted.id) ? 'web' : /^.{21}/.test(m.quoted.id) ? 'android' : /^.{18}/.test(m.quoted.id) ? 'desktop' : 'unknown';
				m.quoted.isBot = (m.quoted.id.startsWith("BAE5") && m.quoted.id.length === 16) || (m.quoted.id.startsWith("3EB0") && m.quoted.id.length === 12)
				m.quoted.isGroup = m.quoted.from.endsWith('@g.us') || isJidGroup(m.quoted.key.remoteJid);
				m.quoted.participant = jidNormalizedUser(m.msg?.contextInfo?.participant) || false;
				m.quoted.sender = jidNormalizedUser(m.msg?.contextInfo?.participant || m.quoted.from);
				m.quoted.mentions = [...(m.quoted.msg?.contextInfo?.mentionedJid || []), ...(m.quoted.msg?.contextInfo?.groupMentions?.map(v => v.groupJid) || [])];
				m.quoted.body = m.quoted.msg?.text || m.quoted.msg?.caption || m.quoted?.message?.conversation || m.quoted.msg?.selectedButtonId || m.quoted.msg?.singleSelectReply?.selectedRowId || m.quoted.msg?.selectedId || m.quoted.msg?.contentText || m.quoted.msg?.selectedDisplayText || m.quoted.msg?.title || m.quoted?.msg?.name || '';
				m.quoted.prefix = config.prefix
				m.quoted.command = m.quoted.body && m.quoted.body.replace(m.quoted.prefix, '').trim().split(/ +/).shift();
				m.quoted.args =
					m.quoted.body
						.trim()
						.replace(new RegExp('^' + escapeRegExp(m.quoted.prefix), 'i'), '')
						.replace(m.quoted.command, '')
						.split(/ +/)
						.filter(a => a) || [];
				m.quoted.text = m.quoted.args.join(' ').trim() || m.quoted.body;
				m.quoted.isOwner = m.quoted.sender && JSON.parse(process.env.OWNER).includes(m.quoted.sender.replace(/\D+/g, ''));
				m.quoted.download = async function download() { return (m.quoted.type || m.quoted.msg?.thumbnailDirectPath) ? await downloadMediaMessage(m.quoted, 'buffer', { reuploadRequest: client.updateMediaMessage }) : Buffer.from(m.quoted.body, 'utf-8') };
				m.quoted.react = async (reaction) => await client.sendMessage(m.from, {
					react: {
						text: reaction,
						key: m.quoted.key,
					}
				})


			}
		}
	}

	m.reply = async (text, options = {}) => {
		if (typeof text === 'string') {
			return await client.sendMessage(m.from, { text, ...options }, { quoted: m, ephemeralExpiration: m.expiration, ...options });
		} else if (typeof text === 'object' && typeof text !== 'string') {
			return client.sendMessage(m.from, { ...text, ...options }, { quoted: m, ephemeralExpiration: m.expiration, ...options });
		}
	};


	return m;
}

function parseMessage(content) {
	content = extractMessageContent(content);

	if (content && content.viewOnceMessageV2Extension) {
		content = content.viewOnceMessageV2Extension.message;
	}
	if (content && content.protocolMessage && content.protocolMessage.type == 14) {
		let type = getContentType(content.protocolMessage);
		content = content.protocolMessage[type];
	}
	if (content && content.message) {
		let type = getContentType(content.message);
		content = content.message[type];
	}

	return content;
}

function mergeContext(client, text, options) {
	return _.merge({
		mentions: typeof text === "string" ? client.parseMention(text || "@0") : [],
		contextInfo: {
			mentionedJid: typeof text === "string" ? client.parseMention(text || "@0") : []
		}
	}, options || {}, client.temareply?.contextInfo ? {
		contextInfo: _.merge(options?.contextInfo || {}, client.temareply.contextInfo, {
			externalAdReply: _.merge(options?.contextInfo?.externalAdReply || {}, client.temareply.contextInfo.externalAdReply)
		})
	} : {});
}
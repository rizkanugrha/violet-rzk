
export default {
    name: 'listonline',
    aliases: ['listonline'],
    category: 'Groups',
    pconly: false,
    group: true,
    admin: true,
    botAdmin: true,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd }) => {
        try {
            let id = args && /\d+\-\d+@g.us/.test(args[0]) ? args[0] : m.from
            let online = []
            if (store.presences && store.presences[id]) {
                online = [...Object.keys(store.presences[id]), client.user.jid]
            } else {
                online = [client.user.jid] // Fallback to just the bot's JID if presence data is unavailable
            }

            // client.sendMessage(m.from, 'List Online:\n\n' + online.map(v => v ? '⭔ @' + v.replace(/@.+/, '') : '').join`\n`, text, { mentions: online })
            client.sendMessage(m.from, {
                text: `> > List Online:\n\n` + online.map(v => v ? '- @' + v.replace(/@.+/, '') : '').join('\n'),
                contextInfo: { mentionedJid: online }
            })
        } catch (e) {

            console.log(e)
        }
    }
}
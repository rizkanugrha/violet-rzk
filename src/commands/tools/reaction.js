
import util from 'util'
export default {
    name: 'react',
    aliases: ['r', 'react', 'reaction'],
    category: 'Tools',
    usage: '<reply msg>',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        try {
            if (args.length < 1) return m.reply(`emoji required\nreply msg ${prefix + cmd} <emot> `)
            if (m.quoted) {
                m.quoted.react(args.join(' '))
            } else {
                m.reply('reply pesan')
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
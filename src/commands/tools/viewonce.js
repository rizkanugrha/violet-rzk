
import util from 'util'

export default {
    name: 'view',
    aliases: ['view', 'viewonce'],
    category: 'Tools',
    usage: '<reply viewonce>',
    pconly: false,
    group: true,
    admin: false,
    botAdmin: true,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        try {
            let quoted = m.isQuoted ? m.quoted : m;

            await m.react('🕒')
            if (!quoted.msg.viewOnce) throw 'Reply Messages Viewonce';
            quoted.msg.viewOnce = false;
            await m.reply({ forward: quoted, force: true });
            await m.react('✅')


        } catch (e) {
            console.log(e);
            await m.react('🍉')

        }

    }
}
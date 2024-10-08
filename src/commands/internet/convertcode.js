import fetch from 'node-fetch';
import os from 'os';

export default {
    name: 'convertcode',
    aliases: ['convertcode', 'codeto'],
    category: 'Internet',
    usage: 'code',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, args, cmd, url, flags }) => {
        if (!args[0]) {
            return m.reply(`Invalid input. Format: convertcode <from>|<to>|<code>\nEx: \n${prefix + cmd} python|java|print("hallo")${os.EOL}a=5${os.EOL}b=10${os.EOL}print(a+b)`);
        }
        await m.react('🕒')
        try {
            const [From, to, ...codeArray] = args.join(' ').split('|');
            const code = codeArray.join('|').replace(/\\n/g, os.EOL);

            if (!From || !to || !code) {
                return m.reply(`Invalid input. Format: convertcode <from>|<to>|<code>\nEx: \n${prefix + cmd} python|java|print("hallo")${os.EOL}a=5${os.EOL}b=10${os.EOL}print(a+b)`);
            }

            const headers = {
                'Content-Type': 'application/json'
            };

            const json_data = {
                'from': From,
                'to': to,
                'code': code,
            };

            const response = await fetch('https://api.codeconverter.com/convert_sample', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(json_data),
            });

            const data = await response.json();
            const result = data.data.result;

            m.reply(`Result: \n\n${result}`);
            await m.react('✅')
        } catch (e) {
            console.log(e);
            await m.react('🍉')
        }
    }
}


import { inlineCode } from '../../../lib/formatter.js'

export default {
    name: 'gemini',
    aliases: ['gemini', 'geminiai'],
    category: 'AI',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, cmd }) => {
        let text = `${inlineCode(`Welcome to AI Gemini`)}\n\n> - ${prefix}startgemini (untuk memulai session chat gemini)\n> - ${prefix}stopgemini (untuk mengakhiri session chat gemini)`
        m.reply(text)
    }
}
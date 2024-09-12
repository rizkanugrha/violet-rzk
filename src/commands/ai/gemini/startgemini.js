import { startSession, isSessionActive, getSessionData, setSessionData } from "../../../lib/tampungai.js";

export default {
    name: 'startgemini',
    aliases: ['startgemini'],
    category: 'AI',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client) => {
        const user = m.sender;

        // Check if a session is already active
        if (isSessionActive(user)) {
            await client.sendMessage(m.from, { text: `Gemini AI session is already active.` }, { quoted: m });
            return;
        }

        // Start a new session if one isn't active
        if (!isSessionActive(user)) {
            startSession(user);

            // Send a message and store the key
            const { key } = await client.sendMessage(user, { text: "Gemini AI session started! How can I assist you today?" }, { quoted: m });
            setSessionData(user, { key });
            return;
        }
    }
}


import { startSession, stopSession, isSessionActive, getSessionData, setSessionData, clearSession } from "../../../lib/tampungai.js";

export default {
    name: 'startgemini',
    aliases: ['startgemini'],
    category: 'AI',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { prefix, cmd }) => {
        const user = m.sender
        stopSession(user);
        await client.sendMessage(user, { text: "Gemini AI session stopped!" }, { quoted: m });
    }
}
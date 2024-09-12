import {
    startSession,
    stopSession,
    isSessionActive,
    getSessionData,
    setSessionData,
    clearSession
} from "../../../lib/tampungai.js";
import { fetch } from "undici";
import { Gemini } from "../../../lib/scrape/gemini.js";

export async function execute(m, client, { args, prefix, body }) {
    try {
        // Ignore certain message types
        if (["protocolMessage", "pollUpdateMessage", "reactionMessage", "stickerMessage"].includes(m.type)) return;

        const user = m.sender;
        if (!isSessionActive(user)) {
            return; // Do not respond if the session hasn't been started
        }

        // Retrieve the session data
        let sessionData = getSessionData(user);

        // Ensure context and key are initialized
        if (!sessionData.context) {
            sessionData.context = [];
        }
        if (!sessionData.key) {
            sessionData.key = null;
        }

        // Check if the current message is a reply to the correct key
        if (!m.quoted || m.quoted.id !== sessionData.key.id) {
            await client.sendMessage(user, { text: "Please reply to the correct message to continue the chat." }, { quoted: m });
            return;
        }

        const msg = encodeURIComponent(body);

        // Fetch response from Gemini AI
        const { result } = await AemtGemini(msg);

        // Store user input and AI response in context
        sessionData.context.push({ role: "user", content: body });
        if (result) {
            sessionData.context.push({ role: "assistant", content: result });

            // Send AI response and store the new key
            const { key } = await client.sendMessage(user, { text: result }, { quoted: m });
            sessionData.key = key;
        }

        // Save the updated session data
        setSessionData(user, sessionData);

    } catch (e) {
        console.error("Gemini AI error:", e);
    }
}

async function AemtGemini(query) {
    const response = await fetch(`https://api.nyxs.pw/ai/gemini-advance?text=${query}`, {
        method: "GET",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        }
    });
    return await response.json();
}

async function GoogleBard(query) {
    try {
        const gemini = new Gemini("__Secure-1PSID", "g.a000nQi7WdGacxzVd47wb8wuRH6BrRkS0WYcBRH1A8-ePNG-ADf4xbAxJ6z-9nId8dwcN4S7MAACgYKAToSARcSFQHGX2Miw7uPtVcg6pd3mqrdQQ6gnhoVAUF8yKoxiq1KssTFdiAr8E0ylRD10076");
        return (await gemini.question(query)).content;
    } catch (e) {
        console.error("An error occurred:", e.message);
        throw e;
    }
}

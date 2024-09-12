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

import { Collection } from "discord.js";
import { basename, join } from 'path';
import { readdirSync } from "fs";
import { fileURLToPath, pathToFileURL } from 'url'
import Color from "./color.js";

export const commands = new Collection()
export const events = new Collection()

const readFilesRecursively = (directory) => {
    const files = [];

    const read = (dir) => {
        const entries = readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                read(fullPath); // Recursively read files in subdirectories
            } else {
                files.push(fullPath);
            }
        }
    };

    read(directory);
    return files;
};

export async function loadCommands() {
    // Get all command files with .js extension
    const commandFiles = readFilesRecursively(join(process.cwd(), '/src/commands')).filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const fileUrl = pathToFileURL(file).href; // Convert file path to file URL

        try {
            // Dynamically import the module using the file URL
            const commandModule = await import(fileUrl);

            // Get the command name from the module or fallback to the file name
            const name = commandModule?.name || basename(file, '.js').toLowerCase();

            // Check if the command should be added to the commands or events collection
            if (!commands.has(name) && !name.endsWith('ev')) {
                commands.set(name, commandModule.default || commandModule); // Support both default and named exports
                console.log('Command', Color.blueBright(name), 'loaded');
            }

            if (!events.has(name) && name.endsWith('ev')) {
                events.set(name, commandModule.default || commandModule); // Support both default and named exports
                console.log('Event', Color.yellowBright(name), 'loaded');
            }

        } catch (error) {
            console.log(`Error importing module ${file}:`, error);
        }
    }

    // Optional: Sorting commands or events if needed
    // commands.sort();

    return commands.size;
}

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

import mongoose from 'mongoose';

export const openDB = async () => {
    try {
        await mongoose
            .connect('YOUR_MONGOOSE_URL',
                {
                    serverSelectionTimeoutMS: 10000, // Increase timeout
                    socketTimeoutMS: 20000 // Increase timeout
                })
            .then(() => console.log('Connected to MongoDB'))
            .catch(err => console.error('Failed to connect to MongoDB', err));
    } catch (e) {
        console.log(e);

    }
}

// Membuat schema untuk koleksi 'stats'
const StatsSchema = new mongoose.Schema({
    msgSent: { type: Number, default: 1 },
    msgRecv: { type: Number, default: 1 },
    filesize: { type: Number, default: 1 },
    autodownload: { type: Number, default: 1 },
    sticker: { type: Number, default: 1 },
    cmd: { type: Number, default: 1 }
}, { bufferCommands: false });

// Membuat schema untuk koleksi 'groups'
const GroupSchema = new mongoose.Schema({
    groupId: String,
    groupName: String,
    antilink: { type: Boolean, default: false },
    antiBadword: { type: Boolean, default: true },
    mute: { type: Boolean, default: false },
    welcome: {
        status: { type: Boolean, default: true },
        msg: { type: String, default: 'Welcome @user in group {title}' }
    },
    leave: {
        status: { type: Boolean, default: true },
        msg: { type: String, default: 'Good bye @user' }
    }
}, { bufferCommands: false });

// Membuat schema untuk koleksi 'afk'
const AFKSchema = new mongoose.Schema({
    jid: String,
    groupId: String,
    groupName: String,
    waktu: Date,
    reason: String
}, { bufferCommands: false });

// Membuat schema untuk koleksi 'user'
const usersSchema = new mongoose.Schema({
    userId: String,
    warn: { type: Number, default: 0 },
    banned: { type: Boolean, default: false }
}, { bufferCommands: false })

// Membuat model untuk masing-masing schema
const Stats = mongoose.model('Stats', StatsSchema);
const Group = mongoose.model('Group', GroupSchema);
const AFK = mongoose.model('AFK', AFKSchema);
const User = mongoose.model('User', usersSchema);


export const configHandler = {
    get: async () => {
        try {
            const data = await Config.findOne();
            return data;
        } catch (err) {
            console.error('Error retrieving config data:', err);
        }
    },
    update: async (key, value) => {
        try {
            await Config.findOneAndUpdate({}, { $set: { [key]: value } }, { new: true });
        } catch (err) {
            console.error('Error updating config data:', err);
        }
    }
};

export async function statistics(prop, count = 1) {
    try {
        let stat = await Stats.findOneAndUpdate({}, { $inc: { [prop]: count } }, { new: true, upsert: true });
        console.log(`Updated ${prop} by ${count}, new value: ${stat[prop]}`);
        return stat[prop];
    } catch (err) {
        console.error('Error updating statistics:', err);
    }
}


export const UserManage = {
    add: async (userId) => {
        try {
            let usernya = await User.findOne({ userId: userId })
            if (usernya) return false;
            usernya = await User.create({ userId: userId });
            return usernya;
        } catch (err) {
            console.error('Err adding user', err);
        }
    },
    get: async (userId) => {
        try {
            const usernya = await User.findOne({ userId: userId });
            return usernya;
        } catch (err) {
            console.error('Error retrieving user:', err);
        }
    },

    update: async (userId, args) => {
        try {
            await User.findOneAndUpdate({ userId: userId }, { $set: args });
        } catch (err) {
            console.error('Error updating user:', err);
        }
    },

}

export const groupManage = {
    add: async (groupId, groupName) => {
        try {
            let group = await Group.findOne({ groupId: groupId });
            if (group) return false;
            group = await Group.create({ groupId: groupId, groupName: groupName });
            return group;
        } catch (err) {
            console.error('Error adding group:', err);
        }
    },
    update: async (groupId, args) => {
        try {
            await Group.findOneAndUpdate({ groupId: groupId }, { $set: args });
        } catch (err) {
            console.error('Error updating group:', err);
        }
    },
    get: async (groupId) => {
        try {
            const group = await Group.findOne({ groupId: groupId });
            return group;
        } catch (err) {
            console.error('Error retrieving group:', err);
        }
    },
    findAll: async () => {
        try {
            const group = await Group.find({});
            return group;
        } catch (err) {
            console.error('Error retrieving group:', err);
        }
    }
};

export const getAfk = {
    add: async (jid, groupId, groupName, waktu, reason) => {
        try {
            await AFK.create({ jid, groupId, groupName, waktu, reason });
        } catch (err) {
            console.error('Error adding AFK entry:', err);
        }
    },
    update: async (jid, groupId, waktu, reason) => {
        try {
            await AFK.findOneAndUpdate({ jid, groupId }, { $set: { waktu, reason } });
        } catch (err) {
            console.error('Error updating AFK entry:', err);
        }
    },
    check: async (jid, groupId) => {
        try {
            const afkEntry = await AFK.findOne({ jid, groupId });
            console.log(afkEntry);
            return afkEntry ? true : false;
        } catch (err) {
            console.error('Error checking AFK entry:', err);
        }
    },
    get: async (jid, groupId) => {
        try {
            const afkEntry = await AFK.findOne({ jid, groupId });
            return afkEntry;
        } catch (err) {
            console.error('Error retrieving AFK entry:', err);
        }
    },
    delete: async (jid, groupId) => {
        try {
            await AFK.deleteOne({ jid, groupId });
        } catch (err) {
            console.error('Error deleting AFK entry:', err);
        }
    },
    getAll: async () => {
        try {
            const afkEntries = await AFK.find();
            return afkEntries;
        } catch (err) {
            console.error('Error retrieving all AFK entries:', err);
        }
    }
};



// Fungsi untuk menutup koneksi database
export const closeDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error closing database connection:', error.message);
    }
}
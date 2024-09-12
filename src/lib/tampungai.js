export const tampungai = {};

export function startSession(user) {
    if (tampungai[user]) {
        clearTimeout(tampungai[user].timeout); // Clear any existing timeout
    } else {
        tampungai[user] = { active: true, data: {} };
    }
    resetSessionTimeout(user);
}

export function stopSession(user) {
    if (tampungai[user]) {
        tampungai[user].active = false;
        clearTimeout(tampungai[user].timeout); // Clear the timeout when the session stops
    }
}

export function isSessionActive(user) {
    return tampungai[user] && tampungai[user].active;
}

export function getSessionData(user) {
    return tampungai[user] ? tampungai[user].data : {};
}

export function setSessionData(user, data) {
    if (!tampungai[user]) {
        startSession(user);
    }
    tampungai[user].data = { ...tampungai[user].data, ...data };
    resetSessionTimeout(user); // Reset the timeout each time session data is updated
}

export function clearSession(user) {
    delete tampungai[user];
}

function resetSessionTimeout(user) {
    if (tampungai[user]) {
        tampungai[user].timeout = setTimeout(() => {
            stopSession(user);
            console.log(`Session for ${user} has ended due to inactivity.`);
        }, 5 * 60 * 1000); // 5 minutes
    }
}

// New function to get the last session stop time
export function getLastSessionStopTime(user) {
    return tampungai[user] ? tampungai[user].lastStopTime : null;
}
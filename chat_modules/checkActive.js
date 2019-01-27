let checkActive = {
    check(users, io) {
        users.usersOnline.forEach((user, index) => {
            if (typeof user.id != "undefined") {
                if (user.activeStatus == 1 && user.activityTries > 3) {
                    io.to(`${user.id}`).emit("disconnected");
                    if (typeof io.sockets.sockets[user.id] != "undefined") {
                        io.sockets.sockets[user.id].disconnect();
                        io.emit("usersOnline-fetch", users.getOnline());
                    }
                    users.usersOnline.splice(index, 1);
                } else {
                    io.to(`${user.id}`).emit("checkActivity");
                    user.activeStatus = 1;
                    if (
                        typeof user.activityTries == "undefined" ||
                        user.activityTries == 0
                    ) {
                        user.activityTries = 1;
                    } else {
                        user.activityTries += 1;
                    }
                }
            }
        });
    },

    setStatus(status, user) {
        user.activeStatus = status;
        user.activityTries = 0;
    }
};

module.exports = checkActive;

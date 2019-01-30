let chat = {
    serverStatus: 0,
    users: {
        usersOnline: [],
        addUser(data) {
            let user = {
                id: data.clientId,
                name: data.user.user
            };

            this.usersOnline.push(user);
        },
        getOnline() {
            let online = [];
            for (let user in this.usersOnline) {
                let u = {};
                u.name = this.usersOnline[user].name;
                u.status = "online";
                online.push(u);
            }
            return online;
        }
    }
};

module.exports = chat;

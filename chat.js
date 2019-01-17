let chat = {

    users: {
        usersOnline: [],
        addUser(data) {
            let user = {
                id: data.clientId,
                name: data.user.user
            }

            this.usersOnline.push(user)
        }
    }    

}

module.exports = chat;
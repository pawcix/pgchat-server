const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const chat = require("./chat");
const processMessage = require("./chat_modules/processMessage");
const moment = require("moment");

const port = process.env.PORT || 3000;

app.get("/", function(req, res) {
    res.send("Server running");
});

io.on("connection", socket => {
    let clientId = socket.id;
    console.log(clientId);

    socket.on("disconnect", () => {
        let findUser = users => {
            return users.id == socket;
        };

        let user = chat.users.usersOnline.findIndex(
            users => users.id == socket.id
        );

        if (typeof user != "undefined") chat.users.usersOnline.splice(user, 1);
    });

    socket.on("chat-send", data => {
        let user = chat.users.usersOnline.find(users => users.id == socket.id);
        if (typeof user == "undefined") (user = {}), (user.name = "Nieznany");
        // todo: jak serwer się wyłączy, wyślij wszystkim event żeby się połączyli i podali imię

        // Process message
        let message = { msg: data.message };
        processMessage(message, chat);

        if (message) {
            // Tell the broadcaster the message has been sent.
            socket.emit("chat-message-status", { success: true });

            // Send the message to everyone except broadcaster.
            socket.broadcast.emit("chat-message", {
                message: message.msg,
                user: user.name,
                date: moment.now(),
                author: false,
                msgData: message.data
            });

            // Send the message to broadcaster (it's his message!)
            socket.emit("chat-message", {
                message: message.msg,
                user: user.name,
                date: moment.now(),
                author: true,
                msgData: message.data
            });
        }
    });

    socket.on("logIn", user => {
        if (typeof user == "undefined" || typeof user.user == "undefined")
            socket.disconnect();

        chat.users.addUser({ clientId, user });
    });
});

http.listen(port, function() {
    console.log(`Server app listening on port ${port}`);
});

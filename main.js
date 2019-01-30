const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const chat = require("./chat");
const processMessage = require("./chat_modules/processMessage");
const moment = require("moment");
const checkActive = require("./chat_modules/checkActive");

const port = process.env.PORT || 3000;

app.get("/", function(req, res) {
    res.send("Server running");
});

app.get("/status", (req, res) => {
    res.send({ status: chat.serverStatus });
});

// Check all users activity
setInterval(() => {
    checkActive.check(chat.users, io);
}, 5000);

io.on("connection", socket => {
    let clientId = socket.id;

    socket.on("logIn", user => {
        if (typeof user == "undefined" || typeof user.user == "undefined")
            socket.disconnect();

        chat.users.addUser({ clientId, user });
    });

    socket.on("getStatus", status => {
        let user = chat.users.usersOnline.find(users => users.id == socket.id);
        checkActive.setStatus(status, user);
    });

    socket.on("userReady", () => {
        let user = chat.users.usersOnline.find(users => users.id == socket.id);

        if (typeof user != "undefined") {
            socket.emit("connectionStatus", { status: true });
            connected(socket, user);
        } else {
            socket.emit("connectionStatus", { status: false });
        }
    });
});

// Notifications
let notify = (socket, type, text) => {
    socket.emit("notification", { type, text });
};

let connected = (socket, user) => {
    // Notify about new user
    notify(
        socket.broadcast,
        "info",
        `Użytkownik ${user.name} połączył się z czatem.`
    );

    io.emit("usersOnline-fetch", chat.users.getOnline());

    socket.on("disconnect", () => {
        let user = chat.users.usersOnline.findIndex(
            users => users.id == socket.id
        );

        if (typeof user != "undefined" && user != -1) {
            let username = chat.users.usersOnline[user].name;
            chat.users.usersOnline.splice(user, 1);

            io.emit("usersOnline-fetch", chat.users.getOnline());

            // Notify about disconnection
            notify(
                socket.broadcast,
                "info",
                `Użytkownik ${username} rozłączył się z czatem.`
            );
        }
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
};

http.listen(port, function() {
    console.log(`Server app listening on port ${port}`);
    chat.serverStatus = 1;
});

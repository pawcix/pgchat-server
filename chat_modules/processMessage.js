const markSomeone = require("./markSomeone");

let processMessage = (message, chat) => {
    let data = {};
    if (message.msg.trim().length == 0) message.msg = false;

    markSomeone(message.msg, chat, data);

    message.data = data;
};

module.exports = processMessage;

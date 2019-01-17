let markSomeone = (message, chat, data) => {
    let pattern = /@([A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ0-9]*)/g;
    let marked = message.match(pattern);
    if (marked != null && marked.length != 0) {
        data.marked = marked;
    }
};

module.exports = markSomeone;

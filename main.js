const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const chat = require("./chat");

const port = process.env.PORT || 3000

app.get('/', function(req, res){
  res.send('Server running')
})

io.on('connection', socket => {

  let clientId = socket.id;

  socket.on('disconnect', () => {

    let findUser = users => {
      return users.id == socket
    }
    
    let user = chat.users.usersOnline.findIndex(users => users.id == socket.id)
    
    if(typeof(user) != 'undefined')
      chat.users.usersOnline.splice(user, 1)

  })

  socket.on('chat-send', data => {
    
    let user = chat.users.usersOnline.find(users => users.id == socket.id)
    io.emit('chat-message', {message: data.message, user: user.name})

  })

  socket.on('logIn', user => {
    
    if(typeof(user) == 'undefined' || typeof(user.user) == 'undefined')
      socket.disconnect()

    chat.users.addUser({clientId, user})
    
  })

})


http.listen(port, function(){
  console.log(`Server app listening on port ${port}`)
})
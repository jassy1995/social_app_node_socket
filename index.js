require("dotenv").config();
const PORT = process.env.PORT || 8900
const io = require('socket.io')(PORT, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true,
        allowedHeaders: ["access-token"],
    }
});

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) && users.push({ userId, socketId });
}

const getUser = (userId) => {
    return users.find(user => user.userId === userId);
}
const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
}

io.on("connection", (socket) => {
    //when connection is established
    console.log('a user connected');

    //take userId and socketId from sever
    socket.on('addUser', (userId) => {
        addUser(userId, socket && socket.id);
        io.emit('getUsers', users)
    });

    //send and get message
    socket.on('sendMessage', ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        io.to(user && user.socketId).emit('getMessage', { senderId, text })
    })
    //when disconnect
    socket.on('disconnect', () => {
        console.log('a user disconnected')
        removeUser(socket && socket.id);
        io.emit('getUsers', users)
    });
}) 
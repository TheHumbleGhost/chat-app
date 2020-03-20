const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const { generateMessage, generateLocationMessage } = require('../src/utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('../src/utils/users');

const app =  new express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

io.on('connection', (socket) => {

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        if(user) {
            io.to(user.room).emit('message', generateMessage(user.username, message));
            callback();
        }
    });

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({ id: socket.id, room, username});
        if(error) {
            return callback(error);
        }
        socket.join(user.room);
        socket.emit("message",generateMessage("Admin", "Welcome!!"));
        socket.broadcast.to(user.room).emit('message',generateMessage("Admin", `${user.username} has joined`));

        io.to(user.room).emit('roomData', {
            roomName: user.room,
            users: getUsersInRoom(user.room)
        });
        callback()
    });

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        if(user) {
            io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.lat},${location.long}`));
            callback("Location shared!")
        }
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user) {
            io.to(user.room).emit('message', generateMessage("Admin", `${user.username} just left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

server.listen(port, () => {
    console.log(`Server is up ${port}`);
});
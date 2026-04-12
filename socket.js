const io = require('socket.io')();

const socketApi = { io: io };
let activeUsers = 0;

io.on('connection', function(socket) {
    activeUsers++;
    
    // Broadcast the updated count to everyone
    io.emit('update-online-users', activeUsers);
    
    // Send the current count immediately to the newly connected client
    socket.emit('update-online-users', activeUsers);

    socket.on('disconnect', () => {
        activeUsers--;
        // Ensure count doesn't go below 0 just in case
        if (activeUsers < 0) activeUsers = 0;
        io.emit('update-online-users', activeUsers);
    });
});

module.exports = socketApi;

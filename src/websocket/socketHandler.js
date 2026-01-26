const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const url = require('url');

const jwtSecret = process.env.JWT_SECRET || 'verystrongsecret';

const socketHandler = (server) => {
    const wss = new WebSocketServer({ noServer: true });

    wss.on('connection', (ws, request) => {
        console.log('✅ WebSocket connected:', request.user);

        ws.on('message', (data) => {
            console.log('📩 Received:', data.toString());
        });

        ws.on('error', (err) => {
            console.error('WS error:', err);
        });

        ws.send(JSON.stringify({ message: 'Connected successfully' }));
    });



    server.on('upgrade', (request, socket, head) => {
        const { pathname, query } = url.parse(request.url, true);
        const token = query.token;

        //  allow websocket connections on /ws
        if (pathname !== '/ws') {
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
            socket.destroy();
            return;
        }

        if (!token) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            request.user = {
                userId: decoded.userId,
                role: decoded.role
            };

            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        });
    });

};

module.exports = socketHandler;

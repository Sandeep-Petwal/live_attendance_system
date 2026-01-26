const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');

const socketHandler = require("./src/websocket/socketHandler");
const router = require('./src/routes/routes');
const { errorHandlerMiddleware } = require('./src/middlewares/asyncHandler');
const connectMongodb = require('./src/db/db');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/", router);
app.use(errorHandlerMiddleware);

// WebSocket
socketHandler(server);

// DB
connectMongodb().catch(console.error);

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

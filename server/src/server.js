import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { Server } from "socket.io";
import http from "http";


import connectMongoDB from "./config/db.config.js";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS,
    methods: ["GET", "POST"],
  },
});


const startServer = () => {
  app.use(cors({
    origin: process.env.CORS_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(express.json());


  app.use(process.env.API_PREFIX, routes);

  app.use(morgan("dev"));

  connectMongoDB();

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(` 🌐 Local: http://localhost:${PORT}/`);
  });

  let onlineUsers = [];
  io.on("connection", (socket) => {

    socket.on("addNewUser", (userId) => {
      !onlineUsers.some((user) => user.userId == userId) &&
        onlineUsers.push({
          userId,
          socketId: socket.id,
        });
      console.log(`Connected Users:`, onlineUsers);

      //send active users
      io.emit("getUsers", onlineUsers);
    });

    socket.on("sendMessage", (message) => {
      const user = onlineUsers.find((user) => user.userId == message.recipientId);


      if (user) {
        console.log("sending message and notification");
        io.to(user.socketId).emit("getMessage", message);
        io.to(user.socketId).emit("getNotification", {
          senderId: message.senderId,
          isRead: false,
          date: new Date(),
        });
      }
    });

    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId != socket.id);
      console.log(`User Disconnected:`, onlineUsers);

      //send active users
      io.emit("getUsers", onlineUsers);
    });
  })

};

(async () => {
  try {
    console.log("Starting Server...");
    startServer();
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
})();
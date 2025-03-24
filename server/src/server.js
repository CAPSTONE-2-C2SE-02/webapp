import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { Server } from "socket.io";
import http from "http";

import { swaggerUi, swaggerSpec } from "./config/swagger.config.js";

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

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log("Swagger Docs available at: http://localhost:5000/api-docs");

const startServer = () => {
  app.use(cors({
    origin: process.env.CORS_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use(process.env.API_PREFIX, routes);

  app.use(morgan("dev"));

  connectMongoDB();

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(` 🌐 Local: http://localhost:${PORT}/`);
  });

  let oneLineUses = [];


  io.on("connection", (socket) => {

    socket.on("addNewUser", (userId) => {
      !oneLineUses.some(user => user.userId === userId) &&
        oneLineUses.push({ userId, socketId: socket.id });

      console.log("👤Connected Users", oneLineUses);

      io.emit("getUsers", oneLineUses);
    });

    //Listen event client send message
    socket.on("sendMessage", (message) => {
      const user = oneLineUses.find(user => user.userId === message.recipientId);

      if (user) {
        console.log("📩 Message sent and notification");
        io.to(user.socketId).emit("getMessage", message);
        io.to(user.socketId).emit("notification", {
          senderId: message.senderId,
          isRead: false,
          date: new Date(),
        });
      }
    });

    //Listen event client disconnect
    socket.on("disconnect", () => {
      oneLineUses = oneLineUses.filter(user => user.socketId !== socket.id);
      console.log("�� Disconnected Users", oneLineUses);

      io.emit("getUsers", oneLineUses);
    });
  });
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
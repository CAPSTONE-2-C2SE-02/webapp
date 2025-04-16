import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import morgan from "morgan";
import { Server } from "socket.io";
import { swaggerSpec, swaggerUi } from "./config/swagger.config.js";

import connectMongoDB from "./config/db.config.js";
import routes from "./routes/index.js";

import checkExpiredBookings from "./jobs/cron.job.js";
import { consumeNotifications } from "./consumers/notification.consumer.js";

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
console.log(`Swagger Docs available at: http://localhost:${process.env.PORT}/api-docs`);

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

  // Cron Jobs
  checkExpiredBookings();

  // Consumer notification
  // consumeNotifications().catch(console.error);
  consumeNotifications(io).catch(console.error);

  // Socket io
  global.oneLineUses = [];

  io.on("connection", (socket) => {
    socket.on("addNewUser", (userId) => {
      !oneLineUses.some(user => user.userId === userId) &&
        oneLineUses.push({ userId, socketId: socket.id });

      console.log("👤Connected Users", global.oneLineUses);

      io.emit("getUsers", global.oneLineUses);
    });

    // Notification
    socket.on("sendNotification", ({ receiverId, notification }) => {
      const recipient = oneLineUses.find(user => user.userId === receiverId);

      if (recipient) {
        io.to(recipient.socketId).emit("new_notification", notification);
        console.log("🔔 Sent notification to:", receiverId);
      }
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
      global.oneLineUses = global.oneLineUses.filter(user => user.socketId !== socket.id);
      console.log("❌ Disconnected Users", global.oneLineUses);

      io.emit("getUsers", global.oneLineUses);
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
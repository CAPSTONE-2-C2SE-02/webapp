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
import Message from "./models/message.model.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});


const startServer = () => {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(express.json());


  app.use(process.env.API_PREFIX, routes);

  app.use(morgan("dev"));

  connectMongoDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(` 🌐 Local: http://localhost:${PORT}/`);
  });

  io.on("connection", (socket) => {
    console.log(`⚡ New client connected: ${socket.id}`);

    //Listen event client send message
    socket.on("sendMessage", async ({ sender, receiver, content }) => {
      try {
        const message = new Message({ sender, receiver, content });
        await message.save();

        // receive message
        io.to(receiver).emit("receiveMessage", message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    //Listen event client disconnect
    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
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
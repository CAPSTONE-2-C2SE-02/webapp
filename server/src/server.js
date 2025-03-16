import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

import connectMongoDB from "./config/db.config.js";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const startServer = () => {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(express.json());

  // app.get("/", (req, res) => {
  //   res.send("API Capstone 2 Project - C2SE.02");
  // });

  app.use(process.env.API_PREFIX, routes);

  app.use(morgan("dev"));

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(` 🌐 Local: http://localhost:${PORT}/`);
    connectMongoDB();
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
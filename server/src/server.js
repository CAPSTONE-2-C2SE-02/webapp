import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const app = express();
const PORT = 8000 || 8080;

const startServer = () => {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("API Capstone 2 Project - C2SE.02");
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(` 🌐 Local: http://localhost:${PORT}/`);
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
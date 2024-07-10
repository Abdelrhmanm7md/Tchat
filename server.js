import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
const app = express();

import cors from "cors";
import dbConnection from "./database/DBConnection.js";
import { init } from "./src/modules/index.js";
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));
app.use(express.json());
app.use(cors());

dbConnection();

init(app);

app.listen(process.env.PORT || 8000, () =>
  console.log(`Server is running on port ${process.env.PORT || 8000}!`)
);
httpServer.listen(8001);
export const sio = io;

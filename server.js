//importing
import express from "express";
import http, { createServer } from "http";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
//app config
const app = express();
// const server = http.Server(app);
const server = http.createServer(app);
const port = process.env.PORT || 9000;
const io = new Server(server, {});
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

//middleware
app.use("/peerjs", peerServer);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(cors());

//api routes
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    // console.log("we have joined the room");
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});

//listner
server.listen(port, () => console.log(`Listening on LocalHost :${port}`));

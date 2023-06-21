import http from "http";
import SocketIo from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
// router handler
app.get("/", (_, res) => res.render("home"));
// catchall-url
app.get("/*", (_, res) => res.redirect("/"));

// http server 구동
const httpServer = http.createServer(app);

// Socket.io Server 구동
const wsServer = SocketIo(httpServer)

wsServer.on("connection", (socket) => {
    socket["nickname"] = "anonymous";
    // like middleware : 어느 event에서든지 console.log를 할 수 있음
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });

    // 끝낼 때 실행되는 argument가 function이 되어야 함
    socket.on("enter_room", (roomName, showRoom) => {
        // 방에 참가하면
        socket.join(roomName);
        // app.js의 showRoom function 실행
        showRoom()
        // socket.to(roomName)으로 특정 room에 있는 socket에게만 이벤트를 보낼 수 있음
        // 특정 room의 자신을 제외한 모든 socket에게 welcome 이벤트 전달
        socket.to(roomName).emit("hello", socket.nickname)
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) =>
            socket.to(room).emit("bye", socket.nickname)
        );
    });

    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });

    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
})

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);

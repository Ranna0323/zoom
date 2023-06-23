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

/*웹소켓 서버 + http 서버 둘다 사용 가능하게 합친다.(굳이 http프로토콜 서버가 필요없으면 안해도댐)*/
const httpServer = http.createServer(app);

// Socket.io Server 구동
const wsServer = SocketIo(httpServer);

function publicRooms() {
    const {
        sockets: {
            adapter: { sids, rooms }
        }
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

/**socket.io방식*/
wsServer.on("connection", (socket) => {
    socket["nickname"] = "anonymous";
    socket.onAny((event) => {
        // console.log(wsServer.sockets.adapter);
        console.log(`Socket Event: ${event}`);
    });

    //방 들어옴
    socket.on("enter_room",(roomName, nickname, showRoom)=>{
        socket["nickname"] = nickname;

        socket.join(roomName);
        showRoom();

        // console.log(countRoom(roomName))
        // console.log(typeof countRoom(roomName))

        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        // wsServer.to(roomName).emit("enter_room", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change",publicRooms());
    });

    //방 나감
    socket.on("disconnecting",()=>{
        socket.rooms.forEach((room) =>
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
        );
    });

    // exit 버튼 눌렀을 때 방 나감
    socket.on("leave",()=>{
        socket.rooms.forEach((room) =>
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
        );
    });

    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });

    socket.on("new_message",(msg,room,showRoom)=>{
        socket.to(room).emit("new_message",`${socket.nickname} : ${msg}`);
        showRoom();
    });

    socket.on("nickname",(nickname)=>socket["nickname"]=nickname);
});

const handleListen = () => console.log("Listening on http://localhost:3000")
httpServer.listen(3000, handleListen);
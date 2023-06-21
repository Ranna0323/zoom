import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
// router handler
app.get("/", (_, res) => res.render("home"));
// catchall-url
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// http server 구동
const server = http.createServer(app);
// WebSocket Server 구동
const wss = new WebSocket.Server({ server });

// Put all your backend code here.
function onSocketClose(){
    console.log("Disconnected from the Browser ❌")
}

// fake database example - 어떤 브라우저로 접속해도 소통할 수 있게
const sockets = []

wss.on("connection", (socket) => {
    sockets.push(socket)
    // 익명의 사용자 - 아직 nickName을 정하지 않은(Socket안에 정보 저장하기)
    socket["nickname"] = "Anonymous";
    console.log("Connected to Browser ✅")
    socket.on("close", onSocketClose)

    socket.on("message", (msg) => {
        // string을 object로 바꿔줌
        const message = JSON.parse(msg);

        switch (message.type) {
            case "new_message":
                sockets.forEach((aSocket) =>
                    aSocket.send(`${socket.nickname}: ${message.payload}`)
                );
                break;
            case "nickname":
                socket["nickname"] = message.payload;
                break;
        }
    });

    // socket.send("hello")

})


server.listen(3000, handleListen);

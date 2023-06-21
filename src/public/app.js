const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`)

function makeMessage(type, payload) {
    const msg = { type, payload };
    // 웹소켓이 브라우저에 있는 API이기 때문에 서버로 message를 보낼 때는 항상 string으로 보내줘야 한다.
    return JSON.stringify(msg);
}

function handleOpen(){
    console.log("Connected to Server ✅")
}
socket.addEventListener("open", handleOpen)

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
})

socket.addEventListener("close", () => {
    console.log("Disconnected to Server ❌")
})

// chat으로 보내는 메세지
function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    input.value = "";
}

// nickName 변경하고 싶을 때 BE로 보냄
function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
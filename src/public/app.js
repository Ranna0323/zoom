const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;
let nickName;

function handleRoomSubmit(event) {
    event.preventDefault();
    const roomNameInput = form.querySelector("#roomName");
    const nickNameInput = form.querySelector("#name");

    if (nickNameInput.value === "") {
        socket.emit("nickname", "Anonymous");
    } else {
        socket.emit("nickname", nickNameInput.value);
    }
    nickName = nickNameInput.value;

    socket.emit("enter_room", roomNameInput.value, showRoom);
    roomName = roomNameInput.value;
    roomNameInput.value = "";
}

function addMessage(message){
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = message
    ul.appendChild(li)
}

//메세지 전송 버튼을 누르면
function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    //new_message 전송
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

//방 보여주는 호출 함수
function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room: ${roomName}`;
    const h4 = room.querySelector("h4");
    h4.innerText = `Hi ${nickName}`;

    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("hello", (user) => {
    addMessage(`${user} arrived!`);
});

socket.on("bye", (left) => {
    addMessage(`${left} left ㅠㅠ`);
});

socket.on("new_message", addMessage);
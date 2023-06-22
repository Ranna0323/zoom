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
    const span = document.createElement("span")

    if(message.includes("You:")){
        li.classList.add('mine')
    } else if(message.includes(`arrived`)){
        li.classList.add('system')
    } else if(message.includes(`left`)){
        li.classList.add('system')
    } else{
        li.classList.add('others')
    }
    span.innerText = message
    ul.appendChild(li)
    li.appendChild(span)
}

//메세지 전송 버튼을 누르면
function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg_form input");
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

    const msgForm = room.querySelector("#msg_form");
    msgForm.addEventListener("submit", handleMessageSubmit);
}

form.addEventListener("submit", handleRoomSubmit);


socket.on("hello", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived!`);
});

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${left} left ㅠㅠ`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if (rooms.length === 0) {
        return;
    }
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});

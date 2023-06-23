/* eslint-disable */
const socket = io();
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const exitBtn = document.getElementById("exit");

room.hidden = true;

let roomName;
let nickName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    const span = document.createElement("span")

    if(message.includes(`You(`)){
        li.classList.add('mine')
    } else if(message.includes(`arrived`)){
        li.classList.add('system')
    } else if(message.includes(`left`)){
        li.classList.add('system')
    }else if(message.includes(`The nickname "${nickName}"`)){
        li.classList.add('system')
    }
    else {
        li.classList.add('others')
    }
    span.innerText = message
    ul.appendChild(li)
    li.appendChild(span)
}
function handleMessageSubmit(e) {
    e.preventDefault();
    const input = room.querySelector("#msg input");
    const nickNameInput = room.querySelector("#nickname input");

    socket.emit("new_message",input.value,roomName,()=>{
        addMessage(`You(${nickNameInput.value}): ${input.value}`);
        input.value="";
    });
}
function handleNicknameSubmit(e) {
    e.preventDefault();
    const nickNameInput = room.querySelector("#nickname input");

    if(nickNameInput.value !== nickName){
        addMessage(`The nickname "${nickName}" is changed to "${nickNameInput.value}"`);
    }
    socket.emit("nickname",nickNameInput.value);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    // const input = form.querySelector("input");
    const roomNameInput = form.querySelector("#roomName");
    const nickNameInput = form.querySelector("#name");

    socket.emit("enter_room",roomNameInput.value, nickNameInput.value, showRoom);
    roomName = roomNameInput.value;
    roomNameInput.value="";

    nickName = nickNameInput.value;
    const changeNameInput = room.querySelector("#nickname input");
    changeNameInput.value = nickName;
}

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;

    const h3 = room.querySelector("h3");
    h3.innerText = `Current Room: ${roomName}`;

    const nameForm = room.querySelector("#nickname");
    const msgForm = room.querySelector("#msg");

    msgForm.addEventListener("submit",handleMessageSubmit);
    nameForm.addEventListener("submit",handleNicknameSubmit);
}

form.addEventListener("submit",handleRoomSubmit);

// 나가기 버튼 함수
const exitClick = (e) => {
    socket.emit("leave", roomName);
    welcome.hidden = false;
    room.hidden = true;
};

exitBtn.addEventListener("click", exitClick);

socket.on("welcome", (user, newCount) => {
    console.log(newCount)
    console.log(typeof newCount)
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived! 😀`);
});


socket.on("bye",(user, newCount) =>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} left 😭!`);
});
socket.on("new_message",(msg)=>{addMessage(msg)});

socket.on("room_change",(publicRooms)=>{
    console.log(publicRooms);
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if (publicRooms.length === 0) {
        return;
    }
    publicRooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});


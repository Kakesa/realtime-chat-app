const socket = io("http://localhost:5000");

const roomInput = document.getElementById("room");
const messageInput = document.getElementById("message");
const messagesDiv = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");

let currentRoom = null;

sendBtn.addEventListener("click", () => {
    const room = roomInput.value;
    const message = messageInput.value;

    if (!currentRoom || currentRoom !== room) {
        socket.emit("joinRoom", room);
        currentRoom = room;
    }

    socket.emit("sendMessage", { room, message });
    messageInput.value = "";
});

socket.on("receiveMessage", (data) => {
    const msg = document.createElement("div");
    msg.className = "p-2 bg-gray-600 rounded mb-1";
    msg.textContent = data.message;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

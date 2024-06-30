const socket = io();

const clientsTotal = document.getElementById("clients-total");
const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageInput = document.getElementById("message-input");
const messageForm = document.getElementById("message-form");

const messageTone = new Audio("message-tone.mp3");

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

socket.on("clients-total", (data) => {
  clientsTotal.innerText = `Total clients: ${data}`;
});

function sendMessage() {

  if (nameInput.value === "" || messageInput.value === "") return alert("Напишите имя и сообщение");

  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };
  socket.emit("message", data);
  addMessageToUI(true, data);

  messageInput.value = "";

  scrollToBottom();
}

socket.on("chat-message", (data) => {
  messageTone.play();
  addMessageToUI(false, data);

  scrollToBottom();
});

function addMessageToUI(isOwnMessage, data) {
  clearTyping();
  const element = `
    <li class="${isOwnMessage ? "message-right" : "message-left"}">
      <p class="message">
        ${data.message}
        <span>${data.name} - ${moment(data.dateTime).fromNow()}</span>
      </p>
    </li>
  `;

  messageContainer.innerHTML += element;
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

messageInput.addEventListener("focus", (e) => {
  socket.emit("typing", {
    name: `${nameInput.value} is typing a message`,
  });
})
messageInput.addEventListener("keypress", (e) => {

  socket.emit("typing", {
    name: `${nameInput.value} is typing a message`,
  });
})
messageInput.addEventListener("blur", (e) => {

  socket.emit("typing", {
    name: "",
  });
})

socket.on("typing", (data) => {
  clearTyping();
  const element = `
    <li class="message-feedback">
      <p class="feedback" id="feedback">${data.name}</p>
    </li>
  `;

  messageContainer.innerHTML += element;

})

function clearTyping() {
  document.querySelectorAll('li.message-feedback').forEach(element => {
    element.parentNode.removeChild(element);
  })
}
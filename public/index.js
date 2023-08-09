document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('message');
    const currentUrl = window.location.href;
    const socketUrl = currentUrl.replace('http', 'ws');
    const socket = new WebSocket(socketUrl);

    socket.onopen = (event) => {
        console.log('Connected to server.');
    };

    socket.onmessage = (event) => {
        const message = event.data;
        console.log('Received from server:', message);
        if (message instanceof Blob) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const messageContent = e.target.result;
                const textarea = document.getElementById("message");
                textarea.value = messageContent;
                console.log("if evaluated.")
            };
            reader.readAsText(message);
        }
        else {
            const textarea = document.getElementById("message");
            textarea.value = message;
        }
    };

    textarea.addEventListener('input', () => {
        const message = textarea.value;
        socket.send(message);
    });
});
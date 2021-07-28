let socket;

function setup() {
    createCanvas(800, 600);
    background(51);

    socket = io.connect('http://localhost:3000');
}

function mouseDragged() {
    let data = {
        x: mouseX,
        y: mouseY
    }

    socket.emit('mouse', data);

    noStroke();
    fill(255);
    ellipse(mouseX, mouseY, 60, 60)
}

function draw() {
    // Listening to server events
    socket.on('mouse', (data) => {
        noStroke();
        fill(255);
        ellipse(data.x, data.y, 60, 60)
    });
}
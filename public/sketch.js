let player, opponent, ball;

let width = 800, 
    height = 600,
    pConstant = 1;

let socket = io.connect('http://localhost:3000');

class Player {
    constructor(x, y, speed, width, height) {
        this.x = x
        this.y = y
        this.speed = speed
        this.width = width
        this.height = height
    }

    move() {
        if (keyIsDown(LEFT_ARROW)) {
            this.x -= this.speed * (this.x > 0)
        } else if (keyIsDown(RIGHT_ARROW)) {
            this.x += this.speed * (this.x < width - this.width)
        } else {
            return
        }

        // inverse the data to match the opponent
        socket.emit('playerMoved', {
            x: width - (this.x + this.width),
            y: height - this.y,
            width: this.width,
            height: this.height
        });
    }

    draw() {
        noStroke()
        fill(240, 80, 80)
        rect(this.x, this.y, this.width, this.height)
    }
}

class Ball {
    constructor(x, y, speed, diameter) {
        this.x = x
        this.y = y
        this.vX = speed
        this.vY = speed
        this.diameter = diameter
    }

    move() {
        if (this.x <= this.diameter / 2 || this.x >= width - 0.5 * this.diameter) {
            this.vX *= -1
        }
        this.x += this.vX
        this.y += this.vY

        socket.emit('ballMoved', {
            x: this.x,
            y: this.y,
            vX: this.vX * -1,
            vY: this.vY * -1
        });
    }

    draw() {
        noStroke()
        fill(90, 80, 80)
        ellipse(this.x, this.y, this.diameter)
    }

    update(data) {
        this.x = data.x
        this.y = data.y
        this.vX = data.vX
        this.vY *= data.vY
    }

    handleCollision(bar) {
        let hit = collideRectCircle(
            bar.x, bar.y, bar.width, bar.height, 
            this.x, this.y, this.diameter)
        if (hit) {
            this.vY *= -1
        }
    }
}

function setup() {
    createCanvas(width, height);
    colorMode(HSB, 360, 100, 100)

    frameRate(18)

    player = new Player(width / 2, height * 0.9, 3, width / 8, height / 20)

    ball = new Ball(width / 2, height / 2, 3 * pConstant, 20)

    opponent = {
        x: width - (player.x + player.width),
        y: height - player.y,
        width: player.width,
        height: player.height,
        color: 0
    }
}

function draw() {
    background(0, 0, 90)

    listenToServer();

    player.move()
    player.draw()

    ball.move()
    ball.draw()
    ball.handleCollision(player)

    drawEnemy();
}

/** listenToServer listens for events broadcasted by the server */
function listenToServer() {
    // Handling enemy movement
    socket.on('enemyMoved', (data) => {
        opponent = {
            x: data.x, 
            y: data.y, 
            width: data.width, 
            height: data.height,
            color: opponent.color
        }
    });

    socket.on('processedID', (playerID) => {
        console.log(playerID)
        if (playerID == 1) {
            ball.update({
                x: ball.x,
                y: ball.y,
                vX: ball.vX *-1,
                vY: ball.vY *-1
            })
        }
    })
}

function drawEnemy() {
    noStroke()
    fill(opponent.color, 80, 80)
    rect(opponent.x, opponent.y, opponent.width, opponent.height)
}
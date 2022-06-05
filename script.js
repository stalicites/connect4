const startGame = document.getElementById("start-game");
const canvas = document.getElementById("game");
const display = canvas.getContext("2d");

let radios = document.getElementsByName("game-mode");
let gameMode = "";
let boardPosition = "";

function rect(x, y, width, height, color) {
    display.fillStyle = color;
    display.fillRect(x, y, width, height);
}

function circle(x, y, color) {
    display.beginPath();
    display.fillStyle = color;
    display.arc(x, y, 30, 0, 2 * Math.PI);
    display.fill();
}

function text(t, x, y) {
    display.fillStyle = "black";
    display.font = "20px Montserrat";
    display.fillText(t, x, y);
}

const winningArrays = [[0, 1, 2, 3],[41, 40, 39, 38],[7, 8, 9, 10],[34, 33, 32, 31],[14, 15, 16, 17],[27, 26, 25, 24],[21, 22, 23, 24],[20, 19, 18, 17],[28, 29, 30, 31],[13, 12, 11, 10],[35, 36, 37, 38],[6, 5, 4, 3],[0, 7, 14, 21],[41, 34, 27, 20],[1, 8, 15, 22],[40, 33, 26, 19],[2, 9, 16, 23],[39, 32, 25, 18],[3, 10, 17, 24],[38, 31, 24, 17],[4, 11, 18, 25],[37, 30, 23, 16],[5, 12, 19, 26],[36, 29, 22, 15],[6, 13, 20, 27],[35, 28, 21, 14],[0, 8, 16, 24],[41, 33, 25, 17],[7, 15, 23, 31],[34, 26, 18, 10],[14, 22, 30, 38],[27, 19, 11, 3],[35, 29, 23, 17],[6, 12, 18, 24],[28, 22, 16, 10],[13, 19, 25, 31],[21, 15, 9, 3],[20, 26, 32, 38],[36, 30, 24, 18],[5, 11, 17, 23],[37, 31, 25, 19],[4, 10, 16, 22],[2, 10, 18, 26],[39, 31, 23, 15],[1, 9, 17, 25],[40, 32, 24, 16],[9, 17, 25, 33],[8, 16, 24, 32],[11, 17, 23, 29],[12, 18, 24, 30],[1, 2, 3, 4],[5, 4, 3, 2],[8, 9, 10, 11],[12, 11, 10, 9],[15, 16, 17, 18],[19, 18, 17, 16],[22, 23, 24, 25],[26, 25, 24, 23],[29, 30, 31, 32],[33, 32, 31, 30],[36, 37, 38, 39],[40, 39, 38, 37],[7, 14, 21, 28],[8, 15, 22, 29],[9, 16, 23, 30],[10, 17, 24, 31],[11, 18, 25, 32],[12, 19, 26, 33],[13, 20, 27, 34],]

function sub1(position) {
    let newPos = "";
    for (let i = 0; i < position.length; i++) {
        let c = parseInt(position[i]);
        c--;
        newPos += (c);
    }
    return newPos;
}

function getId(id) {
    return {row: Math.floor(id/7), col: id % 7};
}

function plus1(position) {
    let newPos = "";
    for (let i = 0; i < position.length; i++) {
        let c = parseInt(position[i]);
        c++;
        newPos += (c);
    }
    return newPos;
}

function positionToBoard(position) {
    let board = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0]
    ]
    for (let i = 0; i < position.length; i++) {
        let columnMap = [];
        board.forEach((row) => {
            columnMap.push(row[parseInt(position[i])]);
        })
        //console.log(columnMap);
        let farthestDown = 0;
        for (let i = 0; i < columnMap.length; i++) {
            if (columnMap[i] == 0) {
                farthestDown++;
            }
        }
        console.log(`Stats: `, farthestDown, parseInt(position[i]), i);
        board[farthestDown - 1][parseInt(position[i])] = (i % 2) + 1;
    }
    return board;  
}

function checkWin(position) {
    let board = positionToBoard(position);
    for (let i = 0; i < winningArrays.length; i++) {
        let vals = [];
        for (let j = 0; j < winningArrays[i].length; j++) {
            vals.push(getId(winningArrays[i][j]));
        }
        if (board[vals[0].row][vals[0].col] == board[vals[1].row][vals[1].col] && board[vals[0].row][vals[0].col] == board[vals[2].row][vals[2].col] && board[vals[0].row][vals[0].col] == board[vals[3].row][vals[3].col]) {
            if (board[vals[0].row][vals[0].col] != 0) { 
                if (board[vals[0].row][vals[0].col] == 1) {
                    return true;
                } else {
                    return true;
                }
            } 
        }
    }
    return false;
}

let colors = ["#ffffff", "#fc5b5b", "#effc5b"]
let backgroundColor = "rgb(93, 152, 255)";

let uiLoaded = false;
const socket = io.connect("https://connect4-game-server.herokuapp.com/");
let id = "Pending...";
let currentColumn = 0;
let tokenColor = colors[1];
let twoPlayerWon = false;

const boardThemes = {
    "Red & Yellow": ["#ffffff", "#fc5b5b", "#effc5b"],
    "Orange & Green": ["#ffffff", "#f59342", "#42f57e"],
    "Black & Purple": ["#ffffff", "#000000", "#b71cd6"],
}

let boardThemesBaseNames = [
    ["Yellow", "Red"],
    ["Green", "Orange"],
    ["Purple", "Black"],
]

let boardThemeIndex = 0;

let botGoing = false;

socket.on("connect", () => {
    id = socket.id;  
})

let roomVar = {
    winner: "",
};

let colorTokenIndex = 1;

let ry = true;

let botEndpoint = "https://connect4.gamesolver.org/solve?pos=";

let aiGameWon = false;

let query = window.location.search;
const params = new URLSearchParams(query);
const code = params.get("code");

if (code != null) {
    socket.emit("join-room", code);
    const panel = document.getElementById("nav-bar");
    panel.style.display = "none";
    document.body.style.backgroundColor = "white";
    tokenColor = colors[2];
    colorTokenIndex = 2;
    uiLoaded = true;
    const buttons = document.getElementsByTagName('button');
    for (button in buttons) {
        buttons[button].className = "unsadden"
    }
    ry = false;
    gameMode = "online";
    drawBoard(boardPosition);
}

function getCount(position) {  
    let responseObject = {"0": 0,"1": 0,"2": 0,"3": 0,"4": 0,"5": 0,"6": 0,};
    for (let i = 0; i < position.length; i++) {
        responseObject[position[i]]++;
    }
    return responseObject;
}

socket.on("update-board", (room) => {
    if (room == "Room ended!") {
        alert("The match was destroyed because the host disconnected :(");
    } else {
        console.log("Board updated");
        roomVar = room;
        boardPosition = room.position;
        drawBoard(boardPosition);
    }
})

document.getElementById("resign").onclick = function() {
    if (uiLoaded) {
        document.getElementById("resign-panel").style.display = "block";
    } else {
        console.log("User tried to interact with the UI before they went through the mode selection!");
    }
}

document.getElementById("yes").onclick = function() {
    if (gameMode == "online") {
        socket.emit("resign");
    } else if (gameMode == "single" && !aiGameWon) {
        aiGameWon = true;
        drawBoard(boardPosition)
    }
    document.getElementById("resign-panel").style.display = "none";
}

document.getElementById("no").onclick = function() {
    document.getElementById("resign-panel").style.display = "none";
}

socket.on("room-join-error", (name) => {
    //alert(`You could not join room "${name}".`);
    rect(0, 0, canvas.width, canvas.height, "white");
    display.textAlign = "center";
    text(`The invite code "${name}" doesn't exist! Sorry :(`, canvas.width/2, canvas.height / 2);
    uiLoaded = false;
})

startGame.onclick = () => {
    const panel = document.getElementById("nav-bar");
    panel.style.display = "none";
    document.body.style.backgroundColor = "white";
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            gameMode = radios[i].value;
            break;
        }
    }
    socket.emit("mode-change", gameMode);
    if (gameMode == "online") {
        socket.emit("create-room");
        let delayInterval = setInterval(() => {
            const buttons = document.getElementsByTagName('button');
            for (button in buttons) {
                buttons[button].className = "sadden"
            }
            document.getElementById("nav-bar").innerHTML = `
            <div id = "room-create-panel">  
                <h1 style="padding: 0; margin: 0;">Join link</h1>
                <div style = "display: flex; flex-direction: row;">
                    <input readonly value="${window.location.href}?code=${id}" style="width: 350px;" id = "code">
                    <button id = "copy-button" style = "margin: 0; padding: 0; margin-left: 5px; height: 22px;" class="unsadden">Copy</button>
                </div>
                <button id = "dismiss" class = "unsadden">Dismiss</button>
            </div>`
            backgroundColor = "rgb(67, 107, 176)"
            document.getElementById("nav-bar").className = "create-panel";
            document.body.style.backgroundColor = "rgb(138, 138, 138)";
            document.getElementById("nav-bar").style.display = "block";
            document.getElementById("nav-bar").style.width = "450px";
            document.getElementById("nav-bar").style.height = "100px";
            colors[0] = "rgb(138, 138, 138)";
            drawBoard(boardPosition)
            document.getElementById("copy-button").onclick = function() {
                document.getElementById("code").select();
                document.getElementById("code").setSelectionRange(0, 99999);
                navigator.clipboard.writeText(document.getElementById("code").value);
            }
            document.getElementById("dismiss").onclick = function() {
                document.getElementById("nav-bar").style.display = "none";
                document.body.style.backgroundColor = "white";
                colors[0] = "#ffffff";
                for (button in buttons) {
                    buttons[button].className = "unsadden"
                }
                backgroundColor = "rgb(93, 152, 255)";
                uiLoaded = true;
                drawBoard(boardPosition);
            }
            clearInterval(delayInterval);
        }, 750);
    }
    if (gameMode == "single" || gameMode == "two-player") {
        uiLoaded = true;
    }
    drawBoard(boardPosition)
    const buttons = document.getElementsByTagName('button');
    for (button in buttons) {
        buttons[button].className = "unsadden"
    }
    console.log(`Game mode -> ${gameMode}`);
}

function getCol(board, col) {
    let c = [];
    for (let i = 0; i < board.length; i++) {
        c.push(board[i][col]);
    }
    return c;
}

function drawBoard(position) {
    let board = positionToBoard(position);
    display.clearRect(0, 0, canvas.width, canvas.height);
    rect(0, 0, canvas.width, canvas.height, backgroundColor);
    rect(0, 0, canvas.width, 120, colors[0]);
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            circle(j * 90 + 80, i * 80 + 175, colors[board[i][j]]);
        }
    }
    circle(currentColumn * 90 + 80, 70, tokenColor);
    if (gameMode == "online") {
        if (roomVar.winner != "") {
            if (roomVar.winner[1] == "r") {
                text(`${boardThemesBaseNames[boardThemeIndex][roomVar.winner[0]]} won by resignation!`, 10, 30);
            }
            if (roomVar.winner[1] == "4") {
                text(`${boardThemesBaseNames[boardThemeIndex][roomVar.winner[0]]} won 4 in a row!`, 10, 30);
            }
        }
        if (roomVar.playerCount == 1 && roomVar.winner == "") {
            text("Waiting for an opponent...", 10, 30);
        } else if ((roomVar.playerCount == 2 && position.length % 2 % 2 == 0 && ry == false) || (roomVar.playerCount == 2 && position.length % 2 % 2 == 1 && ry == true)) {
            if (roomVar.winner == "") {
                text("Opponent's turn", 10, 30);
            }
        } else if ((roomVar.playerCount == 2 && position.length % 2 % 2 == 0 && ry) || (roomVar.playerCount == 2 && position.length % 2 % 2 == 1 && !ry)) {
            if (roomVar.winner == "") {
                text("Your turn", 10, 30);
            }
        }
    }
    if (gameMode == "single") {
        let res = checkWin(position);
        aiGameWon = res;
        if ((res && position.length % 2 == 1)) {
            text("You won!", 10, 30);
        } else if (res && position.length % 2 == 0 || aiGameWon) {
            text("You lost!", 10, 30);
        }
        if (botGoing == true && !aiGameWon) {
            text("Thinking...", 10, 30);
        } else if (botGoing == false && !aiGameWon) {
            text("It\'s your turn!", 10, 30);
        }
    }
    if (gameMode == "two-player") {
        let res = checkWin(position);
        twoPlayerWon = res;
        if ((res && position.length % 2 == 1)) {
            text(`${boardThemesBaseNames[boardThemeIndex][1]} won!`, 10, 30);
        }
        if ((res && position.length % 2 == 0)) {
            text(`${boardThemesBaseNames[boardThemeIndex][0]} won!`, 10, 30);
        }
        if (position.length % 2 == 1 && !res) {
            text(`${boardThemesBaseNames[boardThemeIndex][0]}'s turn!`, 10, 30);
        }
        if (position.length % 2 == 0 && !res) {
            text(`${boardThemesBaseNames[boardThemeIndex][1]}'s turn!`, 10, 30);
        }
    }
}

function randomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function parseResponse(obj) { 
    let keys = Object.keys(obj.score);
    let values = Object.values(obj.score);

    let squeezed = [];

    for (let i = 0; i < values.length; i++) {
        if (values[i] != 100) {
            squeezed.push({
                "key": keys[i],
                "value": values[i]
            });
        }
    }

    squeezed.sort(function (a, b) {
        return b.value - a.value;  
    });

    let optimal = [];
    for (let i = 0; i < squeezed.length; i++) {
        if (squeezed[i].value == squeezed[0].value) {
            optimal.push(squeezed[i]);
        }
    }
    console.log("Moves: (Optimal, Squeezed)", optimal, squeezed);

    if (optimal.length > 1) {
        let random = randomNumber(0, optimal.length - 1);
        return optimal[random].key;
    } else {
        return optimal[0].key;
    }
}

document.onkeyup = function(e) {
    if (uiLoaded) {
        if (e.keyCode == 37) {
            currentColumn--;
            if (currentColumn < 0) {
                currentColumn = 0;
            }
        } else if (e.keyCode == 39) {
            currentColumn++;
            if (currentColumn > 6) {
                currentColumn = 6;
            }
        } else if (e.keyCode == 32) {
            if (gameMode == "online") {
                socket.emit("drop", currentColumn);
            } else if (gameMode == "single" && !aiGameWon && !botGoing) {
                let currentState = getCount(boardPosition);
                if (parseInt(currentState[currentColumn]) < 6) {
                    console.log(`Current state of the board is: `, currentState);
                    console.log(`Current column is: `, currentState[currentColumn]);
                    boardPosition += currentColumn;
                    drawBoard(boardPosition);
                } else {
                    console.log("Column is full!");
                    return;
                }
                botGoing = true;  
                let req = new XMLHttpRequest();
                req.open("GET", `${botEndpoint}${plus1(boardPosition)}`);
                req.send();
                req.onload = function() {
                    let response = JSON.parse(req.response);
                    response = parseResponse(response)
                    let randomWaitTime = randomNumber(100, 2000);
                    let botWait = setTimeout(function() {
                        boardPosition += response; 
                        botGoing = false;
                        drawBoard(boardPosition);
                        clearInterval(botWait);
                    }, randomWaitTime);
                }
            } else if (gameMode == "two-player" && !twoPlayerWon) {
                let currentState = getCount(boardPosition);
                if (parseInt(currentState[currentColumn]) < 6) {
                    console.log(`Current state of the board is: `, currentState);
                    console.log(`Current column is: `, currentState[currentColumn]);
                    boardPosition += currentColumn;
                    tokenColor = colors[(boardPosition.length % 2) + 1];
                    drawBoard(boardPosition);
                } else {
                    console.log("Column is full!");
                    return;
                }
            }
        }
        drawBoard(boardPosition);
    }
}

document.getElementById("change-mode").onclick = function() {
    if (uiLoaded) {
        window.location = "."
    }
}

document.getElementById("theme-change").onclick = () => {
    if (uiLoaded) {
        let boardThemeList = Object.values(boardThemes)
        boardThemeIndex++;
        boardThemeIndex = boardThemeIndex % boardThemeList.length;
        colors = boardThemeList[boardThemeIndex];
        tokenColor = colors[colorTokenIndex];
        console.log("Theme change!", boardThemeList[boardThemeIndex]);
        drawBoard(boardPosition);
    }
}

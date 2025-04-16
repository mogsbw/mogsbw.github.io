import { PRESCRIPTIONS } from "./prescriptions.js";

const NUM_GUESSES = 6;

const FORMAT_INDICES = [2, 4, 5, 7, 9];
const SIGNS = ["–", "+"];
const STEPS = ["00", "25", "50", "75"];
const FIRST_AXIS = ["0", "1"];
const YELLOW = "rgb(220, 200, 90)";
const GREEN = "rgb(80, 180, 100)";
let remainingGuesses = NUM_GUESSES;
let currentGuess = [];
let nextNum = 0;
let rightGuessString = PRESCRIPTIONS[Math.floor(Math.random()*PRESCRIPTIONS.length)];
console.log(rightGuessString);

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUM_GUESSES; i++) {
        let row = document.createElement("div");
        row.className = "rx-row";

        for (let j = 0; j < 13; j++) {
            if (j == 0) {
                let signBox = document.createElement("div");
                signBox.className = "single-box"; // plus or minus
                row.appendChild(signBox);
            } else if (j == 3 || j == 8) {
                let doubleBox = document.createElement("div");
                doubleBox.className = "double-box"; // 0.25 steps
                row.appendChild(doubleBox);
            } else if (FORMAT_INDICES.includes(j)){
                let formatBox = document.createElement("div");
                formatBox.className = "format-box"; // formatting boxes
                row.appendChild(formatBox);
                if (j == 2 || j == 7) {
                    formatBox.id = "dot-box";
                    formatBox.textContent = ".";
                } else if (j == 4) {
                    formatBox.id = "slash-box"
                    formatBox.textContent = "/";
                } else if (j == 5) {
                    formatBox.textContent = "–";
                } else if (j == 9) {
                    formatBox.textContent = "x";
                }
            } else {
                let singleBox = document.createElement("div"); 
                singleBox.className = "single-box";
                row.appendChild(singleBox);
            }
            
        }

        board.appendChild(row);
    }
}

initBoard();

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target

    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent;

    if (remainingGuesses === 0) {
        return;
    }

    if (key === "Del" && nextNum !== 0) {
        deleteNum();
        return;
    }

    if (key === "Enter") {
        checkGuess();
        return;
    }

    // console.log(key.match(/[0-9+\-]/g))
    if (STEPS.includes(key) || key.match(/[0-9+\–]/g)) {
        insertNum(key);
    }

})

function insertNum (pressedKey) {

    let row = document.getElementsByClassName("rx-row")[6 - remainingGuesses];

    // stop input when all boxes filled
    if (nextNum === 13) {
        return;
    }

    // stop non-sign input in first box and sign input in other boxes
    if (nextNum == 0 && !SIGNS.includes(pressedKey)) {
        return;
    } else if (nextNum != 0 && SIGNS.includes(pressedKey)) {
        return;
    }

    // stop single number inputs to double boxes
    if ((nextNum == 3 || nextNum == 8) && !STEPS.includes(pressedKey)) {
        return;
    }

    // stop double number inputs to single boxes
    if ((nextNum == 1 || nextNum == 6 || nextNum == 10 || nextNum == 11 || nextNum == 12) && STEPS.includes(pressedKey)) {
        return;
    }

    // stop > 1 inputs to first axis box
    if ((nextNum == 10) && !FIRST_AXIS.includes(pressedKey)) {
        return;
    }

    // stop axis inputs larger than 180
    if ((nextNum == 11) && row.children[nextNum-1].textContent == 1 && pressedKey > 8) {
        return;
    }
    if ((nextNum == 12) && row.children[nextNum-2].textContent == 1 && row.children[nextNum-1].textContent == 8 && pressedKey > 0) {
        return;
    }

    let box = row.children[nextNum];
    box.textContent = pressedKey;
    box.classList.add("filled-box");
    currentGuess.push(pressedKey);
    nextNum += 1;
    skipForward();
}

function deleteNum () {
    skipBackward();
    let row = document.getElementsByClassName("rx-row")[6 - remainingGuesses];
    let box = row.children[nextNum - 1];
    box.textContent = "";
    box.classList.remove("filled-box");
    currentGuess.pop();
    nextNum -= 1;
    
}

// skip over formatting boxes on insertion
function skipForward () {
    if (FORMAT_INDICES.includes(nextNum)) {
        nextNum += 1;
        skipForward();
    } else {
        return
    }
}

// skip over formatting boxes on deletion
function skipBackward () {
    if (FORMAT_INDICES.includes(nextNum - 1)) {
        nextNum -= 1;
        skipBackward();
    } else {
        return
    }
}

function checkGuess () {
    let row = document.getElementsByClassName("rx-row")[6 - remainingGuesses];
    let guessString = '';
    let rightGuess = Array.from(rightGuessString);
    let guessIndex = 0;
    const currYellow = {};

    for (const val of currentGuess) {
        guessString += val;
    }

    if (guessString.length != 10) {
        const notEnoughOverlay = document.getElementById("not-enough-overlay");
        notEnoughOverlay.style.display = "block";
        document.getElementById("close-not-enough").addEventListener("click", closeNotEnough);
        return;
    }


    for (let i = 0; i < 13; i++) {
    
        if (!FORMAT_INDICES.includes(i)) {
            let numColour = "";
            let box = row.children[i];
            let num = currentGuess[guessIndex];
            let guessFreq = 0;
            let rightFreq = 0;

            let numPosition = rightGuess.indexOf(currentGuess[guessIndex]);
            // console.log(i, numPosition, currentGuess);
            // console.log(currentGuess[guessIndex], rightGuess[guessIndex]);

            for (let c = 0; c < 8; c++) {
                if (currentGuess[c] === num) {
                    guessFreq++;
                }
                if (rightGuess[c] === num) {
                    rightFreq++;
                }
            }
            // console.log(rightGuess)
            //console.log(guessFreq, rightFreq);
            if (numPosition === -1) {
                numColour = "grey";
                rightGuess[numPosition] = "#";
            } else {
                if (currentGuess[guessIndex] === rightGuessString[guessIndex]) {
                    numColour = GREEN;
                    rightGuess[numPosition] = "#";
                } else {
                    if (currentGuess[numPosition] === rightGuess[numPosition] && guessFreq > rightFreq) {
                        numColour = "grey";
                    } else {
                        numColour = YELLOW;
                        rightGuess[numPosition] = "#";
                        currYellow[num] = 1; // flag that there are still yellows remaining
                    }
                }  
            }
            // console.log(currYellow);
            let delay = 250 * guessIndex;
            setTimeout(()=> {
                box.style.backgroundColor = numColour;
                box.style.color = "#ffffff";
                shadeKeyBoard(num, numColour, currYellow[num]);
            }, delay)
            currentGuess[guessIndex] = "#" // current guess letter has been accounted
            guessIndex++;
        }
        
    }
    // console.log(guessString, rightGuessString);
    setTimeout(afterCheck, 2200, guessString);
}

function shadeKeyBoard(num, colour, remaining) {
    // console.log(remaining);
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === num) {
            let oldColour = elem.style.backgroundColor;
            if (oldColour === GREEN) { // if keyboard already green
                if (colour === YELLOW) { // change if subsequent guess is yellow
                    elem.style.backgroundColor = colour; 
                } else { // no change if already green or from green to grey
                    return; 
                }
            } else if (oldColour === YELLOW) { // if keyboard already yellow
                if (colour === GREEN && remaining != 1) { // change to green if no more yellows
                    elem.style.backgroundColor = colour;
                }
                if (colour === "grey") { // no change from yellow to grey
                    return;
                }
            } else {
                elem.style.backgroundColor = colour;
            }
            break;
        }
    }
}

function afterCheck(guess) {
    if (guess === rightGuessString.join("")) {
        const winScreenOverlay = document.getElementById("win-screen-overlay");
        winScreenOverlay.style.display = "block";
        remainingGuesses = 0
        return
    } else {
        remainingGuesses -= 1;
        currentGuess = [];
        nextNum = 0;
        if (remainingGuesses === 0) {
            const loseScreenOverlay = document.getElementById("lose-screen-overlay");
            loseScreenOverlay.style.display = "block";
        }
    }
}

document.getElementById("close-help").addEventListener("click", closeHelp);

function closeHelp() {
    const helpPopOverlay = document.getElementById("help-pop-overlay");
    helpPopOverlay.style.display = "none";
    const helpButton = document.getElementById("help-button");
    helpButton.style.display = "block";
}

document.getElementById("help-button").addEventListener("click", openHelp);

function openHelp() {
    const helpPopOverlay = document.getElementById("help-pop-overlay");
    helpPopOverlay.style.display = "block";
    const helpButton = document.getElementById("help-button");
    helpButton.style.display = "none";
}


function closeNotEnough() {
    const notEnoughOverlay = document.getElementById("not-enough-overlay");
    notEnoughOverlay.style.display = "none";
}
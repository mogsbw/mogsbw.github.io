import { PRESCRIPTIONS } from "./prescriptions.js";

const NUM_GUESSES = 6;

const FORMAT_INDICES = [2, 4, 5, 7, 9];
const SIGNS = ["-", "+"];
const STEPS = ["00", "25", "50", "75"];
const FIRST_AXIS = ["0", "1"];
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
                    formatBox.className = "dot-box";
                    formatBox.textContent = ".";
                } else if (j == 4) {
                    formatBox.textContent = "/";
                } else if (j == 5) {
                    formatBox.textContent = "-";
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

    if (key === "Del") {
        key = "Backspace";
    }

    if (remainingGuesses === 0) {
        return;
    }

    if (key === "Backspace" && nextNum !== 0) {
        deleteNum();
        return;
    }

    if (key === "Enter") {
        checkGuess();
        return;
    }

    // console.log(key.match(/[0-9+\-]/g))
    if (STEPS.includes(key) || key.match(/[0-9+\-]/g)) {
        insertNum(key);
    }

    //document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

function insertNum (pressedKey) {

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

    let row = document.getElementsByClassName("rx-row")[6 - remainingGuesses];
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

    for (const val of currentGuess) {
        guessString += val;
    }

    if (guessString.length != 10) {
        alert("Not enough numbers!");
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
                if (rightGuessString[c] === num) {
                    rightFreq++;
                }
            }

            if (numPosition === -1) {
                numColour = "grey";
                rightGuess[numPosition] = "#";
            } else {
                if (currentGuess[guessIndex] === rightGuessString[guessIndex]) {
                    numColour = "#50b464" // green
                    rightGuess[numPosition] = "#";
                } else {
                    if (currentGuess[numPosition] === rightGuess[numPosition] && guessFreq > rightFreq) {
                        numColour = "grey";
                    } else {
                        numColour = "#dcc85a" // yellow
                        rightGuess[numPosition] = "#";
                    }
                }
                   
            }
            let delay = 250 * guessIndex;
            setTimeout(()=> {
                box.style.backgroundColor = numColour;
                box.style.color = "#ffffff";
                shadeKeyBoard(num, numColour);
            }, delay)
            currentGuess[guessIndex] = "#" // current guess letter has been accounted
            guessIndex++;
        }
        
    }
    console.log(guessString, rightGuessString);
    setTimeout(afterCheck, 2250, guessString);
}

function count(val) {
    
}

function shadeKeyBoard(num, colour) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === num) {
            let oldColour = elem.style.backgroundColor
            if (oldColour === '#50b464') {
                return;
            } 
            if (oldColour === '#dcc85a' && colour !== '#50b464') {
                return;
            }
            elem.style.backgroundColor = colour;
            break;
        }
    }
}

function afterCheck(guess) {
    if (guess === rightGuessString.join("")) {
        alert("You guessed right! Game over!");
        remainingGuesses = 0
        return
    } else {
        remainingGuesses -= 1;
        currentGuess = [];
        nextNum = 0;
        if (remainingGuesses === 0) {
            alert("You've run out of guesses! Game over!")
            alert(`The right prescription was: "${rightGuessString}"`)
        }
    }
}
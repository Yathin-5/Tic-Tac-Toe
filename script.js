const boardEl = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusPanel = document.getElementById('statusPanel');
const gameModeSelect = document.getElementById('gameMode');
const difficultySelect = document.getElementById('difficulty');
const difficultyGroup = document.getElementById('difficultyGroup');
const resetBtn = document.getElementById('resetBtn');

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; // Human is always X
let isGameActive = true;

const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Handle Mode UI Visibility
gameModeSelect.addEventListener('change', () => {
    if (gameModeSelect.value === 'human') {
        difficultyGroup.style.display = 'none';
    } else {
        difficultyGroup.style.display = 'flex';
    }
    resetGame();
});

difficultySelect.addEventListener('change', resetGame);
resetBtn.addEventListener('click', resetGame);
cells.forEach(cell => cell.addEventListener('click', handleCellClick));

function handleCellClick(e) {
    const clickedCellIndex = parseInt(e.target.getAttribute('data-index'));

    if (board[clickedCellIndex] !== "" || !isGameActive || (gameModeSelect.value === 'bot' && currentPlayer === "O")) {
        return;
    }

    makeMove(clickedCellIndex, currentPlayer);
    
    if (checkResult()) return;

    if (gameModeSelect.value === 'bot') {
        currentPlayer = "O";
        statusPanel.textContent = "Bot is thinking...";
        setTimeout(botMove, 400); // Small delay to feel natural
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusPanel.textContent = `${currentPlayer}'s turn`;
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
}

function checkResult() {
    let roundWon = false;
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusPanel.textContent = `${currentPlayer} Wins!`;
        isGameActive = false;
        return true;
    }

    if (!board.includes("")) {
        statusPanel.textContent = "It's a Tie!";
        isGameActive = false;
        return true;
    }

    return false;
}

// --- BOT DECISION MAKING ---

function botMove() {
    if (!isGameActive) return;

    const difficulty = difficultySelect.value;
    let moveIndex;

    if (difficulty === 'easy') {
        moveIndex = getRandomMove();
    } else if (difficulty === 'medium') {
        moveIndex = getMediumMove();
    } else {
        moveIndex = getBestMove(); // Hard (Minimax)
    }

    makeMove(moveIndex, "O");
    
    if (checkResult()) return;

    currentPlayer = "X";
    statusPanel.textContent = "Your turn (X)";
}

function getAvailableMoves() {
    return board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
}

function getRandomMove() {
    const available = getAvailableMoves();
    return available[Math.floor(Math.random() * available.length)];
}

function getMediumMove() {
    const available = getAvailableMoves();

    // 1. Can bot win in this move?
    for (let move of available) {
        board[move] = "O";
        if (checkSimulatedWin("O")) { board[move] = ""; return move; }
        board[move] = "";
    }

    // 2. Can human win in their next move? Block them.
    for (let move of available) {
        board[move] = "X";
        if (checkSimulatedWin("X")) { board[move] = ""; return move; }
        board[move] = "";
    }

    // 3. Otherwise, pick a random available spot
    return getRandomMove();
}

function checkSimulatedWin(player) {
    return winConditions.some(cond => board[cond[0]] === player && board[cond[1]] === player && board[cond[2]] === player);
}

// --- MINIMAX CORE (HARD MODE) ---

function getBestMove() {
    let bestScore = -Infinity;
    let move;
    const available = getAvailableMoves();

    for (let i = 0; i < available.length; i++) {
        let currentMove = available[i];
        board[currentMove] = "O";
        let score = minimax(board, 0, false);
        board[currentMove] = "";
        if (score > bestScore) {
            bestScore = score;
            move = currentMove;
        }
    }
    return move;
}

function minimax(tempBoard, depth, isMaximizing) {
    if (checkSimulatedWin("O")) return 10 - depth;
    if (checkSimulatedWin("X")) return depth - 10;
    if (!tempBoard.includes("")) return 0;

    const available = getAvailableMoves();

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let move of available) {
            tempBoard[move] = "O";
            let score = minimax(tempBoard, depth + 1, false);
            tempBoard[move] = "";
            bestScore = Math.max(score, bestScore);
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let move of available) {
            tempBoard[move] = "X";
            let score = minimax(tempBoard, depth + 1, true);
            tempBoard[move] = "";
            bestScore = Math.min(score, bestScore);
        }
        return bestScore;
    }
}

function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    statusPanel.textContent = "Your turn (X)";
    cells.forEach(cell => {
        cell.textContent = "";
        cell.className = "cell";
    });
}

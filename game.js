import { Chess } from '/node_modules/chess.js/dist/esm/chess.js';

let players = ['player1', 'player2', 'player3', 'player4'];  // 4 players loop for turns.

let board1 = Chessboard('board1', {
  draggable: true,
  dropOffBoard: 'snapback',
  sparePieces: false,
  onDrop: handleMove,
  showNotation: false,
  appearSpeed: 2500
});

let board2 = Chessboard('board2', {
  draggable: false,
  dropOffBoard: 'snapback',
  sparePieces: false,
  onDrop: handleMove,
  showNotation: false,
  appearSpeed: 2500
});

let game = new Chess();
let game2 = new Chess();
let activeGame = game;

board1.position(game.fen());
board2.position(game2.fen());

let currentPlayer = 0;

// Object to keep track of captured pieces
let capturedPieces = {
  white: {},
  black: {}
};

displayCapturedPieces();

function handleMove(source, target) {
  try {
    const move = activeGame.move({
      from: source,
      to: target,
      promotion: 'q'
    });

    if (move === null) return 'snapback';

    // If a piece was captured
    if (move.captured) {
      let capturedPiece = (move.color === 'w' ? 'b' : 'w') + move.captured.toUpperCase();
      updateCapturedPieces(capturedPiece);
    }

    if (activeGame === game) {
      board1.position(game.fen(), false);
    } else {
      board2.position(game2.fen(), false);
    }

    updateStatus();
  } catch (error) {
    console.log('Invalid Move, returning snapback. ' + error);
    return 'snapback';
  }
}

function updateStatus() {
  const status = document.getElementById('status');
  const status2 = document.getElementById('status2');

  let color = game.turn() === 'b' ? 'White' : 'Black';
  let color2 = game2.turn() === 'b' ? 'White' : 'Black';

  currentPlayer = (currentPlayer + 1) % players.length;
  console.log(players[currentPlayer] + " num: " + currentPlayer);

  if (players[currentPlayer] === "player3" || players[currentPlayer] === "player4") {
    activeGame = game2;
    reinitializeBoards(true);
  } else {
    activeGame = game;
    reinitializeBoards(false);
  }

  status.innerHTML = "Move Number: " + game.history().length + " Turn: " + color + ", Whose Turn: " + players[currentPlayer];
  status2.innerHTML = "Move Number: " + game2.history().length + " Turn: " + color2 + ", Whose Turn: " + players[currentPlayer];
}

document.querySelector('#reset-button').addEventListener('click', () => {
  game.reset();
  game2.reset();
  board1.position(game.fen());
  board2.position(game2.fen());

  // Reset captured pieces
  capturedPieces = { white: {}, black: {} };
  displayCapturedPieces();
  updateStatus();
});

function reinitializeBoards(board2Draggable) {
  board1.destroy();
  board2.destroy();

  board1 = Chessboard('board1', {
    draggable: !board2Draggable,
    dropOffBoard: 'snapback',
    sparePieces: false,
    onDrop: handleMove,
    showNotation: false,
    appearSpeed: 2500
  });

  board2 = Chessboard('board2', {
    draggable: board2Draggable,
    dropOffBoard: 'snapback',
    sparePieces: false,
    onDrop: handleMove,
    showNotation: false,
    appearSpeed: 2500
  });

  board1.position(game.fen(), false);
  board2.position(game2.fen(), false);
}

// Function to update captured pieces
function updateCapturedPieces(piece) {
  let color = piece.startsWith('w') ? 'white' : 'black';

  if (!capturedPieces[color][piece]) {
    capturedPieces[color][piece] = 1;
  } else {
    capturedPieces[color][piece]++;
  }

  displayCapturedPieces();
}

// Function to display captured pieces
function displayCapturedPieces() {
  let capturedHTML = "<h3>Captured Pieces</h3>";
  capturedHTML += "<p><strong>White:</strong> " + formatCapturedPieces(capturedPieces.white) + "</p>";
  capturedHTML += "<p><strong>Black:</strong> " + formatCapturedPieces(capturedPieces.black) + "</p>";

  document.getElementById("capturedPieces").innerHTML = capturedHTML;
}

// Helper function to format captured pieces output with images and counts
function formatCapturedPieces(pieces) {
  let output = [];
  for (let piece in pieces) {
    // Map the shorthand piece name to the full name
    let fullPieceName = mapPieceName(piece);
    let imgSrc = `./img/chesspieces/wikipedia/${piece}.png`;  // Assuming the images are in the 'images' folder
    let count = pieces[piece];
    output.push(`<img src="${imgSrc}" alt="${piece}" style="width: 40px; height: 40px; vertical-align: middle;"> ${fullPieceName} x${count}`);
  }
  return output.length > 0 ? output.join(", ") : "None";
}

// Map shorthand piece names to full piece names
function mapPieceName(piece) {
  const pieceNames = {
    'wP': 'Pawn', 'bP': 'Pawn',
    'wN': 'Knight', 'bN': 'Knight',
    'wB': 'Bishop', 'bB': 'Bishop',
    'wR': 'Rook', 'bR': 'Rook',
    'wQ': 'Queen', 'bQ': 'Queen',
    'wK': 'King', 'bK': 'King'
  };
  return pieceNames[piece] || piece; // Fallback to piece code if not found
}


document.querySelector('#specialMove').addEventListener('click', openSpecialMoveModal);

// Open the modal and display captured pieces as images with count
// Open the modal and display captured pieces as images with count
function openSpecialMoveModal() {
  let modal = document.getElementById("specialMoveModal");
  let capturedPiecesList = document.getElementById("capturedPiecesList");
  capturedPiecesList.innerHTML = ""; // Clear previous selections

  let hasCaptured = false;

  for (let color in capturedPieces) {
      for (let piece in capturedPieces[color]) {
          if (capturedPieces[color][piece] > 0) {
              hasCaptured = true;

              // Create a button for each captured piece with an image
              let button = document.createElement("button");
              let imgSrc = `./img/chesspieces/wikipedia/${piece}.png`;  // Assuming the images are in the 'images' folder
              let fullPieceName = mapPieceName(piece); // Get the full piece name
              let count = capturedPieces[color][piece];
              
              // Make the image bigger and display the full name with count
              button.innerHTML = `<img src="${imgSrc}" alt="${piece}" style="width: 50px; height: 50px; vertical-align: middle;"> ${fullPieceName} x${count}`;
              button.setAttribute("data-piece", piece);
              button.setAttribute("data-color", color);
              button.onclick = selectCapturedPiece;
              
              capturedPiecesList.appendChild(button);
          }
      }
  }

  if (!hasCaptured) {
      capturedPiecesList.innerHTML = "<p>No captured pieces available.</p>";
  }

  modal.style.display = "block";
}


// Close modal on clicking 'X'
document.querySelector(".close").addEventListener("click", function () {
    document.getElementById("specialMoveModal").style.display = "none";
});

// Handles piece selection
function selectCapturedPiece(event) {
    let selectedPiece = event.target.getAttribute("data-piece");
    let color = event.target.getAttribute("data-color");

    document.getElementById("specialMoveModal").style.display = "none";
    promptForPlacement(selectedPiece, color);
}


function promptForPlacement(piece, color) {
  alert(`Click on a square where you want to place the ${piece}`);

  // Define the valid squares for each player
  let validSquares = [];
  if (color === 'white') {
    validSquares = ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'];
  } else {
    validSquares = ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7', 'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'];
  }

  // Listen for click on the active board
  document.querySelectorAll('.square-55d63').forEach(square => {
      square.addEventListener("click", function placePiece(event) {
          let targetSquare = event.target.dataset.square;

          // Check if the clicked square is valid for the current player
          if (!validSquares.includes(targetSquare)) {
              alert("Invalid square. You can only place pieces on your side of the board.");
              return;
          }

          // Change the color of the piece and place it on the board
          let newColor = color === 'white' ? 'w' : 'b';  // Change to the player's color
          let newPiece = newColor + piece[1].toLowerCase(); // e.g., "wP" for white pawn

          // Add the selected piece to the active board
          let move = activeGame.put({ type: piece[1], color: newColor }, targetSquare);
          if (move) {
              if (activeGame === game) {
                  board1.position(activeGame.fen(), false);
              } else {
                  board2.position(activeGame.fen(), false);
              }
              
              // Reduce captured piece count
              capturedPieces[color][piece]--;
              if (capturedPieces[color][piece] === 0) {
                  delete capturedPieces[color][piece];
              }

              displayCapturedPieces(); // Refresh captured pieces list

              // Remove event listener after placing piece
              document.querySelectorAll('.square-55d63').forEach(sq => {
                  sq.removeEventListener("click", placePiece);
              });
          } else {
              alert("Invalid placement, try again.");
          }
      }, { once: true }); // Ensures only one click is registered
  });
}

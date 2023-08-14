// Import ramda.js library
import R from './ramda.js';

// Import game instances and data
import Tetris from './Tetris.js';

// Import the points system of the game
import Score from './Score.js';

// Initialize the number of rows and columns in the game
const grid_columns = Tetris.field_width;
const grid_rows = Tetris.field_height;

// Create game instances
let game = Tetris.new_game();

// Set CSS variables to dynamically update the number of rows and columns in the page
document.documentElement.style.setProperty('--grid-rows', grid_rows);
document.documentElement.style.setProperty('--grid-columns', grid_columns);

// Get Game Panel
const grid = document.getElementById('grid');

// Pause identification
let flag = true;

// Dom elements in the scoreboard
const scoreboardDoms = {
  currentScore: document.querySelector('.currentScore'),
  clearedRows: document.querySelector('.clearedRows'),
  gameLevel: document.querySelector('.gameLevel'),
  maxScore: document.querySelector('.maxScore'),
  maxLevel: document.querySelector('.maxLevel'),
};

// Panel at the end of the game
const gameOverPanelDoms = {
  overlay: document.querySelector('.overlay'),
  gameOverLevel: document.querySelector('.gameOverLevel'),
  gameOverScore: document.querySelector('.gameOverScore'),
  gameOverLines: document.querySelector('.gameOverLines'),
  restartButton: document.querySelector('.restartButton'),
};

// Add pause/resume function
const fnBtn = document.querySelector('.fnBtn');
fnBtn.addEventListener('click', () => {
  flag = !flag;
  fnBtn.textContent = flag ? 'suspend' : 'continue';
});

// Update the corresponding Tetris to the panel
const cells = R.range(0, grid_rows).map(function () {
  const row = document.createElement('div');
  row.className = 'row';

  const rows = R.range(0, grid_columns).map(function () {
    const cell = document.createElement('div');
    cell.className = 'cell';

    row.append(cell);

    return cell;
  });

  grid.append(row);
  return rows;
});

// Update Grid
const update_grid = function () {
  // Pop up the end panel when the game ends
  if (game.game_over) {
    // Fill in score data
    gameOverPanelDoms.gameOverLevel.textContent = `Level: ${Score.level()}`;
    gameOverPanelDoms.gameOverScore.textContent = `Score: ${Score.score}`;
    gameOverPanelDoms.gameOverLines.textContent = `Lines Cleared: ${Score.lines_cleared}`;
    gameOverPanelDoms.overlay.style.display = 'flex';

    // Restart the game
    gameOverPanelDoms.restartButton.addEventListener('click', () => {
      gameOverPanelDoms.overlay.style.display = 'none';

      // Reset Game
      game = Tetris.new_game();

      // Reset Score
      Score.reset(Score);
    });
  }

  // First, display the mesh of the locked block
  game.field.forEach(function (line, line_index) {
    line.forEach(function (block, column_index) {
      const cell = cells[line_index][column_index];
      cell.className = `cell ${block}`;
    });
  });

  // Show Ghost Tetris
  const ghost_game = R.reduce(Tetris.soft_drop, game, R.range(0, 22));
  Tetris.tetromino_coordiates(ghost_game.current_tetromino, ghost_game.position).forEach(function (coord) {
    try {
      const cell = cells[coord[1]][coord[0]];
      cell.className = `cell ghost ${ghost_game.current_tetromino.block_type}`;
    } catch (ignore) {}
  });

  // Display currently declining Tetris
  Tetris.tetromino_coordiates(game.current_tetromino, game.position).forEach(function (coord) {
    try {
      const cell = cells[coord[1]][coord[0]];
      cell.className = `cell current ${game.current_tetromino.block_type}`;
    } catch (ignore) {}
  });

  // Update score, level, and number of cleared rows information
  update_scoreboard(Score);
};

/**
 * Update score, level, and number of cleared rows information
 * @param {Score} Score Scoring System Objects
 */
function update_scoreboard(Score) {
  // Obtain the highest score in history, if not, default to 0
  let maxScore = localStorage.getItem('maxScore') || 0;
  let maxLevel = localStorage.getItem('maxLevel') || 0;
  scoreboardDoms.currentScore.textContent = Score.score;
  scoreboardDoms.clearedRows.textContent = Score.lines_cleared;
  scoreboardDoms.gameLevel.textContent = Score.level();

  // Historical highest score
  if (Score.score > maxScore) {
    scoreboardDoms.maxScore.textContent = Score.score;
    localStorage.setItem('maxScore', Score.score);
  } else {
    scoreboardDoms.maxScore.textContent = maxScore;
  }

  // Historical highest level
  if (Score.level > maxLevel) {
    scoreboardDoms.maxLevel.textContent = Score.level();
    localStorage.setItem('maxLevel', Score.level());
  } else {
    scoreboardDoms.maxLevel.textContent = maxLevel;
  }
}

// Do not let the player hold down the rotation key.
let key_locked = false;

// Trigger when the user raises the keyboard
document.body.onkeyup = function () {
  key_locked = false;
};

// Triggered by the user pressing the keyboard, different functions are executed based on the different keys pressed
document.body.onkeydown = function (event) {
  if (!key_locked && event.key === 'ArrowUp') {
    key_locked = true;
    game = Tetris.rotate_ccw(game);
  }
  if (event.key === 'ArrowDown') {
    game = Tetris.soft_drop(game);
    localStorage.setItem('soft_drop', 1);
  }
  if (event.key === 'ArrowLeft') {
    game = Tetris.left(game);
  }
  if (event.key === 'ArrowRight') {
    game = Tetris.right(game);
  }
  if (event.key === ' ') {
    game = Tetris.hard_drop(game);
    localStorage.setItem('hard_drop', 2);
  }

  // Update Grid
  update_grid();
};

// Update Grid
const timer_function = function () {
  if (flag) {
    // Update game status
    game = Tetris.next_turn(game);
    // Update the display of the game area
    update_grid();
  }

  // Refresh every 500 milliseconds, where 500 milliseconds is the initial value and will be modified based on the game level. The specific formula is 2500/(level+4)
  setTimeout(timer_function, 2500 / (Score.level() + 4));
};

// Start the game for the first time. It has only been called once.
// Starting from here, call the timer above_ Function.
setTimeout(timer_function, 500);

// Update Grid
update_grid();

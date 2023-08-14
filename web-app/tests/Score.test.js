// Import game instances
import Tetris from '../Tetris.js';

// Import scoring system
import Score from '../Score.js';

// Import ramda.js library
import R from '../ramda.js';

// Obtain game instantiation data
const example_game = Tetris.new_game();

// Simulate the current Tetris scene
let field_string = `----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
-S--------
SSS-------
SSSZI-OOJJ
TSZZI-OOJJ
TTZLIIOOJJ
TLLLIIOOJJ`;

// Fill the established scenario into the field
example_game.field = field_string.split('\n').map(s => s.replace(/-/g, ' ').split(''));

/**
 * Judge scores and test them
 * @param {*} score Score
 * @param {*} isResetFour Whether to reset the status of isFour, default to reset
 */
function judgmentScore(score, isResetFour = true) {
  let game = example_game;

  // Reset score data
  Score.reset(isResetFour);

  // Slot a T tetromino into the hole and drop.
  // This can only go one deep.
  game.current_tetromino = Tetris.Z_tetromino;

  // I could use hard_drop here, but that would also score.
  // Instead wait for it to drop 22 times.
  R.range(0, 22).forEach(function () {
    game = Tetris.next_turn(game);
  });

  // Execution judgment
  if (game.score.score !== score) {
    throw new Error(`A single row cleared should score ${score}`);
  }
}

describe('Score', function () {
  // Test game initialization data
  it(`A new tetris game
        * Starts on level one
        * With no lines cleared
        * With a score of zero`, function () {
    const new_game = Tetris.new_game();
    const score = new_game.score;
    if (Score.level(score) !== 1) {
      throw new Error('New games should start on level one');
    }
    if (score.lines_cleared !== 0) {
      throw new Error('New games should have no lines cleared');
    }
    if (score.score !== 0) {
      throw new Error('New games should have a zero score');
    }
  });

  // Test whether to clear 4 rows
  it(`The score tracks the lines that get cleared`, function () {
    let field_string = `----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
-S--------
SSS-------
SSSZ-IOOJJ
TSZZ-IOOJJ
TTZL-IOOJJ
TLLL-IOOJJ`;

    example_game.field = field_string.split('\n').map(s => s.replace(/-/g, ' ').split(''));

    let game = example_game;

    // Slot an I tetromino into the hole and drop.
    game.current_tetromino = Tetris.I_tetromino;
    game = Tetris.rotate_ccw(game);
    game = Tetris.hard_drop(game, 0);

    if (game.score.lines_cleared !== 4) {
      throw new Error('Expecting 4 lines to clear');
    }
  });

  // Is the test score 100 points
  it(`A single line clear scores 100 × level`, function () {
    field_string = `----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
-S--------
SSS-------
SSSZ-IOOJJ
TSZZ-IOOJJ
TTZL-IOOJJ
TLLLIIOOJJ`;
    example_game.field = field_string.split('\n').map(s => s.replace(/-/g, ' ').split(''));
    judgmentScore(100);
  });

  // Is the test score 300 points
  it(`A double line clear scores 300 × level`, function () {
    field_string = `----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
-S--------
SSS-------
SSSZ-IOOJJ
TSZZ-IOOJJ
TTZLIIOOJJ
TLLLIIOOJJ`;
    example_game.field = field_string.split('\n').map(s => s.replace(/-/g, ' ').split(''));

    judgmentScore(300);
  });

  // Is the test score 500 points
  it(`A triple line clear scores 500 × level`, function () {
    field_string = `----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
-S--------
SSS-------
SSSZ-IOOJJ
TSZZIIOOJJ
TTZLIIOOJJ
TLLLIIOOJJ`;
    example_game.field = field_string.split('\n').map(s => s.replace(/-/g, ' ').split(''));

    judgmentScore(500);
  });

  // Is the test score 800 points
  it(`A tetris scores 800 × level`, function () {
    field_string = `----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
-S--------
SSS-------
SSSZIIOOJJ
TSZZIIOOJJ
TTZLIIOOJJ
TLLLIIOOJJ`;

    example_game.field = field_string.split('\n').map(s => s.replace(/-/g, ' ').split(''));

    judgmentScore(800);
  });

  // Is the test score 1200 points
  it(`Back to back tetrises score 1200 × level`, function () {
    Score.isFour = true;
    field_string = `----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
-S--------
SSS-------
SSSZIIOOJJ
TSZZIIOOJJ
TTZLIIOOJJ
TLLLIIOOJJ`;
    example_game.field = field_string.split('\n').map(s => s.replace(/-/g, ' ').split(''));
    judgmentScore(1200, false);
  });

  // Test whether+1 point is obtained by clicking the down button
  it(`A soft drop score 1 point per cell descended`, function () {
    // Reset score data
    Score.reset();

    // Re customize the current Tetris scene
    field_string = `----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
-S--------
SSS-------
SSSZ-IOOJJ
TSZZ-IOOJJ
TTZL-IOOJJ
TLLL-IOOJJ`;

    example_game.field = field_string.split('\n').map(s => s.replace(/-/g, ' ').split(''));

    // Simulate pressing the down button to move the block down one grid
    let game = Tetris.soft_drop(example_game, true, 1);

    // Is the test score 1 point
    if (game.score.score !== 1) {
      throw new Error(`Click the down button once, the score should be 1 point`);
    }
  });

  // Test whether+2 points can be obtained by clicking the Space bar to reach the bottom directly
  it(`A hard drop score 2 point per cell descended`, function () {
    // Reset score data
    Score.reset();

    // Re customize the current Tetris scene
    field_string = `----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
-S--------
SSS-------
SSSZ-IOOJJ
TSZZ-IOOJJ
TTZL-IOOJJ
TLLL-IOOJJ`;

    example_game.field = field_string.split('\n').map(s => s.replace(/-/g, ' ').split(''));

    // Simulate pressing the Space bar, and the box moves directly to the bottom
    let game = Tetris.hard_drop(example_game, 2);

    // Is the test score 2 points
    if (game.score.score !== 2) {
      throw new Error(`Click the Space bar to directly land to the bottom, and the score should be 2 points`);
    }
  });

  // Test whether to score without clicking the down key and the Space bar
  it(`Advancing the turn without manually dropping scores nothing.`, function () {
    // Reset score data
    Score.reset();

    // Re customize the current Tetris scene
    let field_string = `----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
-S--------
SSS-------
SSSZ-IOOJJ
TSZZ-IOOJJ
TTZL-IOOJJ
TLLL-IOOJJ`;

    example_game.field = field_string.split('\n').map(s => s.replace(/-/g, ' ').split(''));

    let game = example_game;

    // Slot an I tetromino into the hole and drop.
    game.current_tetromino = Tetris.I_tetromino;
    game = Tetris.rotate_ccw(game);

    // Drop by 22 squares
    R.range(0, 22).forEach(function () {
      game = Tetris.next_turn(game);
    });

    // Eliminate four lines, and do not manually press down and the Space bar, so the final score is 800 points
    if (game.score.score !== 800) {
      throw new Error(`Eliminate four lines, and do not manually press down and the Space bar, so the final score is 800 points`);
    }
  });
});

/**
 * @namespace Score
 * @author A. Freddie Page
 * @version 2022.23
 * This module provides a scoring system for Tetris games.
 */

/**
 * The score object contains information about the score of the game.
 * Currently, it is implemented as a single number,
 * But it can include other information such as the number of rows cleared.
 * @typedef {object} Score
 * @property {number} score - Latest Score
 * @property {function} level - Get the latest level
 * @property {number} grade - Latest level
 * @property {number} lines_cleared - Latest number of cleared rows
 * @property {boolean} isFour - Is the last number of cleared rows 4
 * @property {function} updateScore - Update score
 * @property {function} updateLevel - Update level
 * @property {function} updateClearLines - Update the number of cleared rows
 * @property {function} reset - Reset data for use when the game restarts
 * @memberof Score
 */
const Score = {
  score: 0,
  grade: 1,
  level() {
    return this.grade;
  },
  lines_cleared: 0,
  isFour: false,

  /**
   * Update score
   * @param {number} lines Indicates the number of rows cleared by the user, and will use cleared_ The lines function calculates the final score
   * @param {boolean} isDown Whether the user controls the drop of the box by clicking the down key and the Space bar
   */
  updateScore(lines, isDown = false) {
    // Accumulate the obtained scores with previous scores to obtain the latest score
    this.score += isDown ? lines : cleared_lines(this, lines);
  },

  /**
   * Update game level
   * @param {number} newLevel The latest game level will be calculated during the call
   */
  updateLevel(newLevel) {
    // Overwrite the latest level to the previous level to obtain the latest level
    this.grade = newLevel;
  },

  /**
   * Update the number of cleared rows
   * @param {number} newClearLines Indicates the number of rows cleared by the user this time, 1 | 2 | 3 | 4
   */
  updateClearLines(newClearLines) {
    // Accumulate the number of rows cleared this time and the previous number of rows
    this.lines_cleared += newClearLines;

    // Update score
    this.updateScore(newClearLines);

    // Update game level
    this.updateLevel(Math.ceil(this.lines_cleared / 10));
  },

  /**
   * Resetting the game level will be called when the player restarts the game
   */
  reset(isResetFour = true) {
    this.score = 0;
    this.grade = 1;
    this.lines_cleared = 0;

    if (isResetFour) this.isFour = false;
  },
};

/**
 * Score obtained by eliminating row correspondence
 * @param {Score} score The score object requires the use of its level and isFour parameters
 * @param {number} lines Number of rows cleared this time
 * @returns
 */
function cleared_lines(score, lines) {
  // Dynamically create a fraction, as each time it needs to read whether the previous elimination was 4 lines
  let fraction = {
    1: 100 * score.level(),
    2: 300 * score.level(),
    3: 500 * score.level(),
    4: score.isFour ? 1200 * score.level() : 800 * score.level(),
  };

  // If cleared to 4 rows this time, modify the isFour flag to true, and the next calculation will be done in another way. Otherwise, it will be false
  score.isFour = lines === 4 ? true : false;

  // Returns the score corresponding to the number of cleared rows
  return fraction[lines];
}

/**
 * Return to the game status of the new Tetris game.
 * @function
 * @memberof Score
 * @returns {Score} The new game.
 */
export default Score;

/**
 * @file wheel-of-fortune.js
 * @description Manages the interaction, physics animation, and outcome determination
 * for the interactive Wheel of Fortune game.
 */

// ==========================================
// GAME LOGIC & OUTCOME EVALUATION
// ==========================================

/**
 * Maps a specific rotational degree to a predefined prize segment on the wheel.
 * @param {number} previousEndDegree - The normalized angle (0-360) where the wheel stops.
 * @returns {string} The result of the spin (e.g., "5£", "jackpot", "lost it all").
 */
function checkResult(previousEndDegree) {
  let result = '';

  // Evaluates the angle against 30-degree segmented wedges
  switch (true) {
    case previousEndDegree > 15 && previousEndDegree <= 45:
      result = 'lost it all';
      break;
    case previousEndDegree > 45 && previousEndDegree <= 75:
      result = '5£';
      break;
    case previousEndDegree > 75 && previousEndDegree <= 105:
      result = 'lost it all';
      break;
    case previousEndDegree > 105 && previousEndDegree <= 135:
      result = 'lost it all';
      break;
    case previousEndDegree > 135 && previousEndDegree <= 165:
      result = '5£';
      break;
    case previousEndDegree > 165 && previousEndDegree <= 195:
      result = 'lost it all';
      break;
    case previousEndDegree > 195 && previousEndDegree <= 225:
      result = '10£';
      break;
    case previousEndDegree > 225 && previousEndDegree <= 255:
      result = 'lost it all';
      break;
    case previousEndDegree > 255 && previousEndDegree <= 285:
      result = 'jackpot';
      break;
    case previousEndDegree > 285 && previousEndDegree <= 315:
      result = 'jackpot';
      break;
    case previousEndDegree > 315 && previousEndDegree <= 345:
      result = 'zero';
      break;
    case previousEndDegree > 345 || previousEndDegree <= 15:
      result = '10£';
      break;
  }
  return result;
}

/**
 * Appends the game outcome to local storage for historical tracking.
 * @param {string} gameName - Identifier for the game type.
 * @param {string} outcome - The result of the match.
 */
function saveResult(gameName, outcome) {
  let results = JSON.parse(localStorage.getItem('gameResults')) || [];

  results.push({
    game: gameName,
    result: outcome,
    date: new Date().toLocaleString(),
  });

  localStorage.setItem('gameResults', JSON.stringify(results));
}

// ==========================================
// ANIMATION & DOM MANIPULATION
// ==========================================

/**
 * Initializes the Wheel of Fortune component, binding click events and
 * handling the Web Animations API for the spinning physics.
 * @param {string} selector - The CSS selector for the wheel's parent container.
 */
function wheelOfFortune(selector) {
  const node = document.querySelector(selector);
  if (!node) return; // Guard clause in case the element doesn't exist on the current page

  const spin = node.querySelector('button');
  const wheel = node.querySelector('ul');

  /** @type {Animation|boolean} Tracks the active state of the animation to prevent overlapping clicks */
  let animation;

  /** @type {number} Persists the resting angle of the wheel between spins */
  let previousEndDegree = 0;

  spin.addEventListener('click', () => {
    // Prevent interaction if the wheel is currently in motion
    if (!animation) {
      // Calculate a base target rotation (minimum 5 full spins + random remainder)
      let randomAdditionalDegrees = Math.random() * 360 + 1800;
      let newEndDegree = previousEndDegree + randomAdditionalDegrees;

      // Normalize values to strictly stay within a 0-360 degree range
      while (previousEndDegree >= 360) {
        previousEndDegree -= 360;
      }
      while (newEndDegree >= 360) {
        newEndDegree -= 360;
      }

      console.log(
        `Initial calculation: Start ${previousEndDegree} -> Target ${newEndDegree}`,
      );

      // ==========================================
      // "THE HOUSE ALWAYS WINS" ALGORITHM
      // Automatically rerolls the target degree in memory until the outcome is a loss.
      // ==========================================
      while (checkResult(newEndDegree) !== 'lost it all') {
        randomAdditionalDegrees = Math.random() * 360 + 1800;
        newEndDegree = previousEndDegree + randomAdditionalDegrees;
        while (newEndDegree >= 360) {
          newEndDegree -= 360;
        }
      }

      console.log(
        `Rigged calculation: Start ${previousEndDegree} -> Target ${newEndDegree}`,
      );

      // Execute the rotation using the native Web Animations API
      animation = wheel.animate(
        [
          { transform: `rotate(${previousEndDegree}deg)` },
          // Add 4 extra full rotations (1440deg) for visual flair during the spin
          { transform: `rotate(${newEndDegree + 360 * 4}deg)` },
        ],
        {
          duration: 4000,
          direction: 'normal',
          // Custom cubic-bezier creates a realistic tension pull-back and snap-forward effect
          easing: 'cubic-bezier(0.440, -0.205, 0.000, 1.130)',
          fill: 'forwards', // Maintains the final frame state after animation completes
          iterations: 1,
        },
      );

      // Reset interaction locks and update global state after the animation timeframe (4s + 100ms buffer)
      setTimeout(function () {
        animation = false;
      }, 4100);
      setTimeout(function () {
        previousEndDegree = newEndDegree;
      }, 4100);

      // Log the deterministic outcome
      saveResult('wheel of fortune', checkResult(newEndDegree));
    } else {
      console.log('Action blocked: The wheel is already spinning.');
    }
  });
}

// ==========================================
// INITIALIZATION
// ==========================================

// Bootstrap the interactive component on load
wheelOfFortune('.ui-wheel-of-fortune');

/**
 * @file slots.js
 * @description Handles the complex 3D animation, physics simulation (acceleration/deceleration),
 * and win-condition logic for the slot machine game.
 */

// ==========================================
// GLOBAL STATE
// ==========================================

/** @type {boolean} Indicates if the slot machine is currently in motion. */
let isSpinning = false;

/** @type {number|null} Holds the reference to the active requestAnimationFrame loop. */
let animationId = null;

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Generates a randomized initial speed for a reel.
 * @returns {number} A float representing the rotation duration modifier.
 */
function getRandomSpeed() {
  return Math.random() * 0.5 + 0.5;
}

/**
 * Generates a randomized time interval before the reel begins to slow down.
 * @returns {number} Milliseconds between 1000ms and 5000ms.
 */
function getRandomTime() {
  return Math.random() * 4000 + 1000;
}

// ==========================================
// CORE ANIMATION LOGIC
// ==========================================

/**
 * The main render loop for the slot machine animation.
 * Calculates frame-by-frame physics for both the continuous spin and the final snap.
 * @param {NodeListOf<Element>} wheels - The DOM elements representing the slot reels.
 */
function animateWheels(wheels) {
  const now = performance.now();
  let anyActive = false;

  wheels.forEach((wheel) => {
    // Phase 1: Continuous Free-Spinning
    if (wheel.isSpinning) {
      const delta = now - wheel.lastTime;
      // Calculate rotation based on elapsed time to ensure smooth performance regardless of frame rate
      wheel.angle =
        (wheel.angle + (360 / wheel.currentDuration) * (delta / 1000)) % 360;
      wheel.style.transform = `rotateX(${wheel.angle}deg)`;
      wheel.lastTime = now;
      anyActive = true;
    }
    // Phase 2: Decelerating and Snapping to a target symbol
    else if (wheel.isSnapping) {
      const elapsed = now - wheel.snapStartTime;
      const duration = wheel.snapDuration;

      if (elapsed >= duration) {
        // Snap complete: Lock precisely to the target angle
        wheel.angle = wheel.targetAngle;
        wheel.style.transform = `rotateX(${wheel.angle}deg)`;
        wheel.isSnapping = false;
      } else {
        // Interpolate the current angle using a custom Ease-In-Out timing function
        const progress = elapsed / duration;
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        let current =
          wheel.snapStartAngle +
          (wheel.targetAngle - wheel.snapStartAngle) * eased;

        // Keep bounds strictly within -180 to +180 degrees to prevent CSS rendering glitches
        if (current > 180) current -= 360;
        if (current < -180) current += 360;

        wheel.angle = current;
        wheel.style.transform = `rotateX(${current}deg)`;
      }
      anyActive = true;
    }
  });

  // Continue the loop if any wheel is still moving
  if (anyActive) {
    animationId = requestAnimationFrame(() => animateWheels(wheels));
  } else {
    isSpinning = false;
    getResult(); // Animation finished, evaluate the outcome
  }
}

/**
 * Initiates the deceleration phase for the reels, calculating the shortest
 * rotational path to the nearest symbol.
 * @param {NodeListOf<Element>} wheels - The DOM elements representing the slot reels.
 */
function startSlowdown(wheels) {
  const stoppingInterval = 100;

  wheels.forEach((wheel) => {
    let currentDuration = wheel.currentDuration;

    const slowdownInterval = setInterval(() => {
      // Gradually increase rotation duration (slowing down the speed)
      currentDuration += 0.2;
      wheel.currentDuration = currentDuration;

      // Threshold reached: Transition from spinning to snapping
      if (currentDuration >= 3.0) {
        clearInterval(slowdownInterval);
        wheel.isSpinning = false;

        // Normalize current angle to –180 / +180 range
        let currentAngle = wheel.angle % 360;
        if (currentAngle > 180) currentAngle -= 360;
        if (currentAngle < -180) currentAngle += 360;

        // Define valid locking targets based on our CSS cylinder layout (0°, 120°, 240°)
        const targets = [0, 120, 240];
        let bestTarget = 0;
        let minDiff = Infinity;

        // Algorithm to find the closest target taking the shortest path
        targets.forEach((t) => {
          let diff = t - currentAngle;
          diff = ((diff + 180) % 360) - 180; // Calculate shortest signed delta
          const absDiff = Math.abs(diff);
          if (absDiff < minDiff) {
            minDiff = absDiff;
            bestTarget = currentAngle + diff; // Absolute target in –180/+180
          }
        });

        // Initialize state for the snapping phase
        wheel.targetAngle = bestTarget;
        wheel.snapStartAngle = currentAngle;
        wheel.isSnapping = true;
        wheel.snapStartTime = performance.now();
        wheel.snapDuration = 500; // Duration of the snap animation in ms
      }
    }, stoppingInterval);
  });
}

// ==========================================
// PUBLIC API & GAME LOGIC
// ==========================================

/**
 * Entry point for the game. Resets wheel state and triggers the animation sequences.
 */
function spinWheel() {
  if (isSpinning) return; // Prevent double-clicking during an active spin
  isSpinning = true;

  const wheels = document.querySelectorAll('.Wheel');
  wheels.forEach((wheel) => {
    wheel.style.animation = 'none'; // Clear any CSS animations
    wheel.currentDuration = getRandomSpeed();
    wheel.angle = wheel.angle || 0;
    wheel.lastTime = performance.now();
    wheel.isSpinning = true;
    wheel.isSnapping = false;
  });

  animateWheels(wheels);

  // Trigger the slowdown sequence after a random duration
  setTimeout(() => startSlowdown(wheels), getRandomTime());
}

/**
 * Appends the game outcome to local storage for historical tracking.
 * @param {string} gameName - Identifier for the game type (e.g., 'slots').
 * @param {string} outcome - The result of the match ('win' or 'loss').
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

/**
 * Evaluates the final rotational angles of all wheels to determine if the user won.
 */
function getResult() {
  const wheels = document.querySelectorAll('.Wheel');
  let turningState = [];

  // Extract integer angles
  wheels.forEach((wheel) => {
    turningState.push(parseInt(wheel.angle, 10));
  });

  // Log raw angles for debugging
  turningState.forEach((num) => {
    console.log(num);
  });

  let tln = 0;
  let cnt = 0;

  // Normalize angles into strict matching buckets
  // Mapping: Cherry = 0, Bell = 120, 7 = -120
  turningState.forEach((num, index) => {
    if (num + 10 < 0) {
      turningState[index] = -120;
    } else if (num - 150 < -120) {
      turningState[index] = 0;
    } else {
      turningState[index] = 120;
    }
  });

  // Evaluate if all normalized symbols match
  turningState.forEach((num) => {
    if (cnt === 0) {
      tln = num;
      cnt += 1;
    } else if (tln === num) {
      cnt += 1;
    }
  });

  // Determine win condition and write to local storage
  if (cnt === 3) {
    saveResult('slots', 'win');
  } else {
    saveResult('slots', 'loss');
  }
}

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Binds DOM elements to their respective game functions once the document is fully parsed.
 */
document.addEventListener('DOMContentLoaded', () => {
  const spinButton = document.getElementById('spinButton');
  if (spinButton) {
    spinButton.addEventListener('click', spinWheel);
  }
});

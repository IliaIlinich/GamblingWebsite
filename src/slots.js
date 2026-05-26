let isSpinning = false;
let animationId = null;

function getRandomSpeed() {
  return Math.random() * 0.5 + 0.5;
}

function getRandomTime() {
  return Math.random() * 4000 + 1000;
}

// Main animation loop
function animateWheels(wheels) {
  const now = performance.now();
  let anyActive = false;

  wheels.forEach((wheel) => {
    if (wheel.isSpinning) {
      const delta = now - wheel.lastTime;
      wheel.angle =
        (wheel.angle + (360 / wheel.currentDuration) * (delta / 1000)) % 360;
      wheel.style.transform = `rotateX(${wheel.angle}deg)`;
      wheel.lastTime = now;
      anyActive = true;
    } else if (wheel.isSnapping) {
      const elapsed = now - wheel.snapStartTime;
      const duration = wheel.snapDuration;

      if (elapsed >= duration) {
        // Snap complete
        wheel.angle = wheel.targetAngle;
        wheel.style.transform = `rotateX(${wheel.angle}deg)`;
        wheel.isSnapping = false;
      } else {
        const progress = elapsed / duration;
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        let current =
          wheel.snapStartAngle +
          (wheel.targetAngle - wheel.snapStartAngle) * eased;

        // Keep in –180…+180 range (optional but clean)
        if (current > 180) current -= 360;
        if (current < -180) current += 360;

        wheel.angle = current;
        wheel.style.transform = `rotateX(${current}deg)`;
      }
      anyActive = true;
    }
  });

  if (anyActive) {
    animationId = requestAnimationFrame(() => animateWheels(wheels));
  } else {
    isSpinning = false;
    getResult();
  }
}

// Start slowdown → snap to nearest symbol
function startSlowdown(wheels) {
  const stoppingInterval = 100;
  wheels.forEach((wheel) => {
    let currentDuration = wheel.currentDuration;
    const slowdownInterval = setInterval(() => {
      currentDuration += 0.2;
      wheel.currentDuration = currentDuration;

      if (currentDuration >= 3.0) {
        clearInterval(slowdownInterval);
        wheel.isSpinning = false;

        // === NORMALIZE current angle to –180+180 ===
        let currentAngle = wheel.angle % 360;
        if (currentAngle > 180) currentAngle -= 360;
        if (currentAngle < -180) currentAngle += 360;

        // === Find closest target in shortest direction ===
        const targets = [0, 120, 240];
        let bestTarget = 0;
        let minDiff = Infinity;

        targets.forEach((t) => {
          let diff = t - currentAngle;
          diff = ((diff + 180) % 360) - 180; // shortest signed delta
          const absDiff = Math.abs(diff);
          if (absDiff < minDiff) {
            minDiff = absDiff;
            bestTarget = currentAngle + diff; // absolute target in –180+180
          }
        });

        // === Store normalized angles ===
        wheel.targetAngle = bestTarget;
        wheel.snapStartAngle = currentAngle;
        wheel.isSnapping = true;
        wheel.snapStartTime = performance.now();
        wheel.snapDuration = 500;
      }
    }, stoppingInterval);
  });
}

// Public: Spin all wheels
function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;

  const wheels = document.querySelectorAll('.Wheel');
  wheels.forEach((wheel) => {
    wheel.style.animation = 'none';
    wheel.currentDuration = getRandomSpeed();
    wheel.angle = wheel.angle || 0;
    wheel.lastTime = performance.now();
    wheel.isSpinning = true;
    wheel.isSnapping = false;
  });

  animateWheels(wheels);
  setTimeout(() => startSlowdown(wheels), getRandomTime());
}

function saveResult(gameName, outcome) {
  // Get existing results from memory (or an empty array if none exist)
  let results = JSON.parse(localStorage.getItem('gameResults')) || [];

  // Add the new result
  results.push({
    game: gameName,
    result: outcome,
    date: new Date().toLocaleString(),
  });

  // Save it back to memory
  localStorage.setItem('gameResults', JSON.stringify(results));
}

function getResult() {
  const wheels = document.querySelectorAll('.Wheel');
  let turningState = [];
  wheels.forEach((wheel) => {
    turningState.push(parseInt(wheel.angle, 10));
  });
  turningState.forEach((num) => {
    console.log(num);
  })
  let tln = 0;
  let cnt = 0;
  turningState.forEach((num) => {
    if (num + 10 < 0) {
      num = -120;
    } else if (num - 150 < -120) {
      num = 0;
    } else {
      num = 120;
    }
  })
  turningState.forEach((num) => {
    if (cnt === 0) {
      tln = num;
      cnt += 1;
    } else if (tln === num) {
      cnt += 1;
    }
  })
  if (cnt === 3) {
    //console.log("you win!!!!!");
    saveResult('slots', 'win');
  } else {
    //console.log("You lost all your money haha!!!!!");
    saveResult('slots', 'loss');
  }
  // cherry - 0
  // bell - 120
  // 7 - -120
}

// Optional: Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const spinButton = document.getElementById('spinButton');
  if (spinButton) {
    spinButton.addEventListener('click', spinWheel);
  }
});
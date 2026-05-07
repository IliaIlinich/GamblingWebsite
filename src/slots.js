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
  }
}

// Start slowdown → snap to nearest symbol
function startSlowdown(wheels) {
  const stoppingInterval = 1000;
  wheels.forEach((wheel) => {
    let currentDuration = wheel.currentDuration;
    const slowdownInterval = setInterval(() => {
      currentDuration += 0.2;
      wheel.currentDuration = currentDuration;

      if (currentDuration >= 3.0) {
        clearInterval(slowdownInterval);
        wheel.isSpinning = false;

        // === NORMALIZE current angle to –180…+180 ===
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
            bestTarget = currentAngle + diff; // absolute target in –180…+180
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

// Optional: Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const spinButton = document.getElementById('spinButton');
  if (spinButton) {
    spinButton.addEventListener('click', spinWheel);
  }
});

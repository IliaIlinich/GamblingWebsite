function checkResult(previousEndDegree) {
  let result = "";

  switch (true) {
    case previousEndDegree > 15 && previousEndDegree <= 45:
      result = "lost it all";
      break;
    case previousEndDegree > 45 && previousEndDegree <= 75:
      result = "5£";
      break;
    case previousEndDegree > 75 && previousEndDegree <= 105:
      result = "lost it all";
      break;
    case previousEndDegree > 105 && previousEndDegree <= 135:
      result = "lost it all";
      break;
    case previousEndDegree > 135 && previousEndDegree <= 165:
      result = "5£";
      break;
    case previousEndDegree > 165 && previousEndDegree <= 195:
      result = "lost it all";
      break;
    case previousEndDegree > 195 && previousEndDegree <= 225:
      result = "10£";
      break;
    case previousEndDegree > 225 && previousEndDegree <= 255:
      result = "lost it all";
      break;
    case previousEndDegree > 255 && previousEndDegree <= 285:
      result = "jackpot";
      break;
    case previousEndDegree > 285 && previousEndDegree <= 315:
      result = "jackpot";
      break;
    case previousEndDegree > 315 && previousEndDegree <= 345:
      result = "zero";
      break;
    case previousEndDegree > 345 || previousEndDegree <= 15: // Fixed logic here
      result = "10£";
      break;
  }
  return result;
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

function wheelOfFortune(selector) {
  const node = document.querySelector(selector);
  if (!node) return;

  const spin = node.querySelector('button');
  const wheel = node.querySelector('ul');
  let animation;
  let previousEndDegree = 0;

  spin.addEventListener('click', () => {
    if (!animation) {
      let randomAdditionalDegrees = Math.random() * 360 + 1800;
      let newEndDegree = previousEndDegree + randomAdditionalDegrees;
      while (previousEndDegree >= 360) {
        previousEndDegree -= 360;
      }
      while (newEndDegree >= 360) {
        newEndDegree -= 360;
      }
      console.log(previousEndDegree, newEndDegree);

      while (checkResult(newEndDegree) !== "lost it all") {
        randomAdditionalDegrees = Math.random() * 360 + 1800;
        newEndDegree = previousEndDegree + randomAdditionalDegrees;
        while (newEndDegree >= 360) {
          newEndDegree -= 360;
        }
      }
      console.log(previousEndDegree, newEndDegree);
      animation = wheel.animate(
        [
          { transform: `rotate(${previousEndDegree}deg)` },
          { transform: `rotate(${newEndDegree + (360 * 4)}deg)` },
        ],
        {
          duration: 4000,
          direction: 'normal',
          easing: 'cubic-bezier(0.440, -0.205, 0.000, 1.130)',
          fill: 'forwards',
          iterations: 1,
        },
      );
      setTimeout(function() { animation = false; }, 4100);
      setTimeout(function() { previousEndDegree = newEndDegree; }, 4100);
      saveResult('wheel of fortune', checkResult(newEndDegree));
    } else {
      console.log("The wheel is already spinning")
    }
  });
}

// Usage
wheelOfFortune('.ui-wheel-of-fortune');

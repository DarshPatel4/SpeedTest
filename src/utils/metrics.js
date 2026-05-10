export function countMatches(typed, expected) {
  let n = 0;
  const len = Math.min(typed.length, expected.length);
  for (let i = 0; i < len; i++) {
    if (typed[i] === expected[i]) n++;
  }
  return n;
}

export function computeWpm(correctChars, elapsedSec) {
  if (elapsedSec <= 0) return 0;
  const words = correctChars / 5;
  const minutes = elapsedSec / 60;
  return Math.round(words / minutes);
}

export function computeCpm(correctChars, elapsedSec) {
  if (elapsedSec <= 0) return 0;
  return Math.round(correctChars / (elapsedSec / 60));
}

export function computeAccuracyFromStrings(typed, expected) {
  if (!typed.length) return 100;
  let correct = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === expected[i]) correct++;
  }
  return Math.round((correct / typed.length) * 1000) / 10;
}

export function countErrors(typed, expected) {
  let e = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] !== expected[i]) e++;
  }
  return e;
}

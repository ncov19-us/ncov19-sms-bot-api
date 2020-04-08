// library imports

// function determines which arrow emoji (up ⬆️ or down ⬇️) to use for each specific data value
function upOrDown(num) {
  let arrow;

  if (num > 0) {
    arrow = "\u2B06";

    return arrow;
  } else if (num === 0) {
    arrow = "\u2B06";

    return arrow;
  } else {
    arrow = "\u2B07";

    return arrow;
  }
}
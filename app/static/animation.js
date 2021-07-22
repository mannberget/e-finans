var nextX, nextY;
var startTime;
var duration = 1000/10;

function anim(time) {
  if (!startTime) // it's the first frame
    startTime = time || performance.now();

  // deltaTime should be in the range [0 ~ 1]
  var deltaTime = (time - startTime) / duration;
  // currentPos = previous position + (difference * deltaTime)
  var currentX = x + ((nextX - x) * deltaTime);
  var currentY = y + ((nextY - y) * deltaTime);

  if (deltaTime >= 1) { // this means we ended our animation
    x = nextX; // reset x variable
    y = nextY; // reset y variable
    startTime = null; // reset startTime
    draw(x, y); // draw the last frame, at required position
  } else {
    draw(currentX, currentY);
    requestAnimationFrame(anim); // do it again
  }
}

export {anim};
const horiz = "─"
const vert = "│"

const topLeft = "┌"
const topCenter = "┬"
const topRight = "┐"
const middleLeft = "├"
const middleCenter = "┼"
const middleRight = "┤"
const bottomLeft = "└"
const bottomCenter = "┴"
const bottomRight = "┘"

const border = {
  horiz: horiz,
  vert: vert,
  top: {
    left: topLeft,
    center: topCenter,
    right: topRight,
  },
  middle: {
    left: middleLeft,
    center: middleCenter,
    right: middleRight,
  },
  bottom: {
    left: bottomLeft,
    center: bottomCenter,
    right: bottomRight,
  },
}

export {
  border,
  bottomCenter,
  bottomLeft,
  bottomRight,
  horiz,
  middleCenter,
  middleLeft,
  middleRight,
  topCenter,
  topLeft,
  topRight,
  vert,
}

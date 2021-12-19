import math from "mathjs";

const toPoint = (vector: math.Matrix) => {
  const vectorAsArray = toArray(vector);

  return {
    x: vectorAsArray[0],
    y: vectorAsArray[1],
    z: vectorAsArray[2]
  };
};

const toArray = (vector: math.Matrix) => vector.valueOf() as number[];

export const vector = {
  toPoint,
  toArray
};

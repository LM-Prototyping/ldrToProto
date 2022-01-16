import { Point } from "../../parsers/types";
import { IndexedFaceSetObjectType } from "../types";

const createCoordString = ({
  maxIndex,
  ...coordinates
}: Omit<IndexedFaceSetObjectType, "coordIndex">) => {
  const coordinatesArray = new Array(maxIndex as number);

  for (const coordinate of Object.keys(coordinates)) {
    const index = coordinates[coordinate] as number;

    coordinatesArray[index] = coordinate;
  }

  return coordinatesArray.join(" ");
};

const createCoordIndexString = (coordIndex: string[]) => coordIndex.join(" ");

const indexedFaceSet = (object: IndexedFaceSetObjectType) => {
  const { coordIndex } = object;

  const coordString = `
    coord Coordinate {
        point [
            ${createCoordString(object)}
        ]
    }`;

  const coordIndexString = `
    coordIndex [
        ${createCoordIndexString(coordIndex)}
    ]`;

  return `
    geometry IndexedFaceSet {
        ${coordString}
        ${coordIndexString}
    }
  `;
};

const cylinder = (height: number, radius: number) => {
  return `Cylinder {
    height ${height}
    radius ${radius}
  }`;
};

const box = ({ x, y, z }: Point) => `
  Box {
    size ${x} ${y} ${z}
  }
`;

export const geometry = {
  indexedFaceSet,
  cylinder,
  box
};

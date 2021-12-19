import { Point } from "../parsers/types";
import { Dict } from "../types";

interface CoordIndexArray {
  coordIndex: string[];
}

export interface IndexedFaceSetObjectType extends CoordIndexArray {
  maxIndex: number;
  [key: string]: number | string[];
}

export type SubModuleIndexedFaceSetDict = Dict<IndexedFaceSetObjectType>;

export interface Rotation extends Point {
  angle: number;
}

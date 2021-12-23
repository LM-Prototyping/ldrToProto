import {
  BaseElement,
  FileNodeWithSpecialElements,
  SpecialElement,
  WheelElement
} from "../lego/types";
import { Dict } from "../types";

export interface FileNodeInfo {
  name: string;
  callsFiles: string[];
}

export interface FileNode {
  name: string;
  file: string;
  dependentFrom: FileNodeDict; // From which file is this file dependent
  dependentBy: FileNodeDict;
}

export interface ProcessedFile
  extends Pick<FileNodeWithSpecialElements, "specialElements" | "connections"> {
  name: string;
  modelLines: string[];
  hingeJoints?: HingeJointElement[];
  wheels: WheelElement[];
}
export interface HingeJointElement extends ProcessedFile {
  elementInfo: BaseElement;
}
export type ProcessedFilesDict = Dict<ProcessedFile>;

export type FileNodeDict = Dict<FileNode>;

export type LineType = "0" | "1" | "2" | "3" | "4";

export interface Point {
  x: number;
  y: number;
  z: number;
}

export interface BaseLineTypeData {
  color: string;
}

export interface LineType1Data extends BaseLineTypeData {
  fileName: string;
  transformationMatrix: math.Matrix;
  coordinates: Point;
}

export interface LineType2Data extends BaseLineTypeData {
  A: Point;
  B: Point;
}

export interface LineType3Data extends LineType2Data {
  C: Point;
}

export interface LineType4Data extends LineType3Data {
  D: Point;
}

export type HandleLineTypeReturn = LineType1Data | LineType2Data | LineType3Data | LineType4Data;

export interface Color {
  code: string;
  value: string;
  edgeColor: string;
  name: string;
}

export type ColorsDict = Dict<Color>;

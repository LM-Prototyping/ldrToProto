// import math from "mathjs";
// import { FileNode, Point, ProcessedFile } from "../parsers/types";
// import { Dict } from "../types";
// import { Rotation } from "../webots/types";

// export interface PartType {
//   type: string;
//   name: string;
//   internalName: string;
// }
// export type PartTypeDict = Dict<PartType>;

// export interface BaseElement {
//   rotation: math.Matrix;
//   coordinate: Point;
//   direction?: Point;
// }
// export interface SpecialElement extends BaseElement {
//   name: string;
//   distance?: Point;
// }
// export interface ConnectionElement extends BaseElement {
//   isMotor: boolean;
// }

// export interface WheelPart {
//   coordinate: Point;
//   height: number;
//   radius: number;
// }
// export type WheelPartDict = Dict<WheelPart>;
// export type WheelElement = BaseElement & WheelPart;

// export type SpecialElementDict = Dict<SpecialElement>;

// export interface FileNodeWithSpecialElements extends FileNode {
//   specialElements: SpecialElement[];
//   connections: ConnectionElement[];
//   wheels: WheelElement[];
// }

// export type FileNodeWithSpecialElementsDict = Dict<FileNodeWithSpecialElements>;

// export interface DeviceInfo {
//   basePosition: Point;
//   direction?: Point;
//   buildElement: (
//     transformation: Point,
//     rotation: Rotation,
//     name: string,
//     options?: {
//       distance?: Point;
//     }
//   ) => string;
// }
// export type DeviceInfoDict = Dict<DeviceInfo>;

import { Point } from "../parsers/types";
import { Dict, Sensor, Wheel, WheelPart } from "../types";
import { Rotation } from "../webots/types";

export interface PartType {
  type: string;
  name: string;
  internalName: string;
}
export type PartTypeDict = Dict<PartType>;

// export interface BaseElement {
//   rotation: math.Matrix;
//   coordinate: Point;
//   direction?: Point;
// }
// export interface SpecialElement extends BaseElement {
//   name: string;
//   distance?: Point;
// }
// export interface ConnectionElement extends BaseElement {
//   isMotor: boolean;
// }

// export interface WheelPart {
//   coordinate: Point;
//   height: number;
//   radius: number;
// }
// export type WheelElement = BaseElement & WheelPart;

// export type SpecialElementDict = Dict<SpecialElement>;

// export type FileNodeWithSpecialElementsDict = Dict<FileNodeWithSpecialElements>;

export interface PortInfo {
  type: "distance" | "touch" | "motor" | "compass" | "light";
  name: string;
  color: string;
}

export type BuildElementFunction = (sensor: Sensor) => {
  faceSet: string;
  device: string;
  portInfo?: PortInfo;
};

export interface DeviceInfo {
  basePosition: Point;
  direction: Point;
  auxilierDirections?: Point[];
  buildElement: BuildElementFunction;
}

export type DeviceInfoDict = Dict<DeviceInfo>;

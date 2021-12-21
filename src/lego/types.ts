import math from "mathjs";
import { FileNode, Point, ProcessedFile } from "../parsers/types";
import { Dict } from "../types";
import { Rotation } from "../webots/types";

export interface PartType {
  type: string;
  name: string;
  internalName: string;
}
export type PartTypeDict = Dict<PartType>;

export interface BaseElement {
  rotation: math.Matrix;
  coordinate: Point;
}
export interface SpecialElement extends BaseElement {
  name: string;
}
export type ConnectionElement = BaseElement;

export type SpecialElementDict = Dict<SpecialElement>;

export interface FileNodeWithSpecialElements extends FileNode {
  specialElements: SpecialElement[];
  connections: ConnectionElement[];
}

export type FileNodeWithSpecialElementsDict = Dict<FileNodeWithSpecialElements>;

export interface DeviceInfo {
  basePosition: Point;
  buildElement: (transformation: Point, rotation: Rotation, name: string) => string;
}
export type DeviceInfoDict = Dict<DeviceInfo>;

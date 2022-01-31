import math from "mathjs";
import { Point } from "./parsers/types";

export interface Dict<T> {
  [key: string]: T;
}

export type _Iterable<T> = Record<string, T>;

export interface LegoElement {
  // rotation:
  coordinate: Point;
  direction?: Point;
  auxilierDirection?: Point;
  rotation?: math.Matrix;
}

export interface Sensor extends LegoElement {
  name: string;
  distance?: Point;
}

export interface TouchSensor extends Sensor {
  distance: Point;
}

export interface Connection extends LegoElement {
  isMotor: boolean;
}

export interface WheelPart {
  coordinate: Point;
  height: number;
  radius: number;
}

export type Wheel = LegoElement & WheelPart;

export type WheelPartDict = Dict<WheelPart>;

export interface Color {
  code: string;
  value: string;
  edgeColor: string;
  name: string;
}

export type ColorsDict = Dict<Color>;

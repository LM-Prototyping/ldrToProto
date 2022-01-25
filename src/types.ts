import { Point } from "./parsers/types";

export interface Dict<T> {
  [key: string]: T;
}

export type _Iterable<T> = Record<string, T>;

export interface LegoElement {
  // rotation:
  coordinate: Point;
  direction: Point;
}

export interface Sensor extends LegoElement {
  name: string;
}

export interface TouchSensor extends Sensor {
  distance: Point;
}

export interface Connection extends LegoElement {
  isMotor: boolean;
}

export interface Wheel extends Omit<LegoElement, "direction"> {
  coordinate: Point;
  height: number;
  radius: number;
}

export interface Color {
  code: string;
  value: string;
  edgeColor: string;
  name: string;
}

export type ColorsDict = Dict<Color>;

import { Connection, Dict, LegoElement, Sensor, Wheel } from "../../types";

export interface DependencyNodeInfo {
  name: string;
  callsFiles: string[];
}

export interface DependencyNode {
  name: string;
  file: string;
  dependentFrom: DependencyNodeDict; // From which file is this file dependent
  dependentBy: DependencyNodeDict;

  // Sensors, connections, wheels
  sensors: Sensor[];
  connections: Connection[];
  wheels: Wheel[];
}

export type DependencyNodeDict = Dict<DependencyNode>;

export interface HingeJoint extends FileElement {
  element: LegoElement;
  isMotor: string | boolean;
}

export interface FileElement extends Pick<DependencyNode, "sensors" | "connections" | "wheels"> {
  name: string;
  modelLines: string[];
  hingeJoints?: HingeJoint[];
}

export type FileElementDict = Dict<FileElement>;

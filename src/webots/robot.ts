import { FileElementDict } from "../parsers/dependencyGraph/types";
import { reduceFileElements } from "../parsers/reduceFileElements";
import { fileToShape } from "./fileToShape";

export const createRobot = (order: string[], fileElements: FileElementDict) => {
  const { modelLines, sensors, hingeJoints, wheels } = reduceFileElements(order, fileElements);
  const roboter = fileToShape(modelLines, sensors, hingeJoints, wheels);

  return `Robot {
  ${roboter.replace(/Solid\s+{/, "")}
  `;
};

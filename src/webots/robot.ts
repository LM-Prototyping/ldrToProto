import { FileElementDict } from "../parsers/dependencyGraph/types";
import { reduceFileElements } from "../parsers/reduceFileElements";
import { fileToShape } from "./fileToShape";

export const createRobot = (order: string[], fileElements: FileElementDict) => {
  const { modelLines, sensors, hingeJoints, wheels } = reduceFileElements(order, fileElements);
  const { element, devicesOnPorts } = fileToShape(modelLines, sensors, hingeJoints, wheels);

  return {
    robot: `Robot {
  ${element.replace(/Solid\s+{/, "")}
  `,
    devicesOnPorts
  };
};

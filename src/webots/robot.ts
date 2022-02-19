import { FileElementDict } from "../parsers/dependencyGraph/types";
import { reduceFileElements } from "../parsers/reduceFileElements";
import { fileToShape } from "./fileToShape";

export const createRobot = (order: string[], fileElements: FileElementDict, robotName: string) => {
  const { modelLines, sensors, hingeJoints, wheels } = reduceFileElements(order, fileElements);
  const { element, devicesOnPorts } = fileToShape(modelLines, sensors, hingeJoints, wheels);

  return {
    robot: `Robot {
      controller "<extern>"
      name "${robotName}"
  ${element.replace(/Solid\s+{/, "")}
  `,
    devicesOnPorts
  };
};


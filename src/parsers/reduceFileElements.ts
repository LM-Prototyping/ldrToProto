import { lego } from "../lego";
import { transformation } from "../transformation";
import { Connection } from "../types";
import { FileElementDict } from "./dependencyGraph/types";
import { LineType1Data } from "./types";
import { getLineData } from "./utils";

export const reduceFileElements = (order: string[], files: FileElementDict) => {
  for (const name of order) {
    // Hier Untermodelle Button up einfügen und ggf Transformationen durchführen

    const model = files[name];

    if (!model) {
      continue;
    }

    const {
      modelLines,
      sensors: allSpecialElements,
      connections: allConnections,
      wheels: allWheels
    } = model;
    const newLines = [];
    const newSpecialElements = [...allSpecialElements];
    // const newConnections = [...allConnections];
    // const hingeJoints = [] as HingeJointElement[];
    // const newWheels = [...allWheels] as Wheel[];

    for (const line of modelLines) {
      const lineTypeMatch = line.match(/^1/);

      if (!lineTypeMatch) {
        newLines.push(line);
        continue;
      }

      // Line is type one
      const { fileName, transformationMatrix, coordinates, color } = getLineData(
        line
      ) as LineType1Data;

      if (!files[fileName]) {
        continue;
      }

      const {
        modelLines: subModelLines,
        sensors,
        connections,
        wheels,
        hingeJoints: inlineHingeJoints
      } = files[fileName];

      const transformedConnections = lego.elements.special.transformArray<Connection[]>(
        connections,
        coordinates,
        transformationMatrix
      );

      let isJointElement = false;

      // zuerst die ganze datei transformieren
      const transformedSubFile = transformation.file.transform(subModelLines, {
        transformationMatrix,
        coordinates,
        color,
        fileName
      });

      const transformedSensors = lego.elements.special.transformArray(
        sensors,
        coordinates,
        transformationMatrix
      );

      // const transformedWheels = lego.elements.special.transformArray<WheelElement[]>(
      //   wheels,
      //   coordinates,
      //   transformationMatrix
      // );

      // Elements of subModell
      // Hier checken ob das Untermodell eine Connection mit dem Main modell teilt.
      // Wenn ja dann ist das Untermodell ein lose verbundenes Child des Main modells
      // und muss in den EndPoint eines HingeJoints um beweglich zu sein
      // Für alle Verbindungen des Main Modells
      // for (const cMain of allConnections) {
      //   // Für alle Verbindungen des Child Modells
      //   const { coordinate: mainCoordinate, isMotor: isParentMotor } = cMain;
      //   for (const cChild of transformedConnections) {
      //     // Wenn die Distanz zwischen zwei Verbindungen sehr klein ist wird dies als Connection
      //     // gezählt
      //     const { coordinate: childCoordinate, isMotor: isChildMotor } = cChild;
      //     const { rotation } = cMain;
      //     const distance = transformation.point.distance(mainCoordinate, childCoordinate);

      //     if (distance > 5) {
      //       break;
      //     }

      //     console.log(
      //       "Detected HingeJoint:",
      //       name,
      //       "->",
      //       fileName,
      //       mainCoordinate,
      //       childCoordinate,
      //       transformation.point.transform(childCoordinate, mainCoordinate, transformationMatrix)
      //     );

      //     // Wenn die Distanz klein genug ist wird das Element als HingeJoint von dem Parent
      //     // gespeichert
      //     isJointElement = true;

      //     const transformedHingeJoints = transformHingeJoints(
      //       inlineHingeJoints,
      //       coordinates,
      //       transformationMatrix
      //     );

      //     let motorName: boolean | string = false;

      //     if (isParentMotor || isChildMotor) {
      //       motorName = (name + "_" + fileName).replace(/(\s+|\.ldr)/g, "") + "_" + motorIndex;
      //       motorIndex += 1;
      //     }

      //     hingeJoints.push({
      //       ...files[fileName],
      //       modelLines: transformedSubFile,
      //       specialElements: transformedSensors,
      //       wheels: transformedWheels,
      //       elementInfo: {
      //         coordinate: mainCoordinate,
      //         rotation: rotation
      //       },
      //       hingeJoints: transformedHingeJoints,
      //       connections: transformedConnections,
      //       isMotor: motorName
      //     });
      //   }
      //   // console.log(el);
      // }

      // if (isJointElement) {
      //   continue;
      // }

      // Wenn hier eine Line mit type 1 gematcht wurde ist das aktuelle modell von
      // der gematchten File abhängig, diese wurde vorher im dependencyGraph also
      // zuerst bearbeitet und wurde demnach schon geparsed

      // Hier muss also jetzt das Submodel in das aktuelle Modell eingepflegt werden
      // Wichtig ist auch die Sensor rotationsmatrizen zu updaten und in die sensoren
      // der aktuellen Datei einzufügen

      // console.log(fileName, line, specialElements);

      // Die transformierten Lines an die neuen Lines anhängen
      newLines.push(...transformedSubFile);
      newSpecialElements.push(...transformedSensors);
      // newConnections.push(...transformedConnections);
      // newWheels.push(...transformedWheels);
    }

    model.modelLines = newLines;
    model.sensors = newSpecialElements;
    // model.hingeJoints = hingeJoints;
    // model.wheels = newWheels;

    files[name] = model;
  }

  // console.log(files);

  // Jetzt muss nur noch die Main File zu einem Webots object geparsed werden.
  return files[order[order.length - 1]];
};

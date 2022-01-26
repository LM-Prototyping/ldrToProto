import { matrix } from "mathjs";
import { applyColorToLines } from "../../colors";
import { lego } from "../../lego";
import { specialParts } from "../../lego/elements/special";
import { wheels } from "../../lego/elements/wheels";
import { transformation } from "../../transformation";
import { parseDatFile } from "../dat";
import { LineType1Data } from "../types";
import { getLineData } from "../utils";
import { DependencyNodeDict, FileElementDict } from "./types";
import { deleteFromDependencyGraph, getFileNodes, getNextFileFromDependencyGraph } from "./utils";

export const getFileElements = (files: string[]) => {
  const depencencyGraph = buildDependencyGraph(files);

  let graphWithElements = buildDependencyGraphWithSpecialElements(depencencyGraph);

  const processedFiles = {} as FileElementDict;
  // Reihenfolge der bearbeiteten Modelle speichern um später
  // Child Parent verhältnisse Button Up aufbauen zu können
  // Die File die zuletzt bearbeitet wurde und ganz hinten im Array
  // steht ist die Main file und ist die einzige die am Ende
  // zu einem Webots objekt gemacht werden muss
  const processedFilesOrder = [] as string[];

  console.time();

  while (true) {
    const fileToProcess = getNextFileFromDependencyGraph(graphWithElements);

    if (!fileToProcess) {
      break;
    }

    const { name, file, sensors, connections, wheels } = fileToProcess;

    console.log("File to process", name);

    const modelLines = [] as string[];

    processedFilesOrder.push(name);

    for (const line of file.split("\n")) {
      // In der main file sind nur lines mit lineType 1 relevant für das parsing
      if (line.match(/^[^1]/) || line.length === 0) {
        continue;
      }

      const data = getLineData(line);

      // Hier werde nur Dat files geparsed und keine anderen ldr Modelle
      const parsedFileLineData = parseDatFile(data as LineType1Data);

      if (parsedFileLineData === undefined) {
        modelLines.push(line);
      }

      if (!parsedFileLineData) {
        continue;
      }

      const linesWithAppliedColor = applyColorToLines(parsedFileLineData, data.color);

      modelLines.push(...linesWithAppliedColor);
    }

    processedFiles[name] = { name, sensors, modelLines, connections, wheels };

    graphWithElements = deleteFromDependencyGraph(name, graphWithElements);
  }

  return { order: processedFilesOrder, fileElements: processedFiles };
};

/*
 *  Returns a FileNodeDict, which represents a graph. In the graph the file dependencies are marked as edges between the nodes.
 *  An edge from node A to node B means, that B is dependent of A. Therefore, A needs to be parsed first.
 *  That means, an edge is directed. The edge flows from "dependentBy" to "dependentFrom"
 */
export const buildDependencyGraph = (files: string[]) => {
  const { fileNodes, fileNodeInfos } = getFileNodes(files);

  for (const file of Object.keys(fileNodeInfos)) {
    for (const dependency of fileNodeInfos[file]) {
      fileNodes[file].dependentFrom[dependency] = fileNodes[dependency];
      fileNodes[dependency].dependentBy[file] = fileNodes[file];
    }
  }

  return fileNodes;
};

const buildDependencyGraphWithSpecialElements = (dependencyGraph: DependencyNodeDict) => {
  const newGraph = {} as DependencyNodeDict;

  for (const node of Object.values(dependencyGraph)) {
    const { name, file } = node;

    newGraph[name] = {
      ...node
    };

    for (const line of file.split("\n")) {
      const lineMatch = line.match(
        /^1\s+(#[A-Fa-f\d]{6}|\d+)\s+(-?\d*.?\d*\s+){12}(?<fileName>[\w\d#-_\//]*)\./
      );

      if (!lineMatch || !lineMatch.groups) {
        continue;
      }

      const { fileName } = lineMatch.groups;

      const { transformationMatrix, coordinates, color } = getLineData(line) as LineType1Data;

      if (specialParts[fileName]) {
        const { name: specialElementName, type, internalName } = specialParts[fileName];

        console.log(
          "Found special element: ",
          specialElementName,
          "of type: ",
          type,
          "in submodel",
          name
        );
        const { basePosition, direction } = lego.elements.special.devices[internalName];

        // if (internalName === specialParts[53793].internalName) {
        //   // Touch sensor

        //   // Search for all green connectors
        //   const connectors = [];
        //   let rotationMatrix = transformationMatrix;
        //   for (const line of file.split("\n")) {
        //     const lineMatch = line.match(
        //       /^1\s+(#[A-Fa-f\d]{6}|\d+)\s+(-?\d*.?\d*\s+){12}(?<fileName>[\w\d#-_\//]*)\./
        //     );

        //     if (!lineMatch || !lineMatch.groups) {
        //       continue;
        //     }

        //     const { fileName } = lineMatch.groups;

        //     if (!specialParts[fileName] || specialParts[fileName].internalName !== "technic_pin") {
        //       continue;
        //     }

        //     const {
        //       transformationMatrix: tM,
        //       coordinates,
        //       color
        //     } = getLineData(line) as LineType1Data;

        //     // Color must be green for touch sensor
        //     if (color !== "2") {
        //       continue;
        //     }

        //     connectors.push(coordinates);
        //     rotationMatrix = tM;
        //   }

        //   if (connectors.length != 4) {
        //     console.log("Specifying bounding object for touch sensor only works with 4 pins");
        //     continue;
        //   }

        //   // Connectors müssen immer in einer oberen ecke starten und dann die andere obere ecke nehmen
        //   const sizeX = transformation.point.distance(connectors[0], connectors[1]);
        //   const sizeZ = transformation.point.distance(connectors[0], connectors[3]);

        //   const center = transformation.point.subtract(
        //     coordinates,
        //     transformation.point.add(
        //       connectors[2],
        //       transformation.point.multiply(
        //         transformation.point.subtract(connectors[2], connectors[0]),
        //         0.5
        //       )
        //     )
        //   );

        //   newGraph[name].sensors.push({
        //     name: internalName,
        //     rotation: transformation.matrix.transform(
        //       matrix([
        //         [1, 0, 0],
        //         [0, 0, -1],
        //         [0, 1, 0]
        //       ]),
        //       rotationMatrix
        //     ),
        //     coordinate: transformation.point.transform(center, coordinates, transformationMatrix),
        //     distance: { x: sizeX, z: sizeZ, y: 20 }
        //   });

        //   continue;
        // }

        switch (type) {
          case "sensor": {
            const { basePosition, direction } = lego.elements.special.devices[internalName];

            if (!direction) {
              continue;
            }

            newGraph[name].sensors.push({
              name: internalName,
              // transformation.matrix.transform(
              // rotation: transformationMatrix, // transformation.matrix.transform(
              //   matrix([
              //     [1, 0, 0],
              //     [0, 0, -1],
              //     [0, 1, 0]
              //   ]),
              //   transformationMatrix
              // ),
              coordinate: transformation.point.transform(
                basePosition,
                coordinates,
                transformationMatrix
              ),
              direction: transformation.point.transform(
                transformation.point.add(basePosition, direction),
                coordinates,
                transformationMatrix
              )
            });
            break;
          }
          case "connection": {
            newGraph[name].connections.push({
              rotation: transformation.matrix.transform(
                matrix([
                  [1, 0, 0],
                  [0, 0, 1],
                  [0, -1, 0]
                ]),
                transformationMatrix
              ),
              coordinate: transformation.point.transform(
                basePosition,
                coordinates,
                transformationMatrix
              ),
              // direction: transformation.point.transform(
              //   direction,
              //   coordinates,
              //   transformationMatrix
              // ),
              isMotor: color === "4"
            });
          }
        }
      }

      if (wheels[fileName]) {
        const { height, radius, coordinate } = wheels[fileName];

        console.log(
          "Wheel transformation",
          transformation.matrix.transform(
            matrix([
              [1, 0, 0],
              [0, 0, 1],
              [0, -1, 0]
            ]),
            transformationMatrix
          ),
          {
            auxilierDirection: transformation.point.transform(
              transformation.point.add(coordinate, { x: 0, y: 0, z: 1 }),
              coordinates,
              transformationMatrix
            )
          }
        );

        newGraph[name].wheels.push({
          rotation: transformation.matrix.transform(
            matrix([
              [1, 0, 0],
              [0, 0, 1],
              [0, -1, 0]
            ]),
            transformationMatrix
          ),
          // direction: transformation.point.transform(
          //   transformation.point.add(basePosition, direction),
          //   coordinates,
          //   transformationMatrix
          // ),
          direction: transformation.point.transform(
            transformation.point.add(coordinate, { x: 0, y: 1, z: 0 }),
            coordinates,
            transformationMatrix
          ),
          auxilierDirection: transformation.point.transform(
            transformation.point.add(coordinate, { x: 0, y: 0, z: 1 }),
            coordinates,
            transformationMatrix
          ),
          coordinate: transformation.point.transform(coordinate, coordinates, transformationMatrix),
          height,
          radius
        });
      }
    }
  }

  return newGraph;
};

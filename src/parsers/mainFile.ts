import {
  buildDependencyGraph,
  deleteFromDependencyGraph,
  getNextFileFromDependencyGraph
} from "./dependencyGraph";
import { getLineData } from "./utils";
import { applyColorToLines } from "../colors";
import fs from "fs";
import { HingeJointElement, LineType1Data, ProcessedFilesDict } from "./types";
import { createIndexedFaceSetFromFile } from "../webots/indexedFaceSet";
import { transformation } from "../transformation";
import { lego } from "../lego";
import { parseDatFile } from "./dat";
import { ConnectionElement, WheelElement, WheelPart } from "../lego/types";

/*
 * Parse main file. In the main .ldr file only other files ar included and groups are created.
 *  Each group will represent a seperate obj file at the end
 */
const parseMainFile = (fileContent: string) => {
  // Checken ob in der aktuellen File mehrere Files definiert sind
  const files = [];

  if (!fileContent.match(/(^|\n)0\s+FILE/g)) {
    files.push("0 FILE main.ldr\r\n" + fileContent + "0 NOFILE \r\n");
  } else {
    const fileStartRegex = /(^|\n)0\s+FILE\s(?<fileName>[\w\w\s]*)/;
    const fileEndRegex = /(^|\n)0\s+NOFILE/;

    let subFile = [];
    let matchingFile = false;

    for (const line of fileContent.split("\n")) {
      // Prevents empty lines
      if (!line.match(/^\d+/)) {
        continue;
      }

      const matchStart = !!line.match(fileStartRegex);
      const matchEnd = !!line.match(fileEndRegex);

      if (matchStart && matchingFile) {
        throw new Error("Found nested files");
      } else if (matchEnd && !matchingFile) {
        throw new Error("Found end of file out of file");
      }

      subFile.push(line);

      if (matchStart) {
        matchingFile = true;
      } else if (matchEnd) {
        matchingFile = false;
        files.push(subFile.join("\n"));
        subFile = [];
      }
    }
  }

  const dependencyGraph = buildDependencyGraph(files);

  let graphWithSpecialElements = lego.elements.special.extractFromDependecyGraph(dependencyGraph);

  console.log(graphWithSpecialElements);

  const processedFiles = {} as ProcessedFilesDict;
  // Reihenfolge der bearbeiteten Modelle speichern um später
  // Child Parent verhältnisse Button Up aufbauen zu können
  // Die File die zuletzt bearbeitet wurde und ganz hinten im Array
  // steht ist die Main file und ist die einzige die am Ende
  // zu einem Webots objekt gemacht werden muss
  const processedFilesOrder = [] as string[];

  console.time();

  while (true) {
    const fileToProcess = getNextFileFromDependencyGraph(graphWithSpecialElements);

    if (!fileToProcess) {
      break;
    }

    const { name, file, specialElements, connections, wheels } = fileToProcess;

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

    processedFiles[name] = { name, specialElements, modelLines, connections, wheels };

    graphWithSpecialElements = deleteFromDependencyGraph(name, graphWithSpecialElements);
  }

  console.timeEnd();

  for (const name of processedFilesOrder) {
    // Hier Untermodelle Button up einfügen und ggf Transformationen durchführen

    const model = processedFiles[name];

    if (!model) {
      continue;
    }

    const {
      modelLines,
      specialElements: allSpecialElements,
      connections: allConnections,
      wheels: allWheels
    } = model;
    const newLines = [];
    const newSpecialElements = [...allSpecialElements];
    const newConnections = [...allConnections];
    const hingeJoints = [] as HingeJointElement[];
    const newWheels = [...allWheels] as WheelElement[];

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

      if (!processedFiles[fileName]) {
        continue;
      }

      const {
        modelLines: subModelLines,
        specialElements,
        connections,
        wheels
      } = processedFiles[fileName];

      const transformedConnections = lego.elements.special.transformArray<ConnectionElement[]>(
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

      const transformedSpecialElements = lego.elements.special.transformArray(
        specialElements,
        coordinates,
        transformationMatrix
      );
      // Elements of subModell
      // Hier checken ob das Untermodell eine Connection mit dem Main modell teilt.
      // Wenn ja dann ist das Untermodell ein lose verbundenes Child des Main modells
      // und muss in den EndPoint eines HingeJoints um beweglich zu sein
      // Für alle Verbindungen des Main Modells
      for (const cMain of newConnections) {
        // Für alle Verbindungen des Child Modells
        const { coordinate: mainCoordinate } = cMain;
        for (const cChild of transformedConnections) {
          // Wenn die Distanz zwischen zwei Verbindungen sehr klein ist wird dies als Connection
          // gezählt
          const { coordinate: childCoordinate } = cChild;
          const { rotation } = cMain;
          const distance = transformation.point.distance(mainCoordinate, childCoordinate);

          console.log(
            "Detected HingeJoint:",
            name,
            "->",
            fileName,
            mainCoordinate,
            childCoordinate,
            transformation.point.transform(childCoordinate, mainCoordinate, transformationMatrix)
          );

          if (distance > 5) {
            break;
          }

          // Wenn die Distanz klein genug ist wird das Element als HingeJoint von dem Parent
          // gespeichert
          isJointElement = true;

          hingeJoints.push({
            ...processedFiles[fileName],
            modelLines: transformedSubFile,
            specialElements: transformedSpecialElements,
            elementInfo: {
              coordinate: mainCoordinate,
              rotation: rotation
            }
          });
        }
        // console.log(el);
      }

      if (isJointElement) {
        continue;
      }

      const transformedWheels = lego.elements.special.transformArray<WheelElement[]>(
        wheels,
        coordinates,
        transformationMatrix
      );

      // Wenn hier eine Line mit type 1 gematcht wurde ist das aktuelle modell von
      // der gematchten File abhängig, diese wurde vorher im dependencyGraph also
      // zuerst bearbeitet und wurde demnach schon geparsed

      // Hier muss also jetzt das Submodel in das aktuelle Modell eingepflegt werden
      // Wichtig ist auch die Sensor rotationsmatrizen zu updaten und in die sensoren
      // der aktuellen Datei einzufügen

      // console.log(fileName, line, specialElements);

      // Die transformierten Lines an die neuen Lines anhängen
      newLines.push(...transformedSubFile);
      newSpecialElements.push(...transformedSpecialElements);
      newConnections.push(...transformedConnections);
      newWheels.push(...transformedWheels);
    }

    model.modelLines = newLines;
    model.specialElements = newSpecialElements;
    model.hingeJoints = hingeJoints;

    processedFiles[name] = model;
  }

  console.log(processedFiles);

  // Jetzt muss nur noch die Main File zu einem Webots object geparsed werden.
  const mainFile = processedFiles[processedFilesOrder[processedFilesOrder.length - 1]];
  console.log("Start parsing main file", mainFile.name);

  const { modelLines, specialElements, hingeJoints, wheels } = mainFile;

  const indexedFaceSet = createIndexedFaceSetFromFile(
    modelLines,
    specialElements,
    hingeJoints,
    wheels
  );

  const robotShape = indexedFaceSet.replace("Solid", "Robot");

  fs.writeFileSync("../LeoCAD/test.txt", robotShape);

  // TODO
  // const decodedFiles = decodeFiles(files)

  // for (const file of files) {
  //   for (const line of file.split("\n")) {
  //     console.log(getLineData(line));
  //   }
  // }

  // Im ersten Schritt verschiedene Files matchen
};

export default parseMainFile;

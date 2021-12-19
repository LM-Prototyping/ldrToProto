import {
  buildDependencyGraph,
  deleteFromDependencyGraph,
  getNextFileFromDependencyGraph
} from "./dependencyGraph";
import { getLineData } from "./utils";
import { applyColorToLines } from "../colors";
import fs from "fs";
import { parseDatFile } from "./parseDatFile";
import { LineType1Data } from "./types";
import { createIndexedFaceSetFromFile } from "../webots/indexedFaceSet";
import { transformation } from "../transformation";
import { lego } from "../lego";

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

  // console.log(graphWithSpecialElements);

  const processedFiles = {} as { [key: string]: any };
  // Reihenfolge der bearbeiteten Modelle speichern um später
  // Child Parent verhältnisse Button Up aufbauen zu können
  // Die File die zuletzt bearbeitet wurde und ganz hinten im Array
  // steht ist die Main file und ist die einzige die am Ende
  // zu einem Webots objekt gemacht werden muss
  const processedFilesOrder = [] as string[];

  while (true) {
    const fileToProcess = getNextFileFromDependencyGraph(graphWithSpecialElements);

    if (!fileToProcess) {
      break;
    }

    const { name, file, specialElements } = fileToProcess;

    const modelLines = [] as string[];

    processedFilesOrder.push(name);

    for (const line of file.split("\n")) {
      // In der main file sind nur lines mit lineType 1 relevant für das parsing
      if (line.match(/^[^1]/) || line.length === 0) {
        continue;
      }

      const data = getLineData(line);

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

    processedFiles[name] = { name, specialElements, modelLines };

    graphWithSpecialElements = deleteFromDependencyGraph(name, graphWithSpecialElements);
  }

  for (const name of processedFilesOrder) {
    // Hier Untermodelle Button up einfügen und ggf Transformationen durchführen

    const model = processedFiles[name];

    if (!model) {
      continue;
    }

    const { modelLines, specialElements: oldSpecialElements } = model;
    const newLines = [];
    const newSpecialElements = [...oldSpecialElements];

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

      const { modelLines: subModelLines, specialElements } = processedFiles[fileName];

      // Wenn hier eine Line mit type 1 gematcht wurde ist das aktuelle modell von
      // der gematchten File abhängig, diese wurde vorher im dependencyGraph als
      // zuerst bearbeitet und wurde demnach schon geparsed

      // Hier muss also jetzt das Submodel in das aktuelle Modell eingepflegt werden
      // Wichtig ist auch die Sensor rotationsmatrizen zu updaten und in die sensoren
      // der aktuellen Datei einzufügen

      // console.log(fileName, line, specialElements);

      // zuerst die ganze datei transformieren
      const transformedSubFile = transformation.file.transform(subModelLines, {
        transformationMatrix,
        coordinates,
        color,
        fileName
      });

      // Die transformierten Lines an die neuen Lines anhängen
      newLines.push(...transformedSubFile);

      newSpecialElements.push(
        ...lego.elements.special.transformArray(specialElements, coordinates, transformationMatrix)
      );
    }

    model.modelLines = newLines;
    model.specialElements = newSpecialElements;

    processedFiles[name] = model;
  }

  // console.log(processedFiles);

  const { modelLines, specialElements } =
    processedFiles[processedFilesOrder[processedFilesOrder.length - 1]];

  const fileInRealCoordinates = transformation.file.toReal(modelLines);

  const indexedFaceSet = createIndexedFaceSetFromFile(fileInRealCoordinates, specialElements);

  // console.log(indexedFaceSet);

  fs.writeFileSync("../LeoCAD/test.txt", indexedFaceSet);

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

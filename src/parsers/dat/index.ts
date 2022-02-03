import fs from "fs";
import { applyColorToLines, getOriginalColorForInlineFile } from "../../colors";
import { configuration } from "../../configuration";
import { Globals } from "../../global";
import { lego } from "../../lego";
import { wheels } from "../../lego/elements/wheels";
import { performance } from "../../performanceLevel";
import { transformation } from "../../transformation";
import { Dict } from "../../types";
import { LineType1Data } from "../types";
import { getLineData } from "../utils";
import { readDatFile } from "./read";

const cache: Dict<string | undefined> = {};

// TODO rekursiv modellieren
// Applied keine Farben
export const parseDatFile = (lineData: LineType1Data): string[] | undefined | null => {
  const { fileName } = lineData;

  if (fileName.match(configuration.brickPi.fileName) && configuration.brickPi.required) {
    console.log("Found BrickPi");
    Globals.brickPiExisting = true;
  }

  // Ab performanceLevel 1 werden Bauteile entfernt
  if (fileName.match(lego.elements.ignore.regexp) && performance.shouldRemoveIgnoreFiles()) {
    // console.log("match ", fileName.match(lego.elements.ignore.regexp));
    return null;
  }

  if (
    performance.shouldReplaceWheels() &&
    Object.keys(wheels).reduce((all, k) => all || !!fileName.match(k), false)
  ) {
    return null;
  }

  if (!cache[fileName]) {
    cache[fileName] = readDatFile(fileName);
  }

  const fileData = cache[fileName];

  if (!fileData) {
    return undefined;
  }

  const newFileData = [];

  for (const line of fileData.split("\n")) {
    const lineTypeMatch = line.match(/^\d+/);

    if (!lineTypeMatch || ["5", "0", "2"].includes(lineTypeMatch[0])) {
      continue;
    }

    const lineType = lineTypeMatch[0];

    if (lineType !== "1") {
      const transformedLineData = transformation.line.transform(
        lineType,
        getLineData(line),
        lineData
      );

      newFileData.push(transformedLineData);
    } else {
      const sublineData = getLineData(line) as LineType1Data;
      const subFileData = parseDatFile(sublineData);

      if (subFileData === undefined) {
        newFileData.push(line);
      }

      if (!subFileData) {
        continue;
      }

      const transformedSubFile = transformation.file.transform(subFileData, lineData);
      const transformedFileWithAppliedColors = applyColorToLines(
        transformedSubFile,
        performance.shouldApplyColorToFile() ? sublineData.color : "16",
        getOriginalColorForInlineFile
      );

      newFileData.push(...transformedFileWithAppliedColors);
    }
  }

  return newFileData;
};

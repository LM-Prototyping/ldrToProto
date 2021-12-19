import { Constants } from "../constants";
import { LineType1Data } from "./types";

import fs from "fs";
import { getLineData } from "./utils";
import { transformation } from "../transformation";
import { applyColorToLines, getOriginalColorForInlineFile } from "../colors";
import { lego } from "../lego";

const readDatFile = (fileName: string) => {
  for (const filePath of Constants.PARTS_LIBRARY_DIRS.map(
    (dir) => Constants.PARTS_LIBRARY_BASE_PATH + dir
  )) {
    try {
      return fs.readFileSync(filePath + "/" + fileName.toLowerCase(), "utf8");
    } catch (e) {}
  }

  console.log("Cannot read file", fileName);

  return undefined;
};

// TODO rekursiv modellieren
// Applied keine Farben
export const parseDatFile = (lineData: LineType1Data): string[] | undefined | null => {
  const { fileName } = lineData;

  if (fileName.match(lego.elements.ignore.regexp)) {
    // console.log("match ", fileName.match(lego.elements.ignore.regexp));
    return null;
  }

  const fileData = readDatFile(fileName);

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
        sublineData.color,
        getOriginalColorForInlineFile
      );

      newFileData.push(...transformedFileWithAppliedColors);
    }
  }

  return newFileData;
};

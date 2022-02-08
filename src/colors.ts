import fs from "fs";
import { configuration } from "./configuration";

import { Color, ColorsDict } from "./parsers/types";

const parseColors = () => {
  const fileContent = fs.readFileSync(
    configuration.directories.legoPartsLibrary.basePath +
      configuration.directories.legoPartsLibrary.colors,
    "utf8"
  );

  const colors: ColorsDict = {};

  const matchColorRegex =
    /^0\s+!COLOUR\s+(?<name>\w+)\s+CODE\s+(?<code>\d+)\s+VALUE\s+(?<value>#[\dA-F]{6})\s+EDGE\s+(?<edgeColor>#[\dA-F]{6})/;

  for (const line of fileContent.split("\n")) {
    const match = line.trim().match(matchColorRegex);

    if (!match) {
      continue;
    }

    const { code, value, name, edgeColor } = match.groups as unknown as Color;

    colors[code] = {
      value,
      name,
      edgeColor,
      code
    };
  }

  return colors;
};

export const colors = parseColors();

export const applyColorToLines = (
  lines: string[],
  color: string,
  applyColor: (l: string, p: string) => string = getOriginalColor
) => {
  return lines.map((l) => {
    const lineSplitted = l.split(/\s+/g);

    if (!lineSplitted || lineSplitted.length < 2) {
      return "";
    }

    const newColor = applyColor(lineSplitted[1], color);

    lineSplitted[1] = newColor;

    return lineSplitted.join(" ");
  });
};

export const getOriginalColorForInlineFile = (lineColorCode: string, parentColorCode: string) => {
  if (["16", "24"].includes(parentColorCode)) {
    return lineColorCode;
  }

  return getOriginalColor(lineColorCode, parentColorCode);
};

export const getOriginalColor = (lineColorCode: string, originalColor: string) => {
  if (lineColorCode.match(/^#[A-F\d]{6}/)) {
    return lineColorCode;
  }

  if (lineColorCode === "16") {
    return colors[originalColor].value;
  }
  if (lineColorCode === "24") {
    return colors[originalColor].edgeColor;
  }

  return colors[lineColorCode].value;
};


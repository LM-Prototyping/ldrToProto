import fs from "fs";
import { configuration } from "../../configuration";

export const readDatFile = (fileName: string) => {
  for (const filePath of configuration.directories.legoPartsLibrary.dirs.map(
    (dir) => configuration.directories.legoPartsLibrary.basePath + dir
  )) {
    try {
      return fs.readFileSync(filePath + "/" + fileName.toLowerCase(), "utf8");
    } catch (e) {}
  }

  return undefined;
};


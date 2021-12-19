import { Constants } from "../../constants";
import fs from "fs";

export const readDatFile = (fileName: string) => {
  for (const filePath of Constants.PARTS_LIBRARY_DIRS.map(
    (dir) => Constants.PARTS_LIBRARY_BASE_PATH + dir
  )) {
    try {
      return fs.readFileSync(filePath + "/" + fileName.toLowerCase(), "utf8");
    } catch (e) {}
  }

  return undefined;
};

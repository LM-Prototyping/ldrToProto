import { ArgumentParser } from "argparse";
import fs from "fs";

import { matrix } from "mathjs";

import { Constants } from "./constants";
import { colors } from "./colors";
import parseMainFile from "./parsers/mainFile";

const parseArguments = () => {
  const parser = new ArgumentParser();

  parser.add_argument("-f", "--file", {
    help: "Path to the file you want to parse. Either absolute or relative",
    required: true
  });

  return parser.parse_args();
};

const readFile = (filePath: string) => {
  const fileContent = fs.readFileSync(filePath, "utf8");

  return fileContent;
};

const main = () => {
  // read main file to start parsing

  const { file } = parseArguments();

  const fileContent = readFile(file);

  console.log(parseMainFile(fileContent));

  // console.log(
  //   applyTransformationToPoint(
  //     { x: 1, y: 1, z: 1 },
  //     { x: 4, y: 5, z: 7 },
  //     matrix([
  //       [1, 0, 2],
  //       [2, 3, 1],
  //       [1, 0, 1]
  //     ])
  //   )
  // );
};

main();

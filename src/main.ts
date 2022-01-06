import { ArgumentParser } from "argparse";
import fs from "fs";

import { matrix } from "mathjs";

import { Constants } from "./constants";
import { colors } from "./colors";
import parseMainFile from "./parsers/mainFile";
import { webots } from "./webots";

const parseArguments = () => {
  const parser = new ArgumentParser();

  parser.add_argument("-f", "--file", {
    help: "Path to the file you want to parse. Either absolute or relative",
    required: true
  });
  parser.add_argument("-p", "--protoName", {
    help: "Name of the created proto file",
    default: "LegoMindstormRoboterProto"
  });
  parser.add_argument("-w", "--webotsPath", {
    help: "Path to the webots directory (Not proto directory!)",
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

  const { file, protoName, webotsPath } = parseArguments();

  const fileContent = readFile(file);

  const processedFile = parseMainFile(fileContent);

  const protoString = webots.proto.createFromFile(processedFile, protoName);

  fs.writeFileSync(webotsPath + "/protos/" + protoName + ".proto", protoString);
};

main();

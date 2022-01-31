import { ArgumentParser } from "argparse";
import fs from "fs";

import { parseLdrFile } from "./parsers/ldr";
import { reduceFileElements } from "./parsers/reduceFileElements";
import { getFileElements } from "./parsers/dependencyGraph";
import { webots } from "./webots";

const parseArguments = () => {
  const parser = new ArgumentParser();

  parser.add_argument("-f", "--file", {
    help: "Path to the file you want to parse. Either absolute or relative",
    required: true
  });
  parser.add_argument("-n", "--protoName", {
    help: "Name of the created proto file",
    default: "LegoMindstormRoboterProto"
  });
  parser.add_argument("-w", "--webotsPath", {
    help: "Path to the webots directory (Not proto directory!)",
    required: true
  });
  parser.add_argument("-r", "--createRobot", {
    help: "Wether or not a roboter node should be created, if false a solid node will be created",
    required: false,
    default: true
  });

  return parser.parse_args();
};

const readFile = (filePath: string) => {
  const fileContent = fs.readFileSync(filePath, "utf8");

  return fileContent;
};

const main = () => {
  // read main file to start parsing

  const { file, protoName, webotsPath, createRobot } = parseArguments();

  const shouldCreateRobot = createRobot === "true";

  console.log(file, protoName, webotsPath, createRobot);

  const fileContent = fs.readFileSync(file, "utf8");

  const filesAsString = parseLdrFile(fileContent);

  const { order, fileElements } = getFileElements(filesAsString);

  // console.log(fileElements);

  const mainFile = reduceFileElements(order, fileElements);

  const protoString = webots.proto.createFromFile(mainFile, protoName);

  fs.writeFileSync(webotsPath + "/protos/" + protoName + ".proto", protoString);
};

main();

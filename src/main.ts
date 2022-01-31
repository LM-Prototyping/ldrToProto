import { ArgumentParser } from "argparse";
import fs from "fs";

import { parseLdrFile } from "./parsers/ldr";
import { reduceFileElements } from "./parsers/reduceFileElements";
import { getFileElements } from "./parsers/dependencyGraph";
import { webots } from "./webots";
import { fileToShape } from "./webots/fileToShape";

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
    help: `Path to the webots directory (Not proto directory!). If 'createProto' is True, the proto will be stored in the /proto directory of 'webotsPath'. When 'createProto' is false, the solid will be appended to the specified world file.`,
    required: true
  });
  parser.add_argument("-p", "--createProto", {
    help: "Wether or not a proto node should be created, if false a file containing the robot will be created",
    required: false,
    default: "true"
  });
  parser.add_argument("-world", "--worldFile", {
    help: "Specifies the world file in with the robot should be stored if no proto is created.",
    required: false,
    default: ""
  });

  return parser.parse_args();
};

const readFile = (filePath: string) => {
  const fileContent = fs.readFileSync(filePath, "utf8");

  return fileContent;
};

const main = () => {
  // read main file to start parsing

  const { file, protoName, webotsPath, createProto, worldFile } = parseArguments();

  console.log("WORLD", worldFile);

  const shouldCreateProto = createProto === "true";

  if (!shouldCreateProto && worldFile.length <= 0) {
    console.error("When no proto should be created a world file needs to be specified");
    return 1;
  }

  const fileContent = fs.readFileSync(file, "utf8");

  const filesAsString = parseLdrFile(fileContent);

  const { order, fileElements } = getFileElements(filesAsString);

  // console.log(fileElements);

  const robot = webots.robot(order, fileElements);

  if (shouldCreateProto) {
    const protoString = webots.proto.createFromFile(robot, protoName);
    fs.writeFileSync(webotsPath + "/protos/" + protoName + ".proto", protoString);
  } else {
    console.log("appending", webotsPath + "/worlds/" + worldFile);
    fs.appendFileSync(webotsPath + "/worlds/" + worldFile, robot);
  }
};

main();

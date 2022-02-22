import { ArgumentParser } from "argparse";
import fs from "fs";

import { parseLdrFile } from "./parsers/ldr";
import { getFileElements } from "./parsers/dependencyGraph";
import { webots } from "./webots";
import { configuration } from "./configuration";
import { Globals } from "./global";
import { printDevicesOverview, writeDeviceInfoXML } from "./utils";

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
    required: false,
    default: configuration.directories.webots
  });
  parser.add_argument("-p", "--createProto", {
    help: "Wether or not a proto node should be created, if false a file containing the robot will be created",
    required: false,
    default: "true"
  });
  parser.add_argument("-world", "--worldFile", {
    help: "Specifies the world file in which the robot should be stored if no proto is created.",
    required: false,
    default: ""
  });
  parser.add_argument("-performance", "--performanceLevel", {
    help: "Specifies how exact the model should be parsed. The lower the level, the less adjustments are made at the model.",
    required: false,
    default: "1",
    choices: ["0", "1", "2", "3", "4"]
  });

  return parser.parse_args();
};

const main = () => {
  // read main file to start parsing

  const { file, protoName, webotsPath, createProto, worldFile, performanceLevel } =
    parseArguments();

  Globals.performanceLevel = Number(performanceLevel);
  const shouldCreateProto = createProto === "true";

  if (!shouldCreateProto && worldFile.length <= 0) {
    console.error("When no proto should be created a world file needs to be specified");
    return 1;
  }

  const fileContent = fs.readFileSync(file, "utf8");

  const filesAsString = parseLdrFile(fileContent);

  const { order, fileElements } = getFileElements(filesAsString);

  // Check if BrickPi is required and exists
  if (configuration.brickPi.required && !Globals.brickPiExisting) {
    console.log("BrickPi is required but does not exist in the current model");
    return;
  }

  // console.log(fileElements);

  const { robot, devicesOnPorts } = webots.robot(order, fileElements, protoName);

  // Create proto file or append to world file
  if (shouldCreateProto) {
    const protoString = webots.proto.createFromFile(robot, protoName);
    fs.writeFileSync(webotsPath + "/protos/" + protoName + ".proto", protoString);
  } else {
    console.log("appending", webotsPath + "/worlds/" + worldFile);
    fs.appendFileSync(webotsPath + "/worlds/" + worldFile, robot);
  }

  // Create ports configuration file
  printDevicesOverview(devicesOnPorts);
  writeDeviceInfoXML(devicesOnPorts, protoName);
};

main();

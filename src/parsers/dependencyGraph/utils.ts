import { LineType1Data } from "../types";
import { getLineData } from "../utils";
import { DependencyNodeInfo, DependencyNodeDict } from "./types";

export const getNextFileFromDependencyGraph = (dependencyGraph: DependencyNodeDict) =>
  Object.values(dependencyGraph).sort(
    (a, b) => Object.keys(a.dependentFrom).length - Object.keys(b.dependentFrom).length
  )[0];

export const deleteFromDependencyGraph = (
  name: string,
  dependencyGraph: DependencyNodeDict
): DependencyNodeDict => {
  const newGraph = { ...dependencyGraph };

  delete newGraph[name];

  for (const node of Object.keys(newGraph)) {
    delete newGraph[node].dependentBy[name];
    delete newGraph[node].dependentFrom[name];
  }

  return newGraph;
};

export const getFileNodes = (files: string[]) => {
  const fileNodeInfos = [] as DependencyNodeInfo[];
  const fileNodes = {} as DependencyNodeDict;

  for (const file of files) {
    const lines = file.split("\n");

    // Filename is declared in the first line
    const fileNameMatch = lines[0].match(/^0\s+FILE\s+(?<fileName>[\w\s\d#\.]*)/);

    if (!fileNameMatch || !fileNameMatch.groups || !fileNameMatch.groups.fileName) {
      continue;
    }

    const fileName = fileNameMatch.groups.fileName.replace(/\r/g, "");

    const dependentFiles = getDependentFilesFromLines(lines);

    fileNodeInfos.push({
      name: fileName,
      callsFiles: dependentFiles
    });

    fileNodes[fileName] = {
      name: fileName,
      file,
      dependentBy: {},
      dependentFrom: {},

      sensors: [],
      wheels: [],
      connections: []
    };
  }

  const fileNodeInfosCleaned = removeRemoteFiles(fileNodeInfos);

  const fileNodeInfosDict = fileNodeInfosCleaned.reduce(
    (all, { name, callsFiles }) => ({ ...all, [name]: callsFiles }),
    {} as { [key: string]: string[] }
  );

  return { fileNodeInfos: fileNodeInfosDict, fileNodes };
};

const getDependentFilesFromLines = (lines: string[]) =>
  lines.reduce((files, line) => {
    if (line.match(/^[^1]/) || line.length === 0) {
      return files;
    }

    const { fileName } = getLineData(line) as LineType1Data;

    files.push(fileName);

    return files;
  }, [] as string[]);

const removeRemoteFiles = (files: DependencyNodeInfo[]) => {
  const newFiles = [] as DependencyNodeInfo[];

  for (const file of files) {
    const { name, callsFiles } = file;

    newFiles.push({
      name,
      callsFiles: callsFiles.filter(
        (fileName) => files.filter(({ name }) => name === fileName).length !== 0
      )
    });
  }

  return newFiles;
};

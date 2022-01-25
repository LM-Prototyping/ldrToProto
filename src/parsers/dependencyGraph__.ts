// import { FileNodeWithSpecialElementsDict } from "../lego/types";
// import { FileNodeDict, FileNodeInfo, LineType1Data } from "./types";
// import { getLineData } from "./utils";

// const getDependentFilesFromLines = (lines: string[]) =>
//   lines.reduce((files, line) => {
//     if (line.match(/^[^1]/) || line.length === 0) {
//       return files;
//     }

//     const { fileName } = getLineData(line) as LineType1Data;

//     files.push(fileName);

//     return files;
//   }, [] as string[]);

// const removeRemoteFiles = (files: FileNodeInfo[]) => {
//   const newFiles = [] as FileNodeInfo[];

//   for (const file of files) {
//     const { name, callsFiles } = file;

//     newFiles.push({
//       name,
//       callsFiles: callsFiles.filter(
//         (fileName) => files.filter(({ name }) => name === fileName).length !== 0
//       )
//     });
//   }

//   return newFiles;
// };

// const getFileNodes = (files: string[]) => {
//   const fileNodeInfos = [] as FileNodeInfo[];
//   const fileNodes = {} as FileNodeDict;

//   for (const file of files) {
//     const lines = file.split("\n");

//     // Filename is declared in the first line
//     const fileNameMatch = lines[0].match(/^0\s+FILE\s+(?<fileName>[\w\s\d#\.]*)/);

//     if (!fileNameMatch || !fileNameMatch.groups || !fileNameMatch.groups.fileName) {
//       continue;
//     }

//     const fileName = fileNameMatch.groups.fileName.replace(/\r/g, "");

//     const dependentFiles = getDependentFilesFromLines(lines);

//     fileNodeInfos.push({
//       name: fileName,
//       callsFiles: dependentFiles
//     });

//     fileNodes[fileName] = {
//       name: fileName,
//       file,
//       dependentBy: {},
//       dependentFrom: {}
//     };
//   }

//   const fileNodeInfosCleaned = removeRemoteFiles(fileNodeInfos);

//   const fileNodeInfosDict = fileNodeInfosCleaned.reduce(
//     (all, { name, callsFiles }) => ({ ...all, [name]: callsFiles }),
//     {} as { [key: string]: string[] }
//   );

//   return { fileNodeInfos: fileNodeInfosDict, fileNodes };
// };

// /*
//  *  Returns a FileNodeDict, which represents a graph. In the graph the file dependencies are marked as edges between the nodes.
//  *  An edge from node A to node B means, that B is dependent of A. Therefore, A needs to be parsed first.
//  *  That means, an edge is directed. The edge flows from "dependentBy" to "dependentFrom"
//  */
// export const buildDependencyGraph = (files: string[]) => {
//   const { fileNodes, fileNodeInfos } = getFileNodes(files);

//   for (const file of Object.keys(fileNodeInfos)) {
//     for (const dependency of fileNodeInfos[file]) {
//       fileNodes[file].dependentFrom[dependency] = fileNodes[dependency];
//       fileNodes[dependency].dependentBy[file] = fileNodes[file];
//     }
//   }

//   return fileNodes;
// };

// export const getNextFileFromDependencyGraph = (dependencyGraph: FileNodeWithSpecialElementsDict) =>
//   Object.values(dependencyGraph).sort(
//     (a, b) => Object.keys(a.dependentFrom).length - Object.keys(b.dependentFrom).length
//   )[0];

// export const deleteFromDependencyGraph = (
//   name: string,
//   dependencyGraph: FileNodeWithSpecialElementsDict
// ) => {
//   const newGraph = { ...dependencyGraph };

//   delete newGraph[name];

//   for (const node of Object.keys(newGraph)) {
//     delete newGraph[node].dependentBy[name];
//     delete newGraph[node].dependentFrom[name];
//   }

//   return newGraph;
// };

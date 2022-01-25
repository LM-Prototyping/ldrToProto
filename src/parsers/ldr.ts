export const parseLdrFile = (fileContent: string): string[] => {
  // Checken ob in der aktuellen File mehrere Files definiert sind
  if (!fileContent.match(/(^|\n)0\s+FILE/g)) {
    // Wenn nicht wrappe Filecontent in LDR File identifier
    return ["0 FILE main.ldr\r\n" + fileContent + "0 NOFILE \r\n"];
  }

  const files = [];

  const fileStartRegex = /(^|\n)0\s+FILE\s(?<fileName>[\w\w\s]*)/;
  const fileEndRegex = /(^|\n)0\s+NOFILE/;

  let subFile = [];
  let matchingFile = false;

  for (const line of fileContent.split("\n")) {
    // Prevents empty lines
    if (!line.match(/^\d+/)) {
      continue;
    }

    const matchStart = !!line.match(fileStartRegex);
    const matchEnd = !!line.match(fileEndRegex);

    if (matchStart && matchingFile) {
      throw new Error("Found nested files");
    } else if (matchEnd && !matchingFile) {
      throw new Error("Found end of file out of file");
    }

    // Jede line aus einer File zur
    // aktuellen Subfile hinzufügen
    subFile.push(line);

    if (matchStart) {
      matchingFile = true;
    } else if (matchEnd) {
      // Am ende jeder File alle lines als string
      // an aktuelle Files hinzufügen
      matchingFile = false;
      files.push(subFile.join("\n"));
      subFile = [];
    }
  }

  return files;
};

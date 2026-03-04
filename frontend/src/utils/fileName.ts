// Delete file name extension: fileName.txt -> fileName

export const getDownloadFilename = (originalName: string) => {
  const hasExtension = /\.[^./\\]+$/.test(originalName);
  return hasExtension
    ? originalName.slice(
        0,
        -1 * ((originalName.split(".").pop()?.length || 0) + 1),
      )
    : originalName;
};

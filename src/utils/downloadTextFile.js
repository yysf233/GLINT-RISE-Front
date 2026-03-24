export function downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
  if (typeof document === "undefined") {
    return;
  }

  const blob = new Blob([String(content ?? "")], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename || "download.txt";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default downloadTextFile;

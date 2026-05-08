const major = Number.parseInt(process.versions.node.split(".")[0], 10);

// Expo SDK 54 is stable on LTS majors (20/22). Newer majors can break CLI internals.
if (major < 20 || major > 22) {
  console.error(
    [
      "",
      "Unsupported Node.js version for this project.",
      `Current: v${process.versions.node}`,
      "Required: Node.js 20.x or 22.x (LTS).",
      "Tip: switch Node version and run npm install again.",
      "",
    ].join("\n")
  );
  process.exit(1);
}

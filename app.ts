const hasArg = (name: string) => process.argv.includes(name);

if (hasArg("--jsxp")) {
  const { createServer } = await import("jsxp");
  createServer();
} else {
  const { start } = await import("alemonjs");
  start("src/index.ts");
}

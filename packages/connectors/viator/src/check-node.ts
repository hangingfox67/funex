const [major] = process.versions.node.split('.').map(Number);
if (major < 22) {
  console.error(
    `FATAL: Node >=22 required (running ${process.version}).` +
    `\n  Fix: nvm use 22   (or install via nodesource)` +
    `\n  Repo has .nvmrc — run 'nvm use' in the project root.`,
  );
  process.exit(1);
}

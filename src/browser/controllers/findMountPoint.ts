// Locates the element the application renders into (#app in index.html).
export function findMountPoint(): HTMLElement {
  const root = document.getElementById("app");
  if (root === null) throw new Error("index.html has no #app element");
  return root;
}

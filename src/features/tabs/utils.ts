export function isTabRouteFile(file: string) {
  return file.includes('$tab-');
}

export function getTabKeyFromFile(file: string) {
  return file.match(/\$tab-([^.]+)/)![1];
}

export function getHostForTabRouteFile(file: string) {
  return file.replace(/\$tab-[^.]+\./, '');
}

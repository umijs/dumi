// Upstream omits a types field, so father cannot discover these declarations.
// Re-export its types to keep the bundled and installed APIs aligned.
export { default, Cache, FileSystemCache } from 'file-system-cache';

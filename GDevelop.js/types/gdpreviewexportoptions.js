// Automatically generated by GDevelop.js/scripts/generate-types.js
declare class gdPreviewExportOptions {
  constructor(project: gdProject, outputPath: string): void;
  setDebuggerServerAddress(address: string, port: string): gdPreviewExportOptions;
  setLayoutName(layoutName: string): gdPreviewExportOptions;
  setExternalLayoutName(externalLayoutName: string): gdPreviewExportOptions;
  setIncludeFileHash(includeFile: string, hash: number): gdPreviewExportOptions;
  setProjectDataOnlyExport(enable: boolean): gdPreviewExportOptions;
  setNonRuntimeScriptsCacheBurst(value: number): gdPreviewExportOptions;
  delete(): void;
  ptr: number;
};
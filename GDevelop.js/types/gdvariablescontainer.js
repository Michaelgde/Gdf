// Automatically generated by GDevelop.js/scripts/generate-types.js
declare class gdVariablesContainer {
  constructor(): void;
  has(name: string): boolean;
  get(name: string): gdVariable;
  getAt(index: number): gdVariable;
  getNameAt(index: number): string;
  insert(name: string, variable: gdVariable, index: number): gdVariable;
  insertNew(name: string, index: number): gdVariable;
  remove(name: string): void;
  rename(oldName: string, newName: string): boolean;
  swap(firstIndex: number, secondIndex: number): void;
  move(oldIndex: number, newIndex: number): void;
  getPosition(name: string): number;
  count(): number;
  clear(): void;
  removeRecursively(variableToRemove: gdVariable): void;
  serializeTo(element: gdSerializerElement): void;
  unserializeFrom(element: gdSerializerElement): void;
  resetPersistentUuid(): gdVariablesContainer;
  clearPersistentUuid(): gdVariablesContainer;
  delete(): void;
  ptr: number;
};
const registry = {};

// Register a CanvasPrimitive constructor under a specific type key
export function registerPrimitive(type, primitiveClass) {
  registry[type] = primitiveClass;
}

// Fetch a CanvasPrimitive constructor by its type key
export function getPrimitiveClass(type) {
  const primitiveClass = registry[type];
  if (!primitiveClass) {
    console.warn(`CanvasPrimitive type "${type}" is not registered. Please ensure registry is loaded.`);
    return null;
  }
  return primitiveClass;
}

// Return list of all registered primitive types
export function getRegisteredTypes() {
  return Object.keys(registry);
}

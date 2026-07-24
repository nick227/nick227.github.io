import { getPrimitiveClass } from './registry.js';

// Instantiates a registered primitive constructor with its configuration details
export function createPrimitive(type, config) {
  const PrimitiveClass = getPrimitiveClass(type);
  if (!PrimitiveClass) {
    throw new Error(`Factory Error: Could not instantiate primitive of type "${type}". Key not found in registry.`);
  }
  return new PrimitiveClass(config);
}

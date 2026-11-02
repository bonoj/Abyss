// Strand-only terrain appearance; never changes signed-field geometry.
export function createStrandGeology(T, terrain) {
  return {inspect: () => ({name: 'Strand geology', installed: false})};
}

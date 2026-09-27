import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts', 'src/db/seed/run-seed.ts'],
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  clean: true,
  sourcemap: true,
  // node:sqlite only exists with the node: prefix, so keep it.
  removeNodeProtocol: false,
  // The shared package ships TypeScript source, so it is bundled in.
  noExternal: ['@padosipro/shared'],
});

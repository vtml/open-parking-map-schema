import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/domain/**/*.ts", "src/application/**/*.ts"],
      exclude: ["src/application/ports.ts"],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 70,
      },
    },
  },
});

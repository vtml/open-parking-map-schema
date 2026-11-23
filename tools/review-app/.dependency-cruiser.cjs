/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "domain-stays-inner",
      severity: "error",
      from: { path: "^src/domain" },
      to: { path: "^src/(application|adapters|ui)" },
    },
    {
      name: "application-stays-inner",
      severity: "error",
      from: { path: "^src/application" },
      to: { path: "^src/(adapters|ui)" },
    },
    {
      name: "adapters-do-not-import-ui",
      severity: "error",
      from: { path: "^src/adapters" },
      to: { path: "^src/ui" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: { exportsFields: ["exports"], conditionNames: ["import", "require", "node"] },
  },
};

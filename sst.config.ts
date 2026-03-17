/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "infra-staging-dbs",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const dbHost = new sst.Secret("DatabaseHost");
    const dbPassword = new sst.Secret("DatabasePassword");

    new sst.aws.Function("DatabaseProvisioner", {
      handler: "src/index.handler",
      runtime: "nodejs22.x",
      timeout: "60 seconds",
      memory: "512 MB",
      link: [dbHost, dbPassword],
    });
  },
});

#!/usr/bin/env node
import { App } from "aws-cdk-lib";

import { loadEnvSettings } from "../lib/settings";
import { GlobalStack } from "../lib/stacks/global";
import { GlobalToolsStack } from "../lib/stacks/globalTools";
import { EnvMainStack } from "../lib/stacks/env/main";
import { EnvComponentsStack } from "../lib/stacks/env/components";
import { ApiStack } from "../lib/stacks/services/api";
import { MigrationsStack } from "../lib/stacks/services/migrations";
import { WebAppStack } from "../lib/stacks/services/webApp";
import { DocsStack } from "../lib/stacks/services/docs";
import { EnvCiStack } from "../lib/stacks/env/ci";
import { UsEastResourcesStack } from "../lib/stacks/usEastResources";
import { EnvDbStack } from "../lib/stacks/env/db";

(async () => {
  const envSettings = await loadEnvSettings();

  const getStackName = (baseName: string, prefix: string) =>
    `${prefix}-${baseName}`;

  const app = new App();

  // Global stacks
  new GlobalStack(app, getStackName("GlobalStack", envSettings.projectName), {
    envSettings,
  });
  new UsEastResourcesStack(
    app,
    getStackName("UsEastResourcesStack", envSettings.projectName),
    {
      envSettings,
      env: { region: "us-east-1" },
    }
  );
  if (envSettings.tools.enabled) {
    new GlobalToolsStack(
      app,
      getStackName("GlobalToolsStack", envSettings.projectName),
      { envSettings }
    );
  }

  // Environment (dev / qa / stage / prod) stacks
  new EnvMainStack(app, getStackName("MainStack", envSettings.projectEnvName), {
    envSettings,
  });
  new EnvDbStack(app, getStackName("DbStack", envSettings.projectEnvName), {
    envSettings,
  });
  new EnvComponentsStack(
    app,
    getStackName("ComponentsStack", envSettings.projectEnvName),
    { envSettings }
  );
  new EnvCiStack(app, getStackName("CiStack", envSettings.projectEnvName), {
    envSettings,
  });
  new ApiStack(app, getStackName("ApiStack", envSettings.projectEnvName), {
    envSettings,
  });
  new MigrationsStack(
    app,
    getStackName("MigrationsStack", envSettings.projectEnvName),
    { envSettings }
  );
  new WebAppStack(
    app,
    getStackName("WebAppStack", envSettings.projectEnvName),
    { envSettings }
  );
  new DocsStack(app, getStackName("DocsStack", envSettings.projectEnvName), {
    envSettings,
  });
})();

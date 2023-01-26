---
title: SonarCloud integration
---

SaaS Boilerplate comes with a SonarCloud integration for static code analysis.
To get it configured and fully working you need to:
1. Sign up (if you don't have an account yet) and log in to your SonarCloud account.
2. Click on a plus sign in the top right corner -> "Analyze new project".
3. Click on a "Setup a monorepo." link at the bottom.
4. Select Organization you want to import the project to and the repository you want to import.
5. Add a new project for all packages you want to be analyzed (backend, workers, webapp).
6. Adjust `sonar.organization` and `sonar.projectKey` properties in `sonar-project.properties` files in all of the packages to match the ones from the SonarCloud monorepo configuration.
7. When it's done, code should be automatically analyzed during each BitBucket pipeline.
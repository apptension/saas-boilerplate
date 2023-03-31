---
title: How to delete a state machine?
---

Complementary to the feature introduced in [SB-175 Schedule serverless tasks for specific date](https://bitbucket.org/apptension/saas-boilerplate-app/commits/b523dcfa814927f81ba9bc281a34d853258df937), [this script](https://bitbucket.org/apptension/saas-boilerplate-app/pull-requests/179) was introduced.

If an environment is destroyed, the state machine responsible for task scheduling won't be destroyed until any of its executions have state `RUNNING`. In the case of those `WaitForDueDate` executions, that means waiting for weeks until it happens, which can effectively block redeploy of the specific environment.

To stop all `RUNNING` executions in the AWS Console, a user would have to manually stop each of the execution one after another: there's no easy way to stop all of them in batch, and if there're a few thousands of the `RUNNING` executions (which proved to be highly possible), it would be a highly time-consuming task.

The script automates the above.

---
title: Git flow
---

## Branches

We distinguish 3 types of branches that would usually appear in the flow:

* `feature` 
* `bugfix`
* `hotfix`

Name your branches using following pattern: `<branch type>/<issue tracker task id>-<brief description separated with the hyphens>`, e.g. `feature/SB-465-branching-model-documentation`. It allows to quickly identify branches. 

Branches should be created from the latest `master` and live shortly. Delete them just after Pull Request merge.

## Pull Request

### Size

Keep your PRs as small as possible. PRs size is one of the most important factors to improve your code flow and quality. 

Small PR means:

* quicker Code Review and flow - the reviewer is more eager to get through PR if it won't take him 2 hours
* better code quality - it's much easier to understand whole context and discover possible issues if changelog is smaller
* fewer conflicts - nobody likes conflicts
* much lesser chance not to waste lot of somebody's work due to misunderstanding the task

How to achieve small PRs:

* divide your tasks onto smaller ones and finish them one-by-one
* extract potentially exhaustive changes to separated PR (e.g.,reformatting a lot of files, refactoring multiple names)
* extract independent changes to separated PR (e.g., shared components, utils)

### Title

Title must clearly identify what the PR is about. You should keep following pattern: `[<issues tracker tasks separated by space>] <content>`, e.g. `[SB-465 SB-466] Create branching model documentation`

### Description

Description must tell the user what the problem is about (if there is no issue tracker task available) and how it was solved. Good commit messages can replace description completely if the problem wasn't complex enough to reason your choices. Attach video or screenshot to demonstrate how the thing works.

### Comments

It is worth to enrich the PR with comments. If you broke internal codebase rules - a comment describing the motivation and benefits will draw your reviewers' attention to the problem, which may translate into applying this approach to the entire codebase and increasing code quality. Also, you can answer possible questions before they might have been asked. Your reviewers are going to be grateful!

### General tips

* Take care of your language, grammar, and punctuation. People are the recipients of your PR, so it's worth taking care of the communication
* Rebase your branch onto master before creating the PR to avoid conflicts and failing tests
* Quick responding to Code Review comments allows to iterate the code fast
* Take care of the commit messages quality. Good messages can replace description completely - Bitbucket creates a list of them in the description automatically. 
* Do not alter the history if somebody has already done review. It gives the reviewer possibility to check what has changed in the new commits.  

## Application versioning

When it comes to assigning version numbers, we are following [Semantic Versioning](https://semver.org/) rules.

If you want to release a new version of the application from the current (master) branch, you need to create a new git tag, following the `MAJOR.MINOR.PATCH` pattern, like:
```
git tag 1.0.0
```
and push that tag to the origin:
```
git push origin 1.0.0
```
This tag will be automatically pushed by BitBucket Pipeline to CodeCommit repository. To deploy new version open CodeBuild service in AWS Console, enter the main project (the one following the `{project}-{environment}` pattern, like `saas-qa`) and click "Start build with overrides button". In the Source section select "Git tag" as a "Reference type" and select the tag that you want to deploy. Click "Start build" to confirm selection and start new build.

### Versioning using `standard-version` package

To automate assigning correct versions we recommend using npm `standard-version` package. The following command:

```shell
npx standard-version --release-as 1.0.0
```

called in root folder of the application will add a git tag, change version in appropriate `package.json` files,
generate or update CHANGELOG.md file automatically and commit all changes.
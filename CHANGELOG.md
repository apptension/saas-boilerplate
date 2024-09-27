# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.1.1](https://github.com/apptension/saas-boilerplate/compare/4.1.0...4.1.1) (2024-09-27)

### Bug Fixes

- [#621](https://github.com/apptension/saas-boilerplate/issues/621) Redis cache deployment issue ([#622](https://github.com/apptension/saas-boilerplate/issues/622)) ([73115ee](https://github.com/apptension/saas-boilerplate/commit/73115ee76da730fe57640e39998a0d5f1090f86f))

## [4.1.0](https://github.com/apptension/saas-boilerplate/compare/4.0.0...4.1.0) (2024-09-20)

### Features

- [#611](https://github.com/apptension/saas-boilerplate/issues/611) Remove AWS CodeCommit from stack ([#619](https://github.com/apptension/saas-boilerplate/issues/619)) ([751bb99](https://github.com/apptension/saas-boilerplate/commit/751bb99a9e7fc6111130991d1775e5142004863e))

### Bug Fixes

- [#601](https://github.com/apptension/saas-boilerplate/issues/601) Fix copy inconsistency ([#609](https://github.com/apptension/saas-boilerplate/issues/609)) ([d34eab4](https://github.com/apptension/saas-boilerplate/commit/d34eab413f3be03ceb6ac7843b7c3c363562b282))
- [#604](https://github.com/apptension/saas-boilerplate/issues/604) Fix user export ([#606](https://github.com/apptension/saas-boilerplate/issues/606)) ([8725584](https://github.com/apptension/saas-boilerplate/commit/8725584e0cb9dcf9b8255b597a5c72a1f1096bdc))
- Change `docker-compose` calls to `docker compose` ([#613](https://github.com/apptension/saas-boilerplate/issues/613)) ([26e3cf5](https://github.com/apptension/saas-boilerplate/commit/26e3cf558a1b58514dd29cab18ed6be0c7a0d155))
- Fix invalid docs formatting ([#614](https://github.com/apptension/saas-boilerplate/issues/614)) ([cf0e826](https://github.com/apptension/saas-boilerplate/commit/cf0e8262398d8f26509d413217c72a4c694c8907))

## [4.0.0](https://github.com/apptension/saas-boilerplate/compare/3.0.1...4.0.0) (2024-07-11)

### ⚠ BREAKING CHANGES

- #493 Add Celery workers to the stack

### Features

- [#493](https://github.com/apptension/saas-boilerplate/issues/493) Add Celery workers to the stack ([4121ece](https://github.com/apptension/saas-boilerplate/commit/4121eceb20976d945f0258271031d2b1a90bb99c))
- Move user export task on celery ([c04fc07](https://github.com/apptension/saas-boilerplate/commit/c04fc0793d978c6cf402fea5d8359af3642717cd))
- Move user export task on celery ([3d91c35](https://github.com/apptension/saas-boilerplate/commit/3d91c3520654645e54ea6442266df508a1e3ec24))

### Bug Fixes

- Fix broken builds on pnpm ^9.5.0 ([#602](https://github.com/apptension/saas-boilerplate/issues/602)) ([57e5f6c](https://github.com/apptension/saas-boilerplate/commit/57e5f6cbf0ea84d2708837281475f72b843e942a))

### [3.0.1](https://github.com/apptension/saas-boilerplate/compare/3.0.0...3.0.1) (2024-07-02)

### Features

- add redirection to previous page after login ([#560](https://github.com/apptension/saas-boilerplate/issues/560)) ([423afdc](https://github.com/apptension/saas-boilerplate/commit/423afdc385e46e82eb05fcd50f630b4af67e4c53))

### Bug Fixes

- [#443](https://github.com/apptension/saas-boilerplate/issues/443) Fix pagination issues ([#577](https://github.com/apptension/saas-boilerplate/issues/577)) ([e1963fd](https://github.com/apptension/saas-boilerplate/commit/e1963fd1eed89176065ee8e420e9509f30aa957c))
- [#587](https://github.com/apptension/saas-boilerplate/issues/587) Fix CLI telemetry opt-out ([#589](https://github.com/apptension/saas-boilerplate/issues/589)) ([29675d9](https://github.com/apptension/saas-boilerplate/commit/29675d9c6ced954f6939171ff3ce4053d9d9e69e))
- docker volume recreate ([#576](https://github.com/apptension/saas-boilerplate/issues/576)) ([80110fe](https://github.com/apptension/saas-boilerplate/commit/80110fe7fb8be58abf525906bdda3d72d11407e5))

### Dependencies

- [#568](https://github.com/apptension/saas-boilerplate/issues/568) Update Postgres version to 16.1 ([#573](https://github.com/apptension/saas-boilerplate/issues/573)) ([04c6757](https://github.com/apptension/saas-boilerplate/commit/04c6757aad304a0829397293cec573e6a34677f4))
- Update eslint to 9.3.0 ([#578](https://github.com/apptension/saas-boilerplate/issues/578)) ([b610ad3](https://github.com/apptension/saas-boilerplate/commit/b610ad3aaf7ec219adf2ad895947b39d1ccf0d4e))
- Update webapp package ([#583](https://github.com/apptension/saas-boilerplate/issues/583)) ([bd60f8d](https://github.com/apptension/saas-boilerplate/commit/bd60f8dc505437830dfc62d05bff59cbc0de9557))
- Upgrade django to version 5 ([#582](https://github.com/apptension/saas-boilerplate/issues/582)) ([4665d3f](https://github.com/apptension/saas-boilerplate/commit/4665d3fcc53590869bb9fca47f6fd95cf3341ada))

## [3.0.0](https://github.com/apptension/saas-boilerplate/compare/2.6.1...3.0.0) (2024-05-22)

### ⚠ BREAKING CHANGES

- Important migration instructions

Before running the multi-tenancy migrations on your existing codebase or database, it is crucial to follow these steps to avoid any issues:

1. Remove or comment `DJSTRIPE_SUBSCRIBER_MODEL` setting
2. Run the migrations
3. Revert the change: After the migrations have successfully completed, revert the change by uncommenting or re-adding the `DJSTRIPE_SUBSCRIBER_MODEL` setting.

### Features

- [#382](https://github.com/apptension/saas-boilerplate/issues/382) Multi-tenancy / Add support for multiple tenants ([#561](https://github.com/apptension/saas-boilerplate/issues/561)) ([e6c6dc3](https://github.com/apptension/saas-boilerplate/commit/e6c6dc39f0e96b3bb596f6b5dfae137938b37b1b))
- Add `deps:` type to conventional-changelog ([#545](https://github.com/apptension/saas-boilerplate/issues/545)) ([8e7e982](https://github.com/apptension/saas-boilerplate/commit/8e7e982ef8246d9fcb05f82a2e96e983544c626e))

### Bug Fixes

- Create default tenant for newly created social users ([#572](https://github.com/apptension/saas-boilerplate/issues/572)) ([d42bb44](https://github.com/apptension/saas-boilerplate/commit/d42bb445e1208d2ea15ba16919937685c156c259))
- Missing \*.spec.tsx pattern in multiple tsconfig.spec.json files ([#557](https://github.com/apptension/saas-boilerplate/issues/557)) ([9dfcd51](https://github.com/apptension/saas-boilerplate/commit/9dfcd51fa3cdde3cb6e0becdcdff9a67793d8f49))

### Dependencies

- [@testing-library](https://github.com/testing-library) update ([#563](https://github.com/apptension/saas-boilerplate/issues/563)) ([569fcee](https://github.com/apptension/saas-boilerplate/commit/569fcee66a7aafd77ba1352d89a304f4ca0f445a))
- deprecated packages ([#552](https://github.com/apptension/saas-boilerplate/issues/552)) ([b83fe6f](https://github.com/apptension/saas-boilerplate/commit/b83fe6f349fb462aa1ec6f51699e373888b5ffbd))
- root package bulk update (low impact) ([#565](https://github.com/apptension/saas-boilerplate/issues/565)) ([282bd5d](https://github.com/apptension/saas-boilerplate/commit/282bd5d8ea36074fb667f8516b3e6d60e2d6abb6))
- Update aws libs ([#566](https://github.com/apptension/saas-boilerplate/issues/566)) ([0597933](https://github.com/apptension/saas-boilerplate/commit/05979330b3b15ada8ae02ae8d740ad5a4205215a))
- Update nx to 19.0.1 ([#546](https://github.com/apptension/saas-boilerplate/issues/546)) ([063a891](https://github.com/apptension/saas-boilerplate/commit/063a891a25e17d5ed8da271004826f0ac57febc6))
- Update sentry/react ([#569](https://github.com/apptension/saas-boilerplate/issues/569)) ([fadfdbf](https://github.com/apptension/saas-boilerplate/commit/fadfdbf8cd5aa80b62619712741515d1d9777d15))
- Update vite to 5.2.x ([#551](https://github.com/apptension/saas-boilerplate/issues/551)) ([fc029f5](https://github.com/apptension/saas-boilerplate/commit/fc029f56d60e68e1b51583e268527639619e658b))
- webapp-core package updates ([#559](https://github.com/apptension/saas-boilerplate/issues/559)) ([1e2837e](https://github.com/apptension/saas-boilerplate/commit/1e2837e7189c345bd1d785666eb665d89088cf4a))

### [2.6.1](https://github.com/apptension/saas-boilerplate/compare/2.6.0...2.6.1) (2024-05-10)

### Bug Fixes

- [#508](https://github.com/apptension/saas-boilerplate/issues/508) Remove AWS_ENDPOINT_URL from backend/.env.shared to fix migration job fails to trigger on local deploy ([#510](https://github.com/apptension/saas-boilerplate/issues/510)) ([2042659](https://github.com/apptension/saas-boilerplate/commit/2042659b33a371e84410410c5b178ace2e9f7c8e))
- Remove warning in tests from MSW unhandled requests ([#501](https://github.com/apptension/saas-boilerplate/issues/501)) ([7766ccb](https://github.com/apptension/saas-boilerplate/commit/7766ccb4a289c7e99c2f59c54f9e451a37806807))
- Update pnpm to 9.0.6, use workspace protocol (workspace:) instead of `link-workspace-packages` which is now by default set to `false` ([#538](https://github.com/apptension/saas-boilerplate/issues/538)) ([02d3022](https://github.com/apptension/saas-boilerplate/commit/02d3022e32e8fd6e965b6369a7af6279874ecfe8))

## [2.6.0](https://github.com/apptension/aws-boilerplate/compare/2.5.0...2.6.0) (2024-03-06)

### Features

- Rewrite GraphQL subscriptions to Django Channels and use Load Balancer to handle websocket connections ([#488](https://github.com/apptension/aws-boilerplate/issues/488)) ([e13baf4](https://github.com/apptension/aws-boilerplate/commit/e13baf45b9c6e863425bdd7cac79e5f8a878ab49))

### Bug Fixes

- Move scripts from package.json to project.json to avoid issues with env variables passing ([#491](https://github.com/apptension/aws-boilerplate/issues/491)) ([6067b41](https://github.com/apptension/aws-boilerplate/commit/6067b41415b2656fe84b2d7f76e821c2b2b2cf60))

## [2.5.0](https://github.com/apptension/aws-boilerplate/compare/2.4.2...2.5.0) (2024-03-01)

### Features

- [#479](https://github.com/apptension/aws-boilerplate/issues/479) Introduce CI mode ([#482](https://github.com/apptension/aws-boilerplate/issues/482)) ([d4d5d04](https://github.com/apptension/aws-boilerplate/commit/d4d5d042dd848d97a2bd385afdaf8d24ae83b23b))

### Bug Fixes

- [#449](https://github.com/apptension/aws-boilerplate/issues/449) Ensure that docker volume is created when running docs locally ([#487](https://github.com/apptension/aws-boilerplate/issues/487)) ([224d936](https://github.com/apptension/aws-boilerplate/commit/224d9366f4ccd5e0c08d689235d0ef6601d9cc53))
- [#458](https://github.com/apptension/aws-boilerplate/issues/458) Fix sending emails on local env and replace Mailcatcher image ([#476](https://github.com/apptension/aws-boilerplate/issues/476)) ([dc6a710](https://github.com/apptension/aws-boilerplate/commit/dc6a7107c26b0bd92863e9976753ae6003068ee7))
- [#458](https://github.com/apptension/aws-boilerplate/issues/458) Workers docker issues ([#484](https://github.com/apptension/aws-boilerplate/issues/484)) ([652bd40](https://github.com/apptension/aws-boilerplate/commit/652bd409bb20c6cef5660126639c1d1e6a65699f))
- [#478](https://github.com/apptension/aws-boilerplate/issues/478) Fix CI pipeline failing on version upload step when tools are disabled (status dashboard stack is not deployed) ([#481](https://github.com/apptension/aws-boilerplate/issues/481)) ([d50c53b](https://github.com/apptension/aws-boilerplate/commit/d50c53bb913e89acb1b3e7b5d140d034bd81d51d))
- [#489](https://github.com/apptension/aws-boilerplate/issues/489) Fix missing envs in the emails, adjust env docs ([#490](https://github.com/apptension/aws-boilerplate/issues/490)) ([6d5c784](https://github.com/apptension/aws-boilerplate/commit/6d5c7843b80a6f3bd3fe0ee820123847c354704b))
- Change SonarCloud exclusions configuration ([#486](https://github.com/apptension/aws-boilerplate/issues/486)) ([900e086](https://github.com/apptension/aws-boilerplate/commit/900e086123343ba480b58d08ebf04c06d2e3daf6))
- Prevent NX from loading .env files when running CLI scripts. ([#477](https://github.com/apptension/aws-boilerplate/issues/477)) ([db0a868](https://github.com/apptension/aws-boilerplate/commit/db0a868605f181f7ec858f652fc82add88569a07))

### [2.4.2](https://github.com/apptension/aws-boilerplate/compare/2.4.1...2.4.2) (2024-02-09)

### Features

- [#196](https://github.com/apptension/aws-boilerplate/issues/196) Migrate polling AWS CodePipeline to use event-based change detection ([#473](https://github.com/apptension/aws-boilerplate/issues/473)) ([4c8ccc5](https://github.com/apptension/aws-boilerplate/commit/4c8ccc5b679d0c970a67d6e0b92414b1bef83251))

### Bug Fixes

- Freeze awscli version to 1.32.24 in backend Dockerfile ([#455](https://github.com/apptension/aws-boilerplate/issues/455)) ([54b7a25](https://github.com/apptension/aws-boilerplate/commit/54b7a25bc52c553ef7273823ef1cbc871ccf30d1))
- Precommit hook failing on initial commit without NX graph generated ([#456](https://github.com/apptension/aws-boilerplate/issues/456)) ([9bad656](https://github.com/apptension/aws-boilerplate/commit/9bad65612c30d7fd68d3c67f4e7070d46ee5c41b))
- saas backed secrets command unknown --entrypoint flag ([#452](https://github.com/apptension/aws-boilerplate/issues/452)) ([0b62d6f](https://github.com/apptension/aws-boilerplate/commit/0b62d6ffe0b87dbc5a06bf6ef2cfbde82e4accbb))

### [2.4.1](https://github.com/apptension/aws-boilerplate/compare/2.4.0...2.4.1) (2023-12-05)

### Bug Fixes

- Fix `pnpm saas up` command on new docker ([#438](https://github.com/apptension/aws-boilerplate/issues/438)) ([2d86519](https://github.com/apptension/aws-boilerplate/commit/2d865191f52b2023cbca76e5756ebac906cb6390))

## [2.4.0](https://github.com/apptension/aws-boilerplate/compare/2.3.0...2.4.0) (2023-11-24)

### Features

- Add a waiting mechanism to `saas up` CLI command to wait for backend to start before starting web app dev server ([#420](https://github.com/apptension/aws-boilerplate/issues/420)) ([2c542ac](https://github.com/apptension/aws-boilerplate/commit/2c542ac8c31ec8e3f44e85fe8219dad351eadec2))
- Refactor pull through cache usage and add docker mirror to AWS for segment/chamber image ([#414](https://github.com/apptension/aws-boilerplate/issues/414)) ([f530506](https://github.com/apptension/aws-boilerplate/commit/f530506afb74726fea74b69c2d8f85d3280fa0c7))

### Bug Fixes

- Add chmod +x for the runtime scripts in backend Dockerfile ([#432](https://github.com/apptension/aws-boilerplate/issues/432)) ([2298b90](https://github.com/apptension/aws-boilerplate/commit/2298b90c7a6cfba2b0e8feedcd527748184c78c8))
- App deployment from local repository ([#431](https://github.com/apptension/aws-boilerplate/issues/431)) ([cf292bd](https://github.com/apptension/aws-boilerplate/commit/cf292bd6964f645417f3b6085241847044688f97))
- HMR not working for the components outside the webapp directory ([#434](https://github.com/apptension/aws-boilerplate/issues/434)) ([9791d58](https://github.com/apptension/aws-boilerplate/commit/9791d58f2eeaf23cf3aa608d3ace22b84c78ef2c))
- Invalid logo version ([#436](https://github.com/apptension/aws-boilerplate/issues/436)) ([f0044d4](https://github.com/apptension/aws-boilerplate/commit/f0044d480687e43debed8d0630b5691202abda37))
- Prevent API stack from throwing error during deployment when user does not define all domains. ([#421](https://github.com/apptension/aws-boilerplate/issues/421)) ([b6ade66](https://github.com/apptension/aws-boilerplate/commit/b6ade66076cd15f7ec791447c7bd5cf488250bd7))
- Websocket connection error on AWS env ([#435](https://github.com/apptension/aws-boilerplate/issues/435)) ([28abdcc](https://github.com/apptension/aws-boilerplate/commit/28abdcca906d022f2f443b8ff73dc796ae7bd601))

## [2.3.0](https://github.com/apptension/saas-boilerplate/compare/2.2.2...2.3.0) (2023-10-06)

### Features

- Upgrade localstack to 2.3.0 (latest) ([#412](https://github.com/apptension/saas-boilerplate/issues/412)) ([5e9e788](https://github.com/apptension/saas-boilerplate/commit/5e9e788e8dfef413e1d479887026cf039cb35281))

### Bug Fixes

- Invalid build environment for the docs ([#418](https://github.com/apptension/saas-boilerplate/issues/418)) ([ab0e86f](https://github.com/apptension/saas-boilerplate/commit/ab0e86f72a74ab44bc206a73db2c5a77dd39ff3b))

### [2.2.2](https://github.com/apptension/saas-boilerplate/compare/2.2.1...2.2.2) (2023-09-29)

### Bug Fixes

- Enforce emails artifact build before workers build / deploy is executed to make sure emails/renderer/index.umd.js is present ([#407](https://github.com/apptension/saas-boilerplate/issues/407)) ([e5349be](https://github.com/apptension/saas-boilerplate/commit/e5349be603127f6525635f879ebc53394ec47064))

### [2.2.1](https://github.com/apptension/saas-boilerplate/compare/2.2.0...2.2.1) (2023-09-28)

### Bug Fixes

- Remove command args from telemetry ([#406](https://github.com/apptension/saas-boilerplate/issues/406)) ([37df532](https://github.com/apptension/saas-boilerplate/commit/37df532ab58abb52d29fc65870422a0e6668fa83))

## [2.2.0](https://github.com/apptension/saas-boilerplate/compare/2.1.2...2.2.0) (2023-09-25)

### [2.1.2](https://github.com/apptension/saas-boilerplate/compare/2.1.1...2.1.2) (2023-09-25)

### Features

- [#391](https://github.com/apptension/saas-boilerplate/issues/391) Update minimum node.js version to 18 ([#396](https://github.com/apptension/saas-boilerplate/issues/396)) ([3c0b8a1](https://github.com/apptension/saas-boilerplate/commit/3c0b8a1614165e5b4c2a79a17245441269dfc294))
- Remove unsupported browser detection as it is not necessary for feat: Remove unsupported browser detection ([#401](https://github.com/apptension/saas-boilerplate/issues/401)) ([85a8b6d](https://github.com/apptension/saas-boilerplate/commit/85a8b6d3ba1ba4acbc6ee36c034463b526c921d0))
- Update and cleanup pnpm dependencies ([#399](https://github.com/apptension/saas-boilerplate/issues/399)) ([9d2fa78](https://github.com/apptension/saas-boilerplate/commit/9d2fa78c4a375685c79d7ca1da6796d35f6c6ef5))

### Bug Fixes

- Fix error thrown when registering a new user when stripe is disabled ([#404](https://github.com/apptension/saas-boilerplate/issues/404)) ([ffb613e](https://github.com/apptension/saas-boilerplate/commit/ffb613e340d43cda9247d684c2f827cd4974f682))
- Set version to 0.0.1 when git is unable to determine a version in case no tags exist in repository ([#402](https://github.com/apptension/saas-boilerplate/issues/402)) ([07cda15](https://github.com/apptension/saas-boilerplate/commit/07cda150cd82f8bfad634b789bff5fd6782e0def))

### [2.1.1](https://github.com/apptension/aws-boilerplate/compare/2.1.0...2.1.1) (2023-09-21)

### Features

- Add OS attributes to CLI telemetry ([#393](https://github.com/apptension/aws-boilerplate/issues/393)) ([df04a75](https://github.com/apptension/aws-boilerplate/commit/df04a75918ee809dfb5d688a642b5c10ebf06a83))

## [2.1.0](https://github.com/apptension/aws-boilerplate/compare/2.0.3...2.1.0) (2023-09-20)

### Features

- Add CLI and rewrite all scripts to NodeJS in order to improve Windows support ([#386](https://github.com/apptension/aws-boilerplate/issues/386)) ([c36a5d2](https://github.com/apptension/aws-boilerplate/commit/c36a5d29e9917c960110265bdf3164ca26153c29))

### Bug Fixes

- Fix deadlock preventing infra bootstrapping ([#379](https://github.com/apptension/aws-boilerplate/issues/379)) ([7917fb1](https://github.com/apptension/aws-boilerplate/commit/7917fb183b2176e8fd69a497313a43c43f4ee9ce))

### [2.0.3](https://github.com/apptension/aws-boilerplate/compare/2.0.2...2.0.3) (2023-08-10)

### Bug Fixes

- [#293](https://github.com/apptension/aws-boilerplate/issues/293) Fix different avatars of one user in the notification widget ([#375](https://github.com/apptension/aws-boilerplate/issues/375)) ([8972594](https://github.com/apptension/aws-boilerplate/commit/897259404b8a6baabd0c67d03a5c9dda3d279858))
- [#328](https://github.com/apptension/aws-boilerplate/issues/328) Fix sign-up returns validation error on installation without env variables ([#374](https://github.com/apptension/aws-boilerplate/issues/374)) ([9b65dd9](https://github.com/apptension/aws-boilerplate/commit/9b65dd9907a0ddc5b1c35734f04f635400979646))
- [#353](https://github.com/apptension/aws-boilerplate/issues/353) Fix missing logo in emails ([#366](https://github.com/apptension/aws-boilerplate/issues/366)) ([a8406e3](https://github.com/apptension/aws-boilerplate/commit/a8406e3adb4523c65f8d5bdcea6fbf8b33974855))
- [#362](https://github.com/apptension/aws-boilerplate/issues/362) Update python runtime version in workers to 3.11 ([#369](https://github.com/apptension/aws-boilerplate/issues/369)) ([6a74062](https://github.com/apptension/aws-boilerplate/commit/6a74062a8a23c0c5729bf5c1d3e7d7dc45e5c6f1))
- `extract-intl` script not working as expected ([#339](https://github.com/apptension/aws-boilerplate/issues/339)) ([e1d8479](https://github.com/apptension/aws-boilerplate/commit/e1d847943044c74b89ee166b2228f0532d3e2937))
- Allow running nx run webapp:graphql:download-schema if the contentful env vars are not set ([#354](https://github.com/apptension/aws-boilerplate/issues/354)) ([3347aa1](https://github.com/apptension/aws-boilerplate/commit/3347aa1cc739802a3eacc2f1bada9b9ff73a6816))
- Clear cached cursors if current page end cursor is in cached… ([#368](https://github.com/apptension/aws-boilerplate/issues/368)) ([ad8382b](https://github.com/apptension/aws-boilerplate/commit/ad8382b900a43cb79347169405bcb305b15f1ad3)), closes [#365](https://github.com/apptension/aws-boilerplate/issues/365)
- Fix documentation error for form-with-mutation.mdx ([#355](https://github.com/apptension/aws-boilerplate/issues/355)) ([cae7fd8](https://github.com/apptension/aws-boilerplate/commit/cae7fd809e13ae09250d8c69895947e7e7db7285))
- Fix download-graphql-schema.sh in webapp-api-client and webapp-contentful ([#350](https://github.com/apptension/aws-boilerplate/issues/350)) ([3a8fab6](https://github.com/apptension/aws-boilerplate/commit/3a8fab6d52719902157f20c7f0a3085ecf8ef26c))
- refetch crud item after add mutation ([#361](https://github.com/apptension/aws-boilerplate/issues/361)) ([f0c1131](https://github.com/apptension/aws-boilerplate/commit/f0c11317f8a04e9f6283cf32efb5356a0d06f93a)), closes [#351](https://github.com/apptension/aws-boilerplate/issues/351)
- Remove unused e2e-tests container from docker-compose.yml ([#376](https://github.com/apptension/aws-boilerplate/issues/376)) ([57d9e79](https://github.com/apptension/aws-boilerplate/commit/57d9e793ae40cd0b3b895ef050e6bc4aa0a3d227))
- Use local nx installation by running it through pnpm in all scripts and make rules ([#352](https://github.com/apptension/aws-boilerplate/issues/352)) ([e910640](https://github.com/apptension/aws-boilerplate/commit/e9106400cfdb5556ece808422fa41a857603d223))

### [2.0.2](https://github.com/apptension/aws-boilerplate/compare/2.0.1...2.0.2) (2023-07-26)

### Features

- Crud Demo Pagination ([#330](https://github.com/apptension/aws-boilerplate/issues/330)) ([444ff72](https://github.com/apptension/aws-boilerplate/commit/444ff726ab410b5651da25a120abfc27df389148))

### Bug Fixes

- Add docker base images with defaults to stage-env-validator ([#262](https://github.com/apptension/aws-boilerplate/issues/262)) ([23b343c](https://github.com/apptension/aws-boilerplate/commit/23b343cc1776032d4a95c5c35c553add9b117c31))
- Fix API deployment issues on a small ECS task ([#349](https://github.com/apptension/aws-boilerplate/issues/349)) ([ee974e9](https://github.com/apptension/aws-boilerplate/commit/ee974e9c67ca3ab1ce6460e4ee8beebec2471c12))
- Rerender sidebar on theme change ([#345](https://github.com/apptension/aws-boilerplate/issues/345)) ([5312cec](https://github.com/apptension/aws-boilerplate/commit/5312cec6a86b7170696cfc0cf28491da034e7711))
- Upgrade pyyaml to version 6.0.1 to avoid cython_sources installation issue ([#342](https://github.com/apptension/aws-boilerplate/issues/342)) ([ca976c1](https://github.com/apptension/aws-boilerplate/commit/ca976c1e8458f64bd5130927c406915d4b53f52f))

### [2.0.1](https://github.com/apptension/aws-boilerplate/compare/2.0.0...2.0.1) (2023-07-12)

### Features

- Adjust email look ([#317](https://github.com/apptension/aws-boilerplate/issues/317)) ([caeec56](https://github.com/apptension/aws-boilerplate/commit/caeec564dd60b6d5402e2c77e1b39c8d7515bd61))
- Community links ([#315](https://github.com/apptension/aws-boilerplate/issues/315)) ([63e4156](https://github.com/apptension/aws-boilerplate/commit/63e41561f485cf3da91bd285280058fad8a2f6a0))
- Update GitHub issue templates ([#316](https://github.com/apptension/aws-boilerplate/issues/316)) ([d40e0bd](https://github.com/apptension/aws-boilerplate/commit/d40e0bd929d49d122517a10f3ae6457dc845d8a1))
- Update logo / favicon / icon ([#324](https://github.com/apptension/aws-boilerplate/issues/324)) ([fd02db0](https://github.com/apptension/aws-boilerplate/commit/fd02db0f646cfc7dcb812e612a26b14229fc5ead))

### Bug Fixes

- [#309](https://github.com/apptension/aws-boilerplate/issues/309) Fix invalid version bump skipping main package.json file ([#312](https://github.com/apptension/aws-boilerplate/issues/312)) ([8149af3](https://github.com/apptension/aws-boilerplate/commit/8149af39f31737c634bf3c6c5776bdfc43a3d003))
- [docs] Fix invalid link color ([#336](https://github.com/apptension/aws-boilerplate/issues/336)) ([15241e2](https://github.com/apptension/aws-boilerplate/commit/15241e2c78f5a86a0b28d8807950f2a6b65d2cca))
- Change image ([#326](https://github.com/apptension/aws-boilerplate/issues/326)) ([53a4ac7](https://github.com/apptension/aws-boilerplate/commit/53a4ac77aab43f08b09ddd89e40ee684be5cf775))
- Fix invalid links in webapp manifest.json ([#329](https://github.com/apptension/aws-boilerplate/issues/329)) ([e04de31](https://github.com/apptension/aws-boilerplate/commit/e04de31f1fb2fc2bff9ce4ac778209092cdbc7e3))
- Fix invalid version bump skipping some package.json files ([#337](https://github.com/apptension/aws-boilerplate/issues/337)) ([ac4c6cc](https://github.com/apptension/aws-boilerplate/commit/ac4c6cc9ac35ecb995acac4ae43695fb78741498))
- Go back button in subscriptions page ([#327](https://github.com/apptension/aws-boilerplate/issues/327)) ([c85b239](https://github.com/apptension/aws-boilerplate/commit/c85b23921d698769001a0b1c1c3707d0fb272035))
- lack of space in payments ([#313](https://github.com/apptension/aws-boilerplate/issues/313)) ([383673d](https://github.com/apptension/aws-boilerplate/commit/383673d5c01ef85874a0e09e71a53e5449ef9431)), closes [#303](https://github.com/apptension/aws-boilerplate/issues/303) [#303](https://github.com/apptension/aws-boilerplate/issues/303)
- Replace Gtag with GTM in docs ([#325](https://github.com/apptension/aws-boilerplate/issues/325)) ([51828d3](https://github.com/apptension/aws-boilerplate/commit/51828d36bce2cdda74c7f61e3392eb21dbe5a8cf))
- Update contentful package npm dependencies ([#322](https://github.com/apptension/aws-boilerplate/issues/322)) ([f23cb9d](https://github.com/apptension/aws-boilerplate/commit/f23cb9dea32c8cb499ec1ba331cc820f566f55cf))

## [2.0.0](https://github.com/apptension/aws-boilerplate/compare/2.0.0-alpha.1...2.0.0) (2023-06-30)

### ⚠ BREAKING CHANGES

- Load env variables required to build and deploy the app from AWS SSM Parameter Store instead of .env files (#205)
- [#174](https://github.com/apptension/aws-boilerplate/issues/174) Implement new UI look based on Radix UI and Tailwindcss ([#254](https://github.com/apptension/aws-boilerplate/issues/254)) ([f0d1ad8](https://github.com/apptension/aws-boilerplate/commit/f0d1ad8432be52beedb471e616053f13afeb9566))

### Features

- Load env variables required to build and deploy the app from AWS SSM Parameter Store instead of .env files ([#205](https://github.com/apptension/aws-boilerplate/issues/205)) ([a3d76b8](https://github.com/apptension/aws-boilerplate/commit/a3d76b8efef250fc834fd2bf87f68e436ffc1dad))
- [#174](https://github.com/apptension/aws-boilerplate/issues/174) Implement new UI look based on Radix UI and Tailwindcss ([#254](https://github.com/apptension/aws-boilerplate/issues/254)) ([f0d1ad8](https://github.com/apptension/aws-boilerplate/commit/f0d1ad8432be52beedb471e616053f13afeb9566))
- [#264](https://github.com/apptension/aws-boilerplate/issues/264) Remove E2E tests ([#281](https://github.com/apptension/aws-boilerplate/issues/281)) ([47c3803](https://github.com/apptension/aws-boilerplate/commit/47c3803ec17782b4620558ab99a49834ccffa153))
- [#279](https://github.com/apptension/aws-boilerplate/issues/279) Style demo items images, add better description of the Contentful integration ([#291](https://github.com/apptension/aws-boilerplate/issues/291)) ([8ea05c1](https://github.com/apptension/aws-boilerplate/commit/8ea05c1106f5f5a63ebf11cd4bf196b604f6b2f9))
- Adapt plop to new components ([#304](https://github.com/apptension/aws-boilerplate/issues/304)) ([158e57a](https://github.com/apptension/aws-boilerplate/commit/158e57adccae1f44cf31644667e5a7ddefe42c02))
- Add Algolia search to docs ([#237](https://github.com/apptension/aws-boilerplate/issues/237)) ([7faf4a2](https://github.com/apptension/aws-boilerplate/commit/7faf4a23181b83696126d18995461290724ee68a))
- Add and sort storybook stories ([#290](https://github.com/apptension/aws-boilerplate/issues/290)) ([efc6f9b](https://github.com/apptension/aws-boilerplate/commit/efc6f9b32c3f8ec3aeb5054346c44b0d7501fe76))
- Add Gtag tracking to the docs ([#305](https://github.com/apptension/aws-boilerplate/issues/305)) ([272896e](https://github.com/apptension/aws-boilerplate/commit/272896e5b21bcf10746aa5c9b38dea082eb2a261))
- Change logo in docs ([#283](https://github.com/apptension/aws-boilerplate/issues/283)) ([f2d6682](https://github.com/apptension/aws-boilerplate/commit/f2d6682cb84683177a6b683657897a54a978656e)), closes [#269](https://github.com/apptension/aws-boilerplate/issues/269) [#269](https://github.com/apptension/aws-boilerplate/issues/269)
- Implement more restrictive permissions for access to SSM parameter store and KMS keys ([#208](https://github.com/apptension/aws-boilerplate/issues/208)) ([44a1842](https://github.com/apptension/aws-boilerplate/commit/44a1842cc39347bc252f2d7a7057afefd3d2ec9e))
- Replace flake8 with ruff inside workers ([#241](https://github.com/apptension/aws-boilerplate/issues/241)) ([d831176](https://github.com/apptension/aws-boilerplate/commit/d831176acad21ab8c345315a5d1b4792202ed509))
- Update crud plop ([#307](https://github.com/apptension/aws-boilerplate/issues/307)) ([e268c8f](https://github.com/apptension/aws-boilerplate/commit/e268c8f757c3d1b031f18a93fa66550699fe9383))
- Update SB logo ([#261](https://github.com/apptension/aws-boilerplate/issues/261)) ([ef67255](https://github.com/apptension/aws-boilerplate/commit/ef67255c14bb2aa16926b89a6bb528f38fb8e521))
- Upgrade and speed up storybook ([#267](https://github.com/apptension/aws-boilerplate/issues/267)) ([278174f](https://github.com/apptension/aws-boilerplate/commit/278174f9a93bc99936df1fb3c8aa6492ec07939b))
- Upgrade build CodeBuild images to 7.0 ([#239](https://github.com/apptension/aws-boilerplate/issues/239)) ([6cac2d6](https://github.com/apptension/aws-boilerplate/commit/6cac2d62f401d5804e38bf69a4a09dc060e9cae9))

### Bug Fixes

- [#280](https://github.com/apptension/aws-boilerplate/issues/280) Set `en` locale for Stripe elements instead of default `auto` ([#284](https://github.com/apptension/aws-boilerplate/issues/284)) ([e368efe](https://github.com/apptension/aws-boilerplate/commit/e368efed948b7c7ceedad601ac428c377b14b747))
- [#297](https://github.com/apptension/aws-boilerplate/issues/297) Fix missing graphql dependency issue ([#302](https://github.com/apptension/aws-boilerplate/issues/302)) ([9ba5d7f](https://github.com/apptension/aws-boilerplate/commit/9ba5d7fdd1055faee06808d634bc80fa0adc483e))
- Error message overlaps the button [#289](https://github.com/apptension/aws-boilerplate/issues/289) ([#292](https://github.com/apptension/aws-boilerplate/issues/292)) ([826e0f9](https://github.com/apptension/aws-boilerplate/commit/826e0f96132fba0a8bf3c853c0d251f518c6d881))
- Fix Bitbucket pipelines ([#300](https://github.com/apptension/aws-boilerplate/issues/300)) ([951650a](https://github.com/apptension/aws-boilerplate/commit/951650a45524b02418e530afd1de09f99a72a086))
- Fix the TS2742 errors by moving some of the dependencies to root package.json ([#201](https://github.com/apptension/aws-boilerplate/issues/201)) ([8eb8816](https://github.com/apptension/aws-boilerplate/commit/8eb8816e3dd4e8e3139bc4fe20db4fc5520fa966))
- Navigation after editing or adding new crud item ([#296](https://github.com/apptension/aws-boilerplate/issues/296)) ([86f63c0](https://github.com/apptension/aws-boilerplate/commit/86f63c099d52f4e776e1fea6482b914995a9e8b0))
- Reference tools' env variables via AWS Parameter Store ([#253](https://github.com/apptension/aws-boilerplate/issues/253)) ([fc9d6fc](https://github.com/apptension/aws-boilerplate/commit/fc9d6fc558cbe57fe55f7cd5d142c004cab03b59))
- Refresh contentful item list page ([#298](https://github.com/apptension/aws-boilerplate/issues/298)) ([66b9b66](https://github.com/apptension/aws-boilerplate/commit/66b9b6648334e7277531f8a4bd78477010a450e2))
- Scroll on 2FA page - [#288](https://github.com/apptension/aws-boilerplate/issues/288) ([#294](https://github.com/apptension/aws-boilerplate/issues/294)) ([8dd2925](https://github.com/apptension/aws-boilerplate/commit/8dd29259f446df0142faa435b96b38f8318e80af))
- Squash user migrations and create initial superuser with UserProfile ([#199](https://github.com/apptension/aws-boilerplate/issues/199)) ([1759239](https://github.com/apptension/aws-boilerplate/commit/17592391bf405726b81c3254d803b35b1926f640)), closes [#180](https://github.com/apptension/aws-boilerplate/issues/180)
- Sync stripe's Product and Price models before initialising subscriptions locally ([#231](https://github.com/apptension/aws-boilerplate/issues/231)) ([1ab9ba4](https://github.com/apptension/aws-boilerplate/commit/1ab9ba46c0a8d3b1714c78e183ce46b81bc32909))
- Use ECR public images with Pull-Through-Cache inside AWS CodePipeline ([#215](https://github.com/apptension/aws-boilerplate/issues/215)) ([e8be123](https://github.com/apptension/aws-boilerplate/commit/e8be1235cdf94f1207b193a27f2f31d7b7b3ff22))

## [2.0.0-alpha.1](https://github.com/apptension/saas-boilerplate/compare/2.0.0-alpha.0...2.0.0-alpha.1) (2023-06-12)

### ⚠ BREAKING CHANGES

- Upgrade nx.js to v16 (#194)

### Features

- Add a default Github pull request template ([#173](https://github.com/apptension/saas-boilerplate/issues/173)) ([b41e120](https://github.com/apptension/saas-boilerplate/commit/b41e1203693948198b8f135f71ec0ac321a22c47))
- Add condition that pushes code to CodeCommit only CODE_COMMIT_REPO secret is defined ([#171](https://github.com/apptension/saas-boilerplate/issues/171)) ([1e6b864](https://github.com/apptension/saas-boilerplate/commit/1e6b864d440e909e01a83765e3fb4cb591117e7e))
- Use env variables for sonar configs ([#175](https://github.com/apptension/saas-boilerplate/issues/175)) ([f46bc91](https://github.com/apptension/saas-boilerplate/commit/f46bc912b774c929045efffebcbcc79de1eaa018))

### Bug Fixes

- [#181](https://github.com/apptension/saas-boilerplate/issues/181) Migrate from CloudFrontWebDistribution to the newer Distribution construct, fix WepAppStack deployment ([#185](https://github.com/apptension/saas-boilerplate/issues/185)) ([3472b7c](https://github.com/apptension/saas-boilerplate/commit/3472b7ce9265c3f9da7d2e9f4bb3af4c2dc7ec1d))
- Add command that runs all setup targets to make sure all .env files are created ([#177](https://github.com/apptension/saas-boilerplate/issues/177)) ([#178](https://github.com/apptension/saas-boilerplate/issues/178)) ([c55a322](https://github.com/apptension/saas-boilerplate/commit/c55a32229b3a6272b7f796d3a5a5358776a36b15))

- Upgrade nx.js to v16 ([#194](https://github.com/apptension/saas-boilerplate/issues/194)) ([4006b84](https://github.com/apptension/saas-boilerplate/commit/4006b84988516f26d551baada9c94fd4bae66d67))

## [2.0.0-alpha.0](https://github.com/apptension/saas-boilerplate/compare/1.1.1...2.0.0-alpha.0) (2023-05-30)

### Features

- Add "How to update schema?" page to V2 docs ([712ed8b](https://github.com/apptension/saas-boilerplate/commit/712ed8b4f6e728b1281560135c53bfa6d8562f1e))
- Add "The problem" docs page content ([eea0dfc](https://github.com/apptension/saas-boilerplate/commit/eea0dfc3db55ba11e5b23bc1faf70b9a23db0f5c))
- Add a `remote-shell` rule to backend's Makefile ([ff2bf58](https://github.com/apptension/saas-boilerplate/commit/ff2bf585562fa9124cf3c09c1638ee6e32b49be9))
- Add API reference commands to backend scope ([a5a68b8](https://github.com/apptension/saas-boilerplate/commit/a5a68b89005f8db785863fdf64800809fbe6b953))
- Add architecture docs ([fdf1659](https://github.com/apptension/saas-boilerplate/commit/fdf1659dab19594347acd9bc6937cc4ed998f874))
- Add assets management feature description ([5cc9b2c](https://github.com/apptension/saas-boilerplate/commit/5cc9b2c4a3f3cfb42faf7053b1941678dfd11966))
- Add authentication and authorization feature description ([9bf0f1e](https://github.com/apptension/saas-boilerplate/commit/9bf0f1e2ff41edf0761c1e01a1bcca4d57e05f88))
- Add bitbucket pipeline changesets ([19884b7](https://github.com/apptension/saas-boilerplate/commit/19884b7f819456eafbdcde1201e7882301a57bba))
- Add CMS feature description ([2a3eaaf](https://github.com/apptension/saas-boilerplate/commit/2a3eaaf532315a32476a609321d258112f093caf))
- Add content for V2 docs ([2ba24a5](https://github.com/apptension/saas-boilerplate/commit/2ba24a5aec32d7af262257daa87288b1653e61be))
- Add create new environment instructions to docs along with .env files API Reference ([7acd4bd](https://github.com/apptension/saas-boilerplate/commit/7acd4bd6df59838c69d531395fc782cf0a0a7908))
- Add CRUD feature description ([a85fd46](https://github.com/apptension/saas-boilerplate/commit/a85fd461c3f9703f9fdd096d506deba2891394b4))
- Add description of the admin feature to the docs ([6b69ab2](https://github.com/apptension/saas-boilerplate/commit/6b69ab2d44f93bef9cb88db3f07a1b242900efbe))
- Add description of the async workers feature to the docs ([3a692dd](https://github.com/apptension/saas-boilerplate/commit/3a692ddde0bbad8f705f9f815c6c8bc57fa0f06f))
- Add description of the E2E tests feature to the docs ([8726c64](https://github.com/apptension/saas-boilerplate/commit/8726c64f45d7b40754d7913cde0d564556f95fa6))
- Add description of the GraphQL feature to the docs ([671a03f](https://github.com/apptension/saas-boilerplate/commit/671a03f6a35cfc2e810e3532c16b57be13601136))
- Add docs for CI/CD feature ([b856926](https://github.com/apptension/saas-boilerplate/commit/b8569265f3b6a40e3210ed0247cf8c65a3282aa7))
- Add docs for IaC feature ([8ae1fcf](https://github.com/apptension/saas-boilerplate/commit/8ae1fcf924f032449210f3f91731abbdf2461d62))
- Add emails feature description ([672eda0](https://github.com/apptension/saas-boilerplate/commit/672eda04172989f711e000b9a07c7dae423d905c))
- Add GitHub actions configuration ([#158]()) ([656da8f](https://github.com/apptension/saas-boilerplate/commit/656da8fc302fb1647f49a46f242e83e0ec4c918a))
- Add header links to the docs ([976e7c6](https://github.com/apptension/saas-boilerplate/commit/976e7c6458cc9c40de87389ef53dae8c36b4a05a))
- Add payments and subscriptions feature description ([c2aa4a0](https://github.com/apptension/saas-boilerplate/commit/c2aa4a06244ed6e63316f43a61fdae03d1ea74e7))
- Add webapp API reference commands page ([840b4c6](https://github.com/apptension/saas-boilerplate/commit/840b4c6c83a457b8d067919967dc146a30995915))
- Add webapp testing docs article ([63cf9ab](https://github.com/apptension/saas-boilerplate/commit/63cf9ab578ea09590cfdb5d34369393504743d06))
- Automatically generate backend API Reference markdown docs ([12301c2](https://github.com/apptension/saas-boilerplate/commit/12301c2fd21c6cc36f197379ce8f0b60aa1d2270))
- Env variables API doc ([8263a0d](https://github.com/apptension/saas-boilerplate/commit/8263a0dec1509af56ab32507efd0e06b250ad42a))
- Fix version matrix and add docs ([777e6d9](https://github.com/apptension/saas-boilerplate/commit/777e6d91845a41f5ea5a519944feba5b3eeaffad))
- Introduce <ProjectName/> docs component ([afefdbb](https://github.com/apptension/saas-boilerplate/commit/afefdbbb673fde3c8402f66b92ce5e8f9fbe6bcd))
- Refactor webapp types ([4edaff1](https://github.com/apptension/saas-boilerplate/commit/4edaff1907851a4d3831426539c67dcf3547acd7))
- Remove all TBD and TODOs from V2 docs ([92fce4a](https://github.com/apptension/saas-boilerplate/commit/92fce4a58a98a4eeb8e2a6eb87f3f2a50f556c6e))
- change copy for expired password reset link ([739f77f](https://github.com/apptension/saas-boilerplate/commit/739f77f8eb99e935d6be93e1624879999567d9f2))
- Throttle password reset ([03be64c](https://github.com/apptension/saas-boilerplate/commit/03be64cf06035f46cc6173c74f3de9e27db55c8b))
- Set PDM minimum version ([8807b39](https://github.com/apptension/saas-boilerplate/commit/8807b399df057bd107919fce7d06d0b0b4c85d3b))
- hooks dir refactor ([f8b6a18](https://github.com/apptension/saas-boilerplate/commit/f8b6a18a9bd0c08485bed2eda70d4bbb5a883f99))
- review plop templates ([1c2a341](https://github.com/apptension/saas-boilerplate/commit/1c2a34182d13fa9b40d12a25af8cbe6c475c0df8))
- Run eslint for all packages in bitbucket pipelines ([9a8a364](https://github.com/apptension/saas-boilerplate/commit/9a8a36428c089887da378e23cf22d3f8f5938b1b))
- Remove prop-types library ([babeaa6](https://github.com/apptension/saas-boilerplate/commit/babeaa65d914f0d160d0012bb61b5735d1008766))
- Update Node version of async workers to latest available in Lambda ([da62fd1](https://github.com/apptension/saas-boilerplate/commit/da62fd1423a0c683583d7a06c82050e7de156e5a))
- SB-732, Init Apollo migration ([63ecba2](https://github.com/apptension/saas-boilerplate/commit/63ecba2237fd1355b0d065c1bf324fe102f9ee1b))
- Finished update user migration ([463bf7e](https://github.com/apptension/saas-boilerplate/commit/463bf7e69c3f15672a76e0efd27ce90a72945414))
- Change password migration ([cd5e77d](https://github.com/apptension/saas-boilerplate/commit/cd5e77dda8f7eac0371d447cbc690be2ab6bd17b))
- Migrate authConfirmUserEmailMutation to Apollo ([54e9848](https://github.com/apptension/saas-boilerplate/commit/54e984828259252002e893eee3d56b70736779eb))
- Request password reset ([f15db08](https://github.com/apptension/saas-boilerplate/commit/f15db08e612e6a33625c56da0f5058012fa6d389))
- Password Reset Request Confirm (pull request ) ([a636cce](https://github.com/apptension/saas-boilerplate/commit/a636ccee3a4fa069f1716a9dabf5be2c0d4adaf7))
- Migrate configContentfulAppConfigQuery to Apollo ([1dcbd6a](https://github.com/apptension/saas-boilerplate/commit/1dcbd6a9cf63fe46f18c827a1d6654301ec45318))
- migrate stripe payment method query ([8f9ddf2](https://github.com/apptension/saas-boilerplate/commit/8f9ddf2d0bd6fef1d92ea92e49eb7ec5cb302d4e))
- migrate stripe all charges query ([7495578](https://github.com/apptension/saas-boilerplate/commit/7495578d8a04269403ec5fb976885f6613ed4d84))
- migrate delete payment method mutation ([458fff6](https://github.com/apptension/saas-boilerplate/commit/458fff62749404a540e1364bdf2be620d611782f))
- migrate default payment method update ([8011ac6](https://github.com/apptension/saas-boilerplate/commit/8011ac605a5c0afbb7263d1f8bb5351fe7f8714c))
- migrate stripe pay intent create mutation feat: migrate stripe pay intent update mutation ([46b6971](https://github.com/apptension/saas-boilerplate/commit/46b697103023af5aa69a6bbaa8fea42328e997e0))
- migrate create intent setup ([9878972](https://github.com/apptension/saas-boilerplate/commit/9878972bfa521b00a6334178048a06fe003d0101))
- migrate subscripion plans all query ([0892159](https://github.com/apptension/saas-boilerplate/commit/089215992ac5c8e7744d3b6567d793af47136107))
- migrate subscription queries ([9daa7f6](https://github.com/apptension/saas-boilerplate/commit/9daa7f65aa68484153e19770c60c89c2a9d0f531))
- migrate subscription change active ([1891836](https://github.com/apptension/saas-boilerplate/commit/189183637411bd28722c99ea67ae4e088df960ab))
- migrate subscription cancel mutation ([5cfe114](https://github.com/apptension/saas-boilerplate/commit/5cfe114b83364746c85bae30767d2daccc90e6a9))
- Migrate new crud demo item form to Apollo ([f0f1ada](https://github.com/apptension/saas-boilerplate/commit/f0f1ada64430380a9218b8ee6ae81634b23c155e))
- Migrate CRUD demo item list to Apollo ([9aa1e47](https://github.com/apptension/saas-boilerplate/commit/9aa1e47575d563b1f48b3f54a79e33693362414a))
- migrate crud delete mutation, feat: fix for apollo errors ([c6183eb](https://github.com/apptension/saas-boilerplate/commit/c6183eb7fd758934f560136eaaea062a33f4b6e9))
- migrade crudDemoDropdown to apollo ([060fa16](https://github.com/apptension/saas-boilerplate/commit/060fa168c33c9e2dccccdc8feaca4bc4a899e418))
- migrate crud query to apollo ([0e01c43](https://github.com/apptension/saas-boilerplate/commit/0e01c4371f1180f027aa1177f8e65d55b685bbab))
- convert edit crud mutation to apollo ([ab50e77](https://github.com/apptension/saas-boilerplate/commit/ab50e77df20c30300bcb0a7ad57860936fbef4fe))
- migrate query from demoItem ([2747f31](https://github.com/apptension/saas-boilerplate/commit/2747f310be0962f8e7b573ab74579fbe2c29e9a5))
- Migrate demoItemsAllQuery ([b420b1e](https://github.com/apptension/saas-boilerplate/commit/b420b1e243731688dd9def1687a6fe9ed18f241f))
- Migrate notifications list query to Apollo ([55c9930](https://github.com/apptension/saas-boilerplate/commit/55c9930a7ed909045242cae1a729a7b169468e52))
- Migrate notification mutation to Apollo ([eccbc08](https://github.com/apptension/saas-boilerplate/commit/eccbc08b6aa4aa5e0bced4efd9eabebdc3d61d2d))
- Migrate notificationsListMarkAsReadMutation mutation to use Apollo ([0521f16](https://github.com/apptension/saas-boilerplate/commit/0521f1640a6cd9b40eed4d1dfbeb4477b7996f8c))
- Migrate notification subscription to use Apollo, fix websockets on localhost ([227433a](https://github.com/apptension/saas-boilerplate/commit/227433a17eaab36fba056330710e1ef0f2aa867f))
- Added SonarCloud integration. Added coverage reports for backend and workers. ([c957821](https://github.com/apptension/saas-boilerplate/commit/c957821b4becbfec88c76df5a63ee162495a3d38))
- Migrate common query to Apollo, feat: Fix refresh token ([221188c](https://github.com/apptension/saas-boilerplate/commit/221188c50c6eb8cf6de565e05ac3648f08ca2f44))
- Remove relay from project ([63e3723](https://github.com/apptension/saas-boilerplate/commit/63e3723ee7142fd087479170b990a6b863440d57))
- Add NX build system to formally introduce monorepo approach to the project ([910f467](https://github.com/apptension/saas-boilerplate/commit/910f467c4d92b6bcfde0fc3e9feb2ae09af9ee17))
- Remove warnings and errors from tests ([8d5a72c](https://github.com/apptension/saas-boilerplate/commit/8d5a72c26e1bab5d1134fd4f9699ee38a9b9858f))
- Remove CRA and craco and introduce Vite and fix storybooks, workers and emails ([1c0ef08](https://github.com/apptension/saas-boilerplate/commit/1c0ef087e7cd1ae039dc7c5f9dbcd30200ac8b0b))
- Update Apollo client package with the version that show warnings if there are missing mocks during tests ([c7db664](https://github.com/apptension/saas-boilerplate/commit/c7db66427bb4d83d1dffb61edfdaf4322b80c9cf))
- Sentry integration improvements (disabled /lbcheck transactions spam, correctly setting operation name and type for GraphQL operations). ([5244176](https://github.com/apptension/saas-boilerplate/commit/5244176f96310d4e6b2f9106051bb73eb4d57e73))
- Updated python version from 3.8 to 3.11. Updated all backend packages. Replaced unmaintained pytest-freezegun package with pytest-freezer. Downgraded django from version 4.1.5 to 4.0.8 (because of dj-stripe). ([8a16634](https://github.com/apptension/saas-boilerplate/commit/8a16634ee5866e3b20bfc19edb8dc56e9c980e96))
- Updated python in workers from version 3.8 to 3.9. Updated all workers packages (SQLAlchemy 1.4 -> 2.0 included). ([0c5aca0](https://github.com/apptension/saas-boilerplate/commit/0c5aca0c708d58c51505b31bf4cc8525feb275a7))
- Remove link to QA env in docs ([f6475f4](https://github.com/apptension/saas-boilerplate/commit/f6475f47ac9aca3b8bbf88fa78fc13c9c03b70f6))
- SB-800, SB-768, migrate use favorite queries ([9862584](https://github.com/apptension/saas-boilerplate/commit/986258411de6a31a2269c4eb646eed9bc1501c50))
- SB-802, Migrate documentsList mutations, ([def1470](https://github.com/apptension/saas-boilerplate/commit/def1470601702da6b4a1fcd1d302e1b355c1c4a3))
- Export user and user-related models data ([5207b67](https://github.com/apptension/saas-boilerplate/commit/5207b6780aa50f393f1c4fc1e665856115851c1b))
- Export user data and user uploaded files in a single zip file ([6e0e7c6](https://github.com/apptension/saas-boilerplate/commit/6e0e7c656dc1dd96626123a3bdc73f3f9b5040e6))
- Handle network errors ([0bc1b0a](https://github.com/apptension/saas-boilerplate/commit/0bc1b0a0890426490367d03b43e5828824caaa64))
- husky with pre-commit hook ([f5d46ad](https://github.com/apptension/saas-boilerplate/commit/f5d46add376625d0ae8c39e1d151e03f1ab4237b))
- Modularise infra by breaking it down into separate modules ([1347b93](https://github.com/apptension/saas-boilerplate/commit/1347b93a5c65084378c0b721c96874fe3d46ec01))
- Export all providers from one index file ([f1257bb](https://github.com/apptension/saas-boilerplate/commit/f1257bb59b790759e7e2dc4cfba3fe314d7f51e2))
- Migrate authUpdateUserProfileMutation in AvatarForm component to Apollo ([04b5c08](https://github.com/apptension/saas-boilerplate/commit/04b5c0866d4db117138a698e573abc1d7d33d9dc))
- Send link to the exported archive via e-mail ([93041f9](https://github.com/apptension/saas-boilerplate/commit/93041f974cc5c8cb51576064ad6fc16a21b1961a))
- Implement synchronous migrations job to fail CodePipeline if an error occured ([eb1f9bb](https://github.com/apptension/saas-boilerplate/commit/eb1f9bbea17a1d08064289ba61b38d00a8a4d626))
- sonar security and code smells ([9281dc2](https://github.com/apptension/saas-boilerplate/commit/9281dc2a643bfe243e0a61f25169ce53c4981bd0))
- Fix backend SonarCloud errors ([f0f3bf4](https://github.com/apptension/saas-boilerplate/commit/f0f3bf40d24c96d462e7833b05686ad6d6732c29))
- Fix workers SonarCloud errors ([e6b74a6](https://github.com/apptension/saas-boilerplate/commit/e6b74a642e547e2dc639d89d4044a657cd80ad71))
- Extract theme and reusable components into a separate package named webapp-core ([aaa3de8](https://github.com/apptension/saas-boilerplate/commit/aaa3de8c8b85b6e68546e70239ba6d229d720865))
- Extract CRUD demo routes and utils to separate package. ([02a7a78](https://github.com/apptension/saas-boilerplate/commit/02a7a782365f27c02700c4d3c48613d5de9eb0f8))
- Extract finances to separate package ([1cc124c](https://github.com/apptension/saas-boilerplate/commit/1cc124c0df5c428f46b873e694c408711e169e86))
- Extract documents to separate package ([5ec8b80](https://github.com/apptension/saas-boilerplate/commit/5ec8b80f302e684c6be32bbb74f7bb87d9f991d7))
- Extract every piece of code used to render pages related to contentful into a separate package ([df8c993](https://github.com/apptension/saas-boilerplate/commit/df8c993874f5939a17968592db189f74871a68d7))
- Extract GraphQL and regular api clients to separate module ([d839a9c](https://github.com/apptension/saas-boilerplate/commit/d839a9c5d14347737331748966b03fa9534184dc))
- Enable RDS database encryption ([135016a](https://github.com/apptension/saas-boilerplate/commit/135016ae78c765787470a4170e6ff5afdbf425a8))
- Update IAM policies to the least privilege access ([7202653](https://github.com/apptension/saas-boilerplate/commit/72026534f4ff4a1578b78706e00046a46ad263f5))
- Move db instance to private subnets ([9bf08c2](https://github.com/apptension/saas-boilerplate/commit/9bf08c2d5b42364d188ce08c1e94f4e82b057a54))
- update crud plop ([ed5a55d](https://github.com/apptension/saas-boilerplate/commit/ed5a55d4d25a24794a5b3166830061546cc19060))
- Implement 2FA ([ee52752](https://github.com/apptension/saas-boilerplate/commit/ee527527fbf3d39c1d16ca2ccabf9f2f4b4348d2))
- Extract emails to separate package ([4c15f62](https://github.com/apptension/saas-boilerplate/commit/4c15f626ad2fcfd7620e2f67648f8cdaceab2309))
- Add SonarCloud project for webapp-api-client package ([129a15a](https://github.com/apptension/saas-boilerplate/commit/129a15a993781a09be5f5cc9d745520ec956fa84))
- analytics service ([20cb1b8](https://github.com/apptension/saas-boilerplate/commit/20cb1b880045a16ceac6291da8bc91ea2d3e135b))
- Generate SaaS ideas module ([5454945](https://github.com/apptension/saas-boilerplate/commit/5454945dc55cf5e47f352d4268277c48dc6afed4))
- enable analytics ([89272c1](https://github.com/apptension/saas-boilerplate/commit/89272c18ef436d1b8620da1b0a873309ca0aa4ed))
- Init new docs structure ([6f41297](https://github.com/apptension/saas-boilerplate/commit/6f41297d776a88da6485499f7b444a3bfbbcaa62))
- New docs structure ([601995b](https://github.com/apptension/saas-boilerplate/commit/601995b4c86fa75c005c3eb4f745d4a932c0088b))
- Update Django to 4.2.0 LTS version ([0daf657](https://github.com/apptension/saas-boilerplate/commit/0daf65796b356187070e97e1de68ef55f297eb0d))
- Adjust auth flow to support header and cookie auth ([812541c](https://github.com/apptension/saas-boilerplate/commit/812541c5c888c15f565b788999e7dbcb0a935729))
- Start working on new documentation content ([4be1e43](https://github.com/apptension/saas-boilerplate/commit/4be1e43485bbb25dafcf41324d2b32fc08f6bae2))
- Update CLI init command ini docs ([cb4b974](https://github.com/apptension/saas-boilerplate/commit/cb4b974a85b99abd3db029bfc1cda9bb4a514ee5))
- Update README file, update stack description in docs ([4497540](https://github.com/apptension/saas-boilerplate/commit/449754024bea5b04f40993b67b93d815ac4fa285))

### Bug Fixes

- Apply higher memory limit to docusaurus build and start scripts ([aa2c678](https://github.com/apptension/saas-boilerplate/commit/aa2c67888a26254b56e96e2e33878288d8a5f0c5))
- Create exports-bucket locally ([632fba3](https://github.com/apptension/saas-boilerplate/commit/632fba321e82b2f3fd2f8dd716020cccf28b9adf))
- Do not skip setup script when ENV_STAGE is empty ([3d7f112](https://github.com/apptension/saas-boilerplate/commit/3d7f11207916c604f8a26eea2197120ebc083ae1))
- E2E tests setup ([4f28fa3](https://github.com/apptension/saas-boilerplate/commit/4f28fa3ca6bcd2babb166fbced9506412d7f849d))
- fix env vars and web app tests ([ddf981a](https://github.com/apptension/saas-boilerplate/commit/ddf981a82b8e0378ee6236b3138aaeeb50aa1555))
- Fix font loading and signup page styles ([076b2bf](https://github.com/apptension/saas-boilerplate/commit/076b2bf183db95529699bde66ab4cfb706136b2a))
- Fix setup script and write documentation on how to set up the project ([5c9b316](https://github.com/apptension/saas-boilerplate/commit/5c9b3169f4d71501803249503519133c9aab3e60))
- fix storybooks ([dc01af6](https://github.com/apptension/saas-boilerplate/commit/dc01af68d5098c61a343e437ad0df4fdeaf7c5b8))
- Fixes to storybooks (pull request ) ([1b3e38b](https://github.com/apptension/saas-boilerplate/commit/1b3e38bf084302617bd2a98d56c2b45b67f7dcad))
- Installation of pnpm on BB pipelines ([423f3a2](https://github.com/apptension/saas-boilerplate/commit/423f3a24b86492c03e1d08179a486a95fc2f5d2c))
- Invalid .versionrc.js file ([fb6a3b4](https://github.com/apptension/saas-boilerplate/commit/fb6a3b44454ea3ed61f7803ecf36450c079b13d2))
- local ws server unknown module error ([1c3a04d](https://github.com/apptension/saas-boilerplate/commit/1c3a04daee6b084319bd73242da57c5ebad20d15))
- Missing .tsx files included in tsconfig.lib.json in `webapp-core` package ([a667443](https://github.com/apptension/saas-boilerplate/commit/a667443388fc9248b7def01de1fe7b669f6f8b02))
- Move secrets editor out of SSM to avoid any stdin and stdout issues ([8105dfa](https://github.com/apptension/saas-boilerplate/commit/8105dfa9f6b574352fb8e66a3cc64a071a19f453))
- Move workers AWS_ENDPOINT_URL from .env.shared (pull request ) ([5eeceb5](https://github.com/apptension/saas-boilerplate/commit/5eeceb52a967e491162485982f7cb159ba184adb))
- Reference docker-compose.local in backend Makefile ([fc01243](https://github.com/apptension/saas-boilerplate/commit/fc012432945745adfc7d88230ec20552ba337453))
- Remove the default build dependencies from documentation build ([a4657b6](https://github.com/apptension/saas-boilerplate/commit/a4657b67f8536f65a02e558c60dc248814e8b7f2))
- revert env.ts changes that removes TS4111 error ([fbc0ced](https://github.com/apptension/saas-boilerplate/commit/fbc0ced41eceaae69309f51b6fcd0abc5605d1d0))
- Facebook oauth flow can't be canceled without an error ([793232f](https://github.com/apptension/saas-boilerplate/commit/793232f7f35cb95a9e2101067142ca624b1e0933))
- Mark failed refund unsuccessful ([27fae1d](https://github.com/apptension/saas-boilerplate/commit/27fae1d19f8f6670affccf40f58150c2acfbae8a))
- Fix analytics: Remove ga, add GTM ([6436c62](https://github.com/apptension/saas-boilerplate/commit/6436c62032cdf336d0c4cecc99e1a2c83695e1f7))
- cache policy for request ([a3bae58](https://github.com/apptension/saas-boilerplate/commit/a3bae58f1539aa4c8fdb16338cfab0d552573b0f))
- add new card submit payment ([0d77710](https://github.com/apptension/saas-boilerplate/commit/0d777106b093c8888d97e986d3028bfe6a29d5a9))
- Map staticfiles dir to docker volume locally ([27bed99](https://github.com/apptension/saas-boilerplate/commit/27bed9992e3fbf4db76f4a754d276f8f9cb13a44))
- camera icon on profile view ([d6b6c8a](https://github.com/apptension/saas-boilerplate/commit/d6b6c8a86fffe007319aeb023ba1dfa0c6299d01))
- redirect to details after create crud item ([f82b123](https://github.com/apptension/saas-boilerplate/commit/f82b12369bf3ba5a614af9052b4d7579e01f4195))
- Recover test npm script in webapp package ([d0969ff](https://github.com/apptension/saas-boilerplate/commit/d0969ff8d7666fcda0fe6aa819a4cc2c58c9201d))
- AWS X-Ray spams logs with EndpointConnectionError locally ([20ea3d7](https://github.com/apptension/saas-boilerplate/commit/20ea3d7f478550ac4b1e42315fdd7891c204e81d))
- Permission denied on currentUser query when not logged in ([285b44f](https://github.com/apptension/saas-boilerplate/commit/285b44fb1bbb5eb53185bef94a101d9dffafec50))
- Include **pypackages** in serverless workers deployment ([f0d9196](https://github.com/apptension/saas-boilerplate/commit/f0d91967209a0f835722a5e8e02a52912e999987))
- Missing CSRF_TRUSTED_ORIGINS ([e192816](https://github.com/apptension/saas-boilerplate/commit/e192816b9284e8d0a46d5fd27c4ca962a2c3cac9))
- click away listener child ([831ac13](https://github.com/apptension/saas-boilerplate/commit/831ac138cd5d529bb3cfd2d7ccab2c4c4201f88e))
- Fix stripe storybooks ([c8246b1](https://github.com/apptension/saas-boilerplate/commit/c8246b19bf9d20f015a1d90f23da1b7070c56cf3))
- Invalid email template config ([993f5a2](https://github.com/apptension/saas-boilerplate/commit/993f5a2ba668bbf662e1cdb80f5faa49897a89db))
- Fix automatic deployment, update CDK to 2.66.0 ([c301f75](https://github.com/apptension/saas-boilerplate/commit/c301f75ea660784d9c7afa3846fa94ab0cacfdfa))
- Fix invalid entrypoint code build project ARN in trigger lambda ([e99481f](https://github.com/apptension/saas-boilerplate/commit/e99481f0c14832b419a971e5674b298690255d88))
- Fix read of DEPLOY_BRANCHES in trigger endpoint lambda ([50ce03b](https://github.com/apptension/saas-boilerplate/commit/50ce03be88fa3adce7c5da9373589d992d47ab1b))
- Fix console error ([cdd66c1](https://github.com/apptension/saas-boilerplate/commit/cdd66c13dfdb4516496049dce99abb5a65c3d875))
- Rename all remaining REACT*APP* envs to VITE\_ ([708ea3e](https://github.com/apptension/saas-boilerplate/commit/708ea3e85ddefa35cd06fe3a39ca3a7c8b2bf1e4))
- Use correct host by vide dev server, adjust prettier config to sort imports correctly ([34e5525](https://github.com/apptension/saas-boilerplate/commit/34e55257a4afee5f98224f6b4a2ab84d640ae013))
- fix crud plop tests ([dc1d4f5](https://github.com/apptension/saas-boilerplate/commit/dc1d4f5a3df83564a4e0ceecc7f908a427a6c3c6))
- Subscription plan type ([b990015](https://github.com/apptension/saas-boilerplate/commit/b9900152d082b3e23ee42e97ca60cf49177fd388))
- Fix snackbar bug causing id duplication ([208b2a8](https://github.com/apptension/saas-boilerplate/commit/208b2a88f09e4d5dcf228ee68cc79582baaa70ac))
- Fix download schema script (pull request ) ([ea55336](https://github.com/apptension/saas-boilerplate/commit/ea55336005019fa814c5003ddf7554c4d42e02ca))
- method selector network only ([d11b368](https://github.com/apptension/saas-boilerplate/commit/d11b368c54963c7175952ef11a22c75b961dbb7d))
- Change storybook port ([1b1606f](https://github.com/apptension/saas-boilerplate/commit/1b1606f1b21218d1ab3afb38134d63553bb3e6c3))
- Fix contentful stories ([cb8a6f4](https://github.com/apptension/saas-boilerplate/commit/cb8a6f4e6e040e7a89c6a8b7d91194396b42896b))
- error on logout ([75915db](https://github.com/apptension/saas-boilerplate/commit/75915db14f07c0208577a3e6acc71bcff63e24f7))
- handle missing locale on routes ([74fc8b1](https://github.com/apptension/saas-boilerplate/commit/74fc8b106b87631381acd5d8a0213f34ed480946))
- Fix all typescript errors ([8c4c541](https://github.com/apptension/saas-boilerplate/commit/8c4c5411ddaae52d40ae02fb14e4527d8d67c150))
- Correctly parse client IP from x-forwarded-for header ([0bf1f4e](https://github.com/apptension/saas-boilerplate/commit/0bf1f4ea9e78d8618f65baf8722c0088031b2a7d))
- Google OAuth login not working ([c3ec62d](https://github.com/apptension/saas-boilerplate/commit/c3ec62df571d908cc6056be8f2c4c7550a6acb28))
- Cannot upload avatar ([db21e10](https://github.com/apptension/saas-boilerplate/commit/db21e10ffcf8c00e46a57525ecc4fae5e5bfb828))
- Skip stripe initialization if stripe keys contain <CHANGE_ME> ([54fbe85](https://github.com/apptension/saas-boilerplate/commit/54fbe851bfce209fb328b742d561f26ae066dac5))
- un-skip edit default payment method tests ([1925d37](https://github.com/apptension/saas-boilerplate/commit/1925d37149f890816aedab5437c07ee3a17210a0))
- Use only one build command in docs project.json ([d424eaf](https://github.com/apptension/saas-boilerplate/commit/d424eaf5144a8257b58ff73da0747d99837402eb))
- Workers image build ([126bc01](https://github.com/apptension/saas-boilerplate/commit/126bc019000fa02e385633a796758b25bd1b4093))

### [1.1.1](https://github.com/apptension/saas-boilerplate/compare/1.1.0...1.1.1) (2022-12-09)

### Features

- Update postgres version to 14.4 ([9c7b3ba](https://github.com/apptension/saas-boilerplate/commit/9c7b3ba8b3690b299d47262ca0ebceb1a3b23490))
- Refreshed ApplicationMultipleTargetGroupsFargateService ECS pattern. ([fecb6e5](https://github.com/apptension/saas-boilerplate/commit/fecb6e549526922f68d8219a2fb725929252e803))
- Remove makeContextRederer in favour of custom render method (pull request ) ([2d7dba9](https://github.com/apptension/saas-boilerplate/commit/2d7dba9a26143ed61e9c034a3b6310f07e332a53))
- Remove redux-saga from the project ([93926f3](https://github.com/apptension/saas-boilerplate/commit/93926f3b2dab1a66c81c49bfc6bf1360b800fa01))
- Update web app dependencies ([a646e3f](https://github.com/apptension/saas-boilerplate/commit/a646e3f401cd771324508611d7196e1e62b5a700))

### Bug Fixes

- SB-640, Fix and refactor storybooks ([660c00c](https://github.com/apptension/saas-boilerplate/commit/660c00c04574e8b72c7832c8678d3e5b6842c221))
- Fix plop templates with invalid <FormattedMessage /> definitions ([dff783a](https://github.com/apptension/saas-boilerplate/commit/dff783aeb18d656e73b34ab0c2cde705a2eab66d))
- Use signed CloudFront URLs instead of signed S3 URLs ([96282e6](https://github.com/apptension/saas-boilerplate/commit/96282e6ccbd2c7a30d5ab62dea5bfe96bc8455a1))
- Revert Postgres to 13.7 ([9015e08](https://github.com/apptension/saas-boilerplate/commit/9015e080cab193d85b5510389329e6a8142606a8))
- Fix failing mailcatcher docker image ([c83374e](https://github.com/apptension/saas-boilerplate/commit/c83374e055b7f1ee194955c7769719ed49fa2859))

## [1.1.0](https://github.com/apptension/saas-boilerplate/compare/1.0.2...1.1.0) (2022-10-11)

### Features

- Implement user authentication flow using GraphQL ([067581e](https://github.com/apptension/saas-boilerplate/commit/067581eb904e6a1f374efe56d274ebc5631bb6c9))
- [SB-526, SB-657, Update profile using GraphQL mutation ([6729172](https://github.com/apptension/saas-boilerplate/commit/6729172f649af2175d92bc14903965abf7fadf58))
- Add `psql` helper make rule ([6e6ab6e](https://github.com/apptension/saas-boilerplate/commit/6e6ab6ec05dcb59fa28b919b6da20a1dbac089d8))
- Added 'make aws-login' command. ([9ee1013](https://github.com/apptension/saas-boilerplate/commit/9ee1013046dd00a572c4ea112728c06a9e36aa1d))
- Added automatic docs deployment to pipeline. ([112811a](https://github.com/apptension/saas-boilerplate/commit/112811ac729f746d982b3490a9173a03e1a6596a))
- Allow HTTPS in API docs ([de26d53](https://github.com/apptension/saas-boilerplate/commit/de26d53b4b12b46585d3d84a863ea0d7f1e2b710))
- Allowing boilerplate deployment without Hosted Zone (with externally managed DNS). ([187875f](https://github.com/apptension/saas-boilerplate/commit/187875f17391150447f115a6bc98b40ed27d0fd1))
- Rewrite contentful queries to relay and remove apollo from the project. ([9fa775e](https://github.com/apptension/saas-boilerplate/commit/9fa775ec856a982f1d42b6b85c907307b630380e))
- SB-528, Use GraphQL mutation in signup ([3979e1d](https://github.com/apptension/saas-boilerplate/commit/3979e1dedb394feab726bb6cf24d179911d8a331))
- Confirm user email using GraphQL mutation ([5999455](https://github.com/apptension/saas-boilerplate/commit/5999455720fa35a1d1eea1ff8dae4e31fbe02424))
- Reset user password using GraphQL mutations ([1c71d71](https://github.com/apptension/saas-boilerplate/commit/1c71d71056c62ce8fe489aa245b326fb2ba71270))
- Reimplement contentful item favorite list to GraphQL ([0ca99a7](https://github.com/apptension/saas-boilerplate/commit/0ca99a7a4ee93c77aaf62f812bfbba31ce7b04db))
- Create and update payment intent using GraphQL mutations ([f0eb184](https://github.com/apptension/saas-boilerplate/commit/f0eb1842c6642e139cda75e0d06690b4dc55267f))
- Update user subscription using GraphQL mutation ([0a11269](https://github.com/apptension/saas-boilerplate/commit/0a11269558792468cc6186263de7d6f087c336d0))
- Create stripe setup intent using GraphQL ([a5f0ddc](https://github.com/apptension/saas-boilerplate/commit/a5f0ddcb1573114af8a2cb67f5d099a1b4160e25))
- SB-644, SB-659, Add monitoring dashboard ([3fe49cd](https://github.com/apptension/saas-boilerplate/commit/3fe49cde39c4b4ca61ebdc1dc1ed1119a31d7f88))
- Change user password using GraphQL mutation ([164c668](https://github.com/apptension/saas-boilerplate/commit/164c66819f459e200f7790b6ecd86c91b603a53c))
- Update react-router to v6 (pull request ) ([5298015](https://github.com/apptension/saas-boilerplate/commit/5298015f1a13fe6e31d6420503998d116bdaa789))
- Use a single stitched schema for both api and contentful and call proper one based on operation sub schema origin. ([5cd6cbe](https://github.com/apptension/saas-boilerplate/commit/5cd6cbe56694d11f95a8ff1002f098dbb2675eb6))

### Bug Fixes

- Add support for webp files for user avatar ([4b9ae99](https://github.com/apptension/saas-boilerplate/commit/4b9ae995d1120111a41cc759644daa03c48880b8))
- Refresh active subscription on payment method delete ([f652a40](https://github.com/apptension/saas-boilerplate/commit/f652a4076020ce40e6b978c25cfbc07d0242060c))
- Reload charges list ([dea43b9](https://github.com/apptension/saas-boilerplate/commit/dea43b9fe8965f29fa3dabe92adf5c654d72d75b))
- add missing node field definition to ApiQuery class in common.graphql.utils ([c0ec374](https://github.com/apptension/saas-boilerplate/commit/c0ec3747b852026259f96e00bbd157be3c9a46e8))
- Added required env variables to workers github action ([925b1c3](https://github.com/apptension/saas-boilerplate/commit/925b1c3c807c7d607e3a930d4f73b65b8900e893))
- Fix not unique monitoring dashboard name between envs ([56bbdb0](https://github.com/apptension/saas-boilerplate/commit/56bbdb057ce09358616d8205bf5047bc57b43880))
- Fixed failing backend tests by bumping some outdated packages. Using calleee instead of unmaintained callee to fix deprecation warnings. ([5a48556](https://github.com/apptension/saas-boilerplate/commit/5a48556ae5ba16f98f6aab15b5d6b82ce50bb724))
- make docker work on M1 chip ([bd41c83](https://github.com/apptension/saas-boilerplate/commit/bd41c83f9bb3efef3cc0090222c67cfc579aeef9))
- Remove wrong AWS account instructions ([e167bff](https://github.com/apptension/saas-boilerplate/commit/e167bff56195017a9cf9226a11f60a8cc21cb273))
- Removed hardcoded WebsocketsDeployment resource name from serverless.yml - using default stageName and CloudFront Function to set correct path. ([99b7b9b](https://github.com/apptension/saas-boilerplate/commit/99b7b9bc9d82ff73b6ea5e0c88fb3d9535ef0c4e))
- Add refresh token to blacklist on user logout and reimplement logout without redux-saga ([3b9aa3a](https://github.com/apptension/saas-boilerplate/commit/3b9aa3adb8d0dca4c92c2017668d6dcf22bad9d8))
- Skip E2E test service when running docker compose up on local machine ([27832c4](https://github.com/apptension/saas-boilerplate/commit/27832c4489882692c3cc2370cb206577f9b2f115))
- Update the build-emails.js script and storybook config to support latest react-scripts ([2e2d5ff](https://github.com/apptension/saas-boilerplate/commit/2e2d5ffebe90390ce3df60c6e0f0ffe8d5a21022))

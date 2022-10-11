# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0](https://bitbucket.org/apptension/saas-boilerplate-app/compare/1.0.2...1.1.0) (2022-10-11)


### Features

* [SB-525] [SB-653] Implement user authentication flow using GraphQL ([067581e](https://bitbucket.org/apptension/saas-boilerplate-app/commit/067581eb904e6a1f374efe56d274ebc5631bb6c9))
* [SB-526, SB-657, SB-658] Update profile using GraphQL mutation ([6729172](https://bitbucket.org/apptension/saas-boilerplate-app/commit/6729172f649af2175d92bc14903965abf7fadf58))
* Add `psql` helper make rule ([6e6ab6e](https://bitbucket.org/apptension/saas-boilerplate-app/commit/6e6ab6ec05dcb59fa28b919b6da20a1dbac089d8))
* Added 'make aws-login' command. ([9ee1013](https://bitbucket.org/apptension/saas-boilerplate-app/commit/9ee1013046dd00a572c4ea112728c06a9e36aa1d))
* Added automatic docs deployment to pipeline. ([112811a](https://bitbucket.org/apptension/saas-boilerplate-app/commit/112811ac729f746d982b3490a9173a03e1a6596a))
* Allow HTTPS in API docs ([de26d53](https://bitbucket.org/apptension/saas-boilerplate-app/commit/de26d53b4b12b46585d3d84a863ea0d7f1e2b710))
* Allowing boilerplate deployment without Hosted Zone (with externally managed DNS). ([187875f](https://bitbucket.org/apptension/saas-boilerplate-app/commit/187875f17391150447f115a6bc98b40ed27d0fd1))
* Rewrite contentful queries to relay and remove apollo from the project. ([9fa775e](https://bitbucket.org/apptension/saas-boilerplate-app/commit/9fa775ec856a982f1d42b6b85c907307b630380e))
* SB-528, SB-562 Use GraphQL mutation in signup ([3979e1d](https://bitbucket.org/apptension/saas-boilerplate-app/commit/3979e1dedb394feab726bb6cf24d179911d8a331))
* SB-529 Confirm user email using GraphQL mutation ([5999455](https://bitbucket.org/apptension/saas-boilerplate-app/commit/5999455720fa35a1d1eea1ff8dae4e31fbe02424))
* SB-530 Reset user password using GraphQL mutations ([1c71d71](https://bitbucket.org/apptension/saas-boilerplate-app/commit/1c71d71056c62ce8fe489aa245b326fb2ba71270))
* SB-531 Reimplement contentful item favorite list to GraphQL ([0ca99a7](https://bitbucket.org/apptension/saas-boilerplate-app/commit/0ca99a7a4ee93c77aaf62f812bfbba31ce7b04db))
* SB-534 Create and update payment intent using GraphQL mutations ([f0eb184](https://bitbucket.org/apptension/saas-boilerplate-app/commit/f0eb1842c6642e139cda75e0d06690b4dc55267f))
* SB-537 Update user subscription using GraphQL mutation ([0a11269](https://bitbucket.org/apptension/saas-boilerplate-app/commit/0a11269558792468cc6186263de7d6f087c336d0))
* SB-572 Create stripe setup intent using GraphQL ([a5f0ddc](https://bitbucket.org/apptension/saas-boilerplate-app/commit/a5f0ddcb1573114af8a2cb67f5d099a1b4160e25))
* SB-644, SB-659, SB-660 Add monitoring dashboard ([3fe49cd](https://bitbucket.org/apptension/saas-boilerplate-app/commit/3fe49cde39c4b4ca61ebdc1dc1ed1119a31d7f88))
* SB-689 Change user password using GraphQL mutation ([164c668](https://bitbucket.org/apptension/saas-boilerplate-app/commit/164c66819f459e200f7790b6ecd86c91b603a53c))
* Update react-router to v6 (pull request [#350](https://bitbucket.org/apptension/saas-boilerplate-app/issues/350)) ([5298015](https://bitbucket.org/apptension/saas-boilerplate-app/commit/5298015f1a13fe6e31d6420503998d116bdaa789))
* Use a single stitched schema for both api and contentful and call proper one based on operation sub schema origin. ([5cd6cbe](https://bitbucket.org/apptension/saas-boilerplate-app/commit/5cd6cbe56694d11f95a8ff1002f098dbb2675eb6))


### Bug Fixes

* [SB-698] Add support for webp files for user avatar ([4b9ae99](https://bitbucket.org/apptension/saas-boilerplate-app/commit/4b9ae995d1120111a41cc759644daa03c48880b8))
* [SB-699] Refresh active subscription on payment method delete ([f652a40](https://bitbucket.org/apptension/saas-boilerplate-app/commit/f652a4076020ce40e6b978c25cfbc07d0242060c))
* [SB-700] Reload charges list ([dea43b9](https://bitbucket.org/apptension/saas-boilerplate-app/commit/dea43b9fe8965f29fa3dabe92adf5c654d72d75b))
* add missing node field definition to ApiQuery class in common.graphql.utils ([c0ec374](https://bitbucket.org/apptension/saas-boilerplate-app/commit/c0ec3747b852026259f96e00bbd157be3c9a46e8))
* Added required env variables to workers github action ([925b1c3](https://bitbucket.org/apptension/saas-boilerplate-app/commit/925b1c3c807c7d607e3a930d4f73b65b8900e893))
* Fix not unique monitoring dashboard name between envs ([56bbdb0](https://bitbucket.org/apptension/saas-boilerplate-app/commit/56bbdb057ce09358616d8205bf5047bc57b43880))
* Fixed failing backend tests by bumping some outdated packages. Using calleee instead of unmaintained callee to fix deprecation warnings. ([5a48556](https://bitbucket.org/apptension/saas-boilerplate-app/commit/5a48556ae5ba16f98f6aab15b5d6b82ce50bb724))
* make docker work on M1 chip ([bd41c83](https://bitbucket.org/apptension/saas-boilerplate-app/commit/bd41c83f9bb3efef3cc0090222c67cfc579aeef9))
* Remove wrong AWS account instructions ([e167bff](https://bitbucket.org/apptension/saas-boilerplate-app/commit/e167bff56195017a9cf9226a11f60a8cc21cb273))
* Removed hardcoded WebsocketsDeployment resource name from serverless.yml - using default stageName and CloudFront Function to set correct path. ([99b7b9b](https://bitbucket.org/apptension/saas-boilerplate-app/commit/99b7b9bc9d82ff73b6ea5e0c88fb3d9535ef0c4e))
* SB-683 Add refresh token to blacklist on user logout and reimplement logout without redux-saga ([3b9aa3a](https://bitbucket.org/apptension/saas-boilerplate-app/commit/3b9aa3adb8d0dca4c92c2017668d6dcf22bad9d8))
* Skip E2E test service when running docker compose up on local machine ([27832c4](https://bitbucket.org/apptension/saas-boilerplate-app/commit/27832c4489882692c3cc2370cb206577f9b2f115))
* Update the build-emails.js script and storybook config to support latest react-scripts ([2e2d5ff](https://bitbucket.org/apptension/saas-boilerplate-app/commit/2e2d5ffebe90390ce3df60c6e0f0ffe8d5a21022))

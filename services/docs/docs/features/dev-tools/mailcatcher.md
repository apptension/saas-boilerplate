---
title: Mailcatcher
---

There is a dedicated tool for capturing emails sent from local BE. This can be used to test and debug this functionality.

## Configuration
Before first run one needs to build and pre render those emails.
To do it go to `/services/webapp` and run:
```shell
yarn build-emails
```
## Usage
Tool starts automatically together with main Backend service so there is nothing special.
To access mailcather, please go to `localhost:1080`

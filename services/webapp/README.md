This project was bootstrapped
with [Create React App (by Apptension)](https://github.com/apptension/react-scripts-apptension).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more
information.

### `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will
remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right
into your project so you have full control over them. All of the commands except `eject` will still work, but they will
point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you
shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t
customize it when you are ready for it.

### `yarn extract-intl language1, language2, [...]`

Automatically generates `.json` files with messages gathered from application.

### `yarn lint`

Lints your JavaScript.

### `yarn plop`

Generate Redux module (reducer, saga, selectors, action types, action creators, tests):

```Shell
yarn plop module
```

Generate Redux container and its react component in specified path:

```Shell
yarn plop container
```

Generate React component (class or function) in specified path

```Shell
yarn plop component
```

## Learn More

You can learn more on [Create React App (by Apptension)](https://github.com/apptension/react-scripts-apptension).

## Make rules

### `make install`

You should configure this rule in Makefile to install web app's dependencies

#### Example rule

```makefile
test:
	npm install
```

### `make install-deploy`

This rule will be used by CodeBuild to install dependencies required to deploy previously built artifact.
This rule should most likely stay unchanged unless you know what you're doing!

### `make test`

You should configure this rule in Makefile to run your web app's tests and linters

#### Example rule

```makefile
test:
	npm run test
```

### `make build`

You should configure this rule in Makefile to run your web app's build step

#### Example rule

```makefile
build: test
	npm run build
```

### `make deploy`

This rule will deploy the app to AWS. Make sure you log in to AWS first using `make aws-vault` command.

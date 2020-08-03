# Prerequisites

There are several tools required to run this boilerplate. Since these are assumed to be global, they won't be installed by the boilerplate setup script. Make sure you have them installed on your machine before going any further. 

## node

A supported version of `node` is required, together with the `npm` package manager.

Check the [official docs](https://nodejs.org/en/download/package-manager/#macos) for installation instructions for your platform. On a Mac, you can use Homebrew:

    brew install node

## yarn

`yarn` is used for managing Node packages. If it isn't already installed, install it globally using `npm`:

    npm install -g yarn

## pipenv

`pipenv` is used for managing Python dependencies installed locally.

See [official documentation](https://github.com/pypa/pipenv#installation) for installation instructions, or use Homebrew if you're on a Mac:

    brew install pipenv

## pyenv

`pyenv` is used to manage separate versions of the Python runtime.

Once again, read the [docs](https://github.com/pyenv/pyenv#installation) for installation instruction, or use Homebrew on a Mac:

    brew install pyenv

## Docker

`docker` in required for building and pushing the images and for running the containers locally.

See [official docs](https://docs.docker.com/engine/install/) for installation instructions.
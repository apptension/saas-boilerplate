from distutils.core import setup, Command


class PyTest(Command):
    user_options = []

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        import subprocess
        errno = subprocess.call(['bash', './scripts/wait-for-it.sh', 'db:5432'])
        if errno:
            raise SystemError(errno)

        errno = subprocess.call(['pipenv', 'run', 'pytest'])
        raise SystemExit(errno)


setup(cmdclass={'test': PyTest})

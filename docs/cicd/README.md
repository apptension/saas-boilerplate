# AWS Boilerplate CI / CD
Each deployed environment comes with a preconfigured CI/CD implemented with AWS CodeCommit, AWS CodeBuild, 
and AWS CodePipeline. The general idea of the deployment is for the user to push the code to a `master` branch of the 
CodeCommit repository created by the Ci CDK Stack.

<p align="center"> <img src="/docs/images/cicd-diagram-v3.png" alt="CI/CD Diagram" /> </p>

## Automatically synchronize external repository

### Get authenticated repository URL
AWS Boilerplate generates a user for you that has minimal permissions required for pushing code to the CodeCommit 
repository. In order to implement a synchronization logic we need to get a repository URL and credentials of the user.
You can create both using a following command:

> Note: This command will output a value with a password in a plain text!
> You can pipe it to `xclip` in Linux or to `pbcopy` in Mac OS to save it directly to your clipboard.

```sh
make aws-vault
make create-repo-auth-url 
```

### Configure Github

1. Open `Settings` page of your repository.

2. Go to `Secrets` subpage.

3. Create a new Secret named `CODE_COMMIT_REPO` with value set to 
[authenticated repository URL](#get-authenticated-repository-url)

4. Test by pushing some code to your Github repository. After couple of seconds the code should be synchronized in CodeCommit.

### Configure Bitbucket

1. Open `Repository Settings` page of your repository.

2. Go to `Pipeline / Settings` sub-page.

3. Enable Bitbucket Pipelines.

4. Go to `Pipeline / Repository variables` sub-page.

5. Create a new Secret named `CODE_COMMIT_REPO` with value set to 
[authenticated repository URL](#get-authenticated-repository-url)

6. Test by pushing some code to your BitBucket repository. After couple of seconds the code should be synchronized in CodeCommit.

## Trigger deployment automatically

If you want a branch to be deployed automatically for every pushed commit the only thing you need to do is to name this branch
in your environment configuration file using `deployBranches` property. Check out the 
[environment docs](/docs/app-environment#configuration-file-specification) for more details.

## Trigger deployment manually

You can also trigger a deployment manually using AWS Console!

1. Navigate to `CodeBuild` service.

2. Find the entrypoint project named `<PROJECT_NAME>-<ENV_STAGE_NAME>` (e.g. `mypro-dev`) and navigate to it by pressing 
its name.

3. Press the "Start build" button.

4. Select the source branch and optionally a commit ID.

5. Submit by pressing "Start build" button.

6. The Pipeline should start in a few seconds.

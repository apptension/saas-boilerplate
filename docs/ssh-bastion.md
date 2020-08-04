# SSH Bastion

You can create a temporary ECS task that uses backend image to spawn a container with a SSH server.
Using this bastion you can call commands and scripts in your app's environment in a secure way.

> Note: Use with caution! Always make sure that the task is killed after you are done using it.

## How do I use it?

### `make ssh-bastion`
Deploy new ECS task using backend image tagged with `ssh-bastion` tag and connect.

#### `make ssh-bastion` arguments

#### `public_key`
Select a SSH public key which will be added to SSH server's `~/.ssh/authorized_keys` file.

Default value: `~/.ssh/id_rsa.pub`

Example: `make ssh-bastion public_key=~/.ssh/id_rsa.pub`

#### `private_key`
Select a SSH private key which will be used to connect to SSH server. It should be a private key matching the public key
used in `public_key` argument.

Default value: `~/.ssh/id_rsa`

Example: `make ssh-bastion private_key=~/.ssh/id_rsa`

### Example
```shell
make aws-vault ENV_STAGE=dev    # Activate AWS environment
cd services/backend             # Go to backend service

make ssh-bastion                # Start the bastion service. It will automatically open SSH connection.
```



### Connect to RDS instance using SSH tunnel 
You can use the bastion as a regular SSH tunnel. Just use bastion's ip address in your tunneling software and a the same
private key and you're good to go.

You probably should not be interacting with database directly and use this approach as a last resort.

> You should not be running this in production environment.


#### Get DB credentials
Run this command inside SSH bastion to get RDS instance host, username and password. 
```shell
echo "$DB_CONNECTION"           # !warning! This will print out your connection string
```

#### Get bastion's IP address
The IP address is printed to console during bastion's setup.

#### Get SSH username
The username is printed to console during bastion's setup.

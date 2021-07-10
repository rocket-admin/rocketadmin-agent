# Autoadmin-agent

There are two options for installing Autoadmin-agent: using Yarn or Docker.


## Install via Yarn

First step is installing actual [Yarn](https://yarnpkg.com/getting-started/install).
Depending on the way you install Yarn, some package managers will include Node.js.
If not, please install [Node.js](https://nodejs.org) as well.

Second step – download the [source code](https://github.com/Autoadmin-org/autoadmin-agent/archive/refs/heads/master.zip).

Third step – open **.config.env** file and specify all required credentials.

Open Terminal app and change directory to the downloaded Autoadmin-agent folder.

Run following commands one by one:

```sh
yarn install
yarn start
```
After sucessfull execution, new connection will appear in Autoadmin Connections List.



## Install via Docker

First step is installing actual [Docker](https://docker.com).
On Linux, please install [Docker Compose](https://docs.docker.com/compose/install/) as well.
> Note: Docker Desktop on Windows and MacOS already include Docker Compose.

Second step – create **docker-compose.yml** file. 
Copy and paste configuration from [(source file)](https://github.com/Autoadmin-org/autoadmin-agent/blob/master/docker-compose.yml) or download this file.

Third step – create **.config.env** file in the same directory. 
Copy and paste the contents of [(source file)](https://github.com/Autoadmin-org/autoadmin-agent/blob/master/.config.env) or download this file.

Fourth step – open **.config.env** file and specify all required credentials.


Open Terminal app and run:

```sh
docker-compose up --build
```
After sucessfull execution, new connection will appear in Autoadmin Connections List.


# Autoadmin-agent

There are two options for installing Autoadmin-agent: using Docker Desktop (for MacOS and Windows) or using Docker Engine (for Linux).


## Installing via Docker Desktop

First step is installing [Docker Desktop](https://www.docker.com/products/docker-desktop).
Second step – run Docker Dektop app.
Third step - install [WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install-win10) on Windows if required.

Open Terminal app and run following commands:

```sh
docker run --name repo alpine/git clone https://github.com/Autoadmin-org/autoadmin-agent.git

docker cp repo:/git/autoadmin-agent/ . 
```
After that proceed to the created directory. It's located:

Windows - *C:\Users\username\autoadmin-agent*
MacOS - *Macintosh HD\Users\username\autoadmin-agent*

Fourth step – open **.config.env** file and specify all required credentials.

After that, go back to the Terminal app and run following commands:
```sh
cd autoadmin-agent
docker build -t autoadminagent . 

docker run -d -p 80:80 --name autoadmin-agent autoadminagent
```
After sucessfull build and run of Docker container, new connection will appear in Autoadmin Connections List.



## Install via Docker Compose

First step is installing [Docker Engine](https://docker.com).
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

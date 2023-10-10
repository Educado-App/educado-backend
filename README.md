# Educado creator studio
Educado Creator studio + backend, a learning creation application based on the following tools:

- Nodejs
- express
- axious
- react
- material ui
- redux
- aws s3
- mongodb
- google Oauth

## Step-by-step guide to run Educado development setup
Below is a short guide explaining how to set up and run Educado in development mode. 

### Setting up Node environment
- Ensure that local version of Node.js is latest stable version (v16.14.2)
    - run `node --version`
    - if version == v16.14.2, then all is good :)
    - if version is NOT v16.14.2 then do the following
        - Ensure that you have npm installed
        - run `npm install -g n` to install node version manager 
        - when installed, run `n stable`, to install latest stable version of node 

### Setting up local repository
- Go to GitLab page and clone (with ssh) the Colibri repository
- Create dev.js file for development keys in /config directory
- Get dev keys from Daniel/Jacob and insert into dev.js file and save
The dev keys contain the following values:
1. googleClientID
2. googleClientSecret
3. mongoURI
4. cookieKey
5. s3 Bucket name

### Installing node dependencies 
- Navivate into the cloned repository
- In root folder of the repo run `npm install`
- Navigate into the client-web directory
- Run `npm install` again


### Run app in development mode
- Run `npm run dev` to start application 
- By default the web-client runs on ://localhohst:3000
- ...and rest api runs on ://localhost:8888
- Local proxy (from client-web) handles communnication link between them

## Docker Commands
- `npm run docker`
  - **Description:** Starts the Docker containers in the background.
  - **Command:** `docker-compose up -d`

- `npm run docker_down`
  - **Description:** Stops and removes the Docker containers defined in the Docker Compose configuration.
  - **Command:** `docker-compose down`

- `npm run docker_build`
  - **Description:** Builds and starts the Docker containers in the background. This command will rebuild the containers even if there are cached layers available.
  - **Command:** `docker-compose up -d --build`

- `npm run docker_clean_db`
  - **Description:** Stops and removes the Docker containers and the volume associated with the MongoDB container, and then starts the MongoDB container with a fresh build. This command is useful for resetting the database to a clean state.
  - **Command:** `docker-compose down && docker volume rm educado-backend_mongodb_data && docker-compose up -d --build mongodb`

## Notes
- It’s important to use the appropriate command depending on whether you are in a development or production environment.
- The Docker commands are intended to be run in an environment where Docker is installed and configured.
- Ensure that no other services are running on the ports that are configured in `docker-compose.yml` to avoid port conflicts.

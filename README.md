# Educado backend

A backend handling both the web and app part of the 

- Nodejs
- express
- MongoDB/Mongoose
- Axios

## Step-by-step guide to run Educado development setup
Below is a short guide explaining how to set up and run Educado in development mode. 

### Setting up Node environment
- Ensure that local version of Node.js is latest stable version (v16.14.2)
    - run `node --version`
    - if version == v20.9.0, then all is good :)
    - if version is NOT v20.9.0 then do the following
        - Ensure that you have npm installed
        - run `npm install -g n` to install node version manager 
        - when installed, run `n stable`, to install latest stable version of node 

### Setting up local repository

- Go to GitHub page and clone (with ssh or GitHub Desktop) the repository

- Create .env file for development keys in /config directory

- Get the .env file from whoever is in charge of the .env files. The 2023 responsible was Frederik Bode Thorbensen: from Software semester 7 of AAU CPH.

- Insert all the information into a .env file and save.

The .env file should contain the following values:
1. GOOGLE_CLIENT_ID
2. GOOGLE_CLIENT_SECRET
3. MONGO_URI
4. MONGO_URI_TEST
5. TOKEN_SECRET
6. COOKIE_KEY
7. GOOGLE_APPLICATION_CREDENTIALS
8. GMAIL_USER
9. GMAIL_APP_PASSWORD

- Create a filed called gcp_service.json file in path: /config, that contains the the following:

The gcp_service.json file should contain the following fields: 
1. type
2. project_id
3. private_key_id
4. private_key
5. client_email
6. client_id
7. auth_uri
8. token_uri
9. auth_provider_x509_cert_url
10. client_x509_cert_url
11. universe_domain

- Insert the information into a file called gcp_service.json and save.

Remember, these secrets are exactly that... Secrets... So make extra sure they are git-ignored (or someone will be very mad)

### Installing node dependencies 
- Navivate into the cloned repository
- In root folder of the repo run `npm install`

### Run app in development mode
- Run `npm run dev` to start application 
- Rest api runs on ://localhost:8888

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

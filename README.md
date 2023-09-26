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
        - Find the newest stable node version on the web and download it

### Setting up local repository
- Clone the repository
- Create .env file for development keys in /config directory
- Get dev keys from Daniel/Jacob and insert into .env file and save
The dev keys contain the following values:
1. googleClientID
2. googleClientSecret
3. mongoURI
4. cookieKey
5. s3 Bucket name

### Installing node dependencies 
- Navigate into the cloned repository
- In root folder of the repo run `npm install`

### Run app in development mode
- Run `npm run dev` to start application 
- By default the web-client runs on ://localhohst:8888
- ...and rest api runs on ://localhost:8888
- Local proxy (from client-web) handles communnication link between them

### Setting up GCP CLI
Needs description

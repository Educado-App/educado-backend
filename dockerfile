# Use an official Node.js image as the base image
FROM node:16

# Install Python and pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip and setuptools to ensure compatibility with newer packages
RUN pip3 install --upgrade pip setuptools

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Install Python dependencies
RUN pip3 install openai python-dotenv prompt

# Expose the port your Express.js server will listen on
EXPOSE 8888

# Define the command to start your Express.js application
CMD ["npm", "run", "staging"]

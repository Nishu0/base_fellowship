FROM node:22.13.0-slim

# Install Python and build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    gcc \
    g++ \
    python-is-python3 \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g ts-node

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Build the TypeScript files
RUN npm run build

# Expose port 8080
EXPOSE 8080

# Start the app
CMD npm run start

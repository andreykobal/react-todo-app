FROM node:22

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend package.json and install dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy the rest of the application
COPY . .

# Build the frontend
RUN npm run build

# Expose port 8000
EXPOSE 8000

# Start the application
CMD ["npm", "start"] 
# Use a supported Node.js LTS runtime to receive current security fixes
FROM node:24-alpine

# Store the application in a predictable container directory
WORKDIR /usr/src/app

# Copy dependency manifests first to improve Docker layer caching
COPY package.json package-lock.json ./

# Install exact production dependencies and remove the npm cache
RUN npm ci --omit=dev && npm cache clean --force

# Copy the application source into the image
COPY --chown=node:node . .

# Run the application with the non-root user provided by the Node image
USER node

# Document the port used by the Express application
EXPOSE 8080

# Run Node directly so operating-system signals reach the application
CMD ["node", "app.js"]

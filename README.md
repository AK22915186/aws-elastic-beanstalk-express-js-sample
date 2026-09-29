# AWS Elastic Beanstalk Express JS Sample CI/CD Project

This repository contains a fork of the AWS Node.js Express sample application. It has been extended with automated tests, a hardened application Dockerfile, dependency vulnerability scanning, and a Jenkins pipeline.

## CI/CD Pipeline

The Jenkins pipeline performs the following stages:

1. Installs exact dependencies with `npm ci` using a Node 16 Docker build agent.
2. Runs positive and negative automated tests with Mocha and Supertest.
3. generates and archives a complete npm dependency audit report.
4. Enforces a security gate that stops the pipeline when High or Critical vulnerabilities are found in production dependencies.
5. Builds the application container image.
6. Publishes build-number and `latest` image tags to Docker Hub.

## Security Design

The complete npm audit report includes production and development dependencies for visibility. The blocking security gate evaluates production dependencies because only production dependencies are installed in the runtime image.

The application image uses a supported Node.js LTS Alpine image and runs as the non-root `node` user. Jenkins accesses Docker-in-Docker over TLS, and Docker Hub credentials are stored in Jenkins rather than committed to this repository.

## Requirements

The pipeline requires:

- Jenkins with Docker Pipeline support
- Docker-in-Docker configured over TLS
- A Jenkins username and password credential with ID `dockerhub-creds`
- Access to the Docker Hub repository

## Docker Image

Docker Hub repository:

[22915186ajika/nodejs-sample-app](https://hub.docker.com/r/22915186ajika/nodejs-sample-app)

Run the latest successful image:

```bash
docker run --rm -p 8080:8080 22915186ajika/nodejs-sample-app:latest
```

Open `http://localhost:8080` in a browser.

## Local Testing

Run the tests with the assignment-required Node 16 image:

```bash
docker run --rm \
  -v "$PWD":/app \
  -w /app \
  node:16 \
  sh -c "npm ci && npm test"
```

Run the production dependency security gate:

```bash
docker run --rm \
  -v "$PWD":/app \
  -w /app \
  node:16 \
  npm audit --omit=dev --audit-level=high
```

## Source

The original sample application was forked from:

[aws-samples/aws-elastic-beanstalk-express-js-sample](https://github.com/aws-samples/aws-elastic-beanstalk-express-js-sample)

## License

This project retains the original MIT-0 license.

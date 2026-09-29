pipeline {
    // Use the Jenkins controller because it has the Docker CLI connection
    // to DinD and provides a shared workspace for all pipeline stages.
    agent any

    environment {
        // Docker Hub repository used to publish the application image.
        IMAGE_NAME = '22915186ajika/nodejs-sample-app'

        // Give every build an immutable tag based on its Jenkins build number.
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    options {
        // Add timestamps to logs for troubleshooting and audit evidence.
        timestamps()

        // Prevent concurrent builds from modifying the shared workspace.
        disableConcurrentBuilds()

        // Retain only the ten most recent builds to control storage usage.
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        // Install exact dependencies using the required Node 16 build agent.
        stage('Install dependencies') {
            agent {
                docker {
                    image 'node:16'
                    args '-u 1000:1000 -e HOME=/tmp'
                    reuseNode true
                }
            }

            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci'
            }
        }

        // Run automated positive and negative tests using Node 16.
        stage('Unit tests') {
            agent {
                docker {
                    image 'node:16'
                    args '-u 1000:1000 -e HOME=/tmp'
                    reuseNode true
                }
            }

            steps {
                sh 'npm test'
            }
        }

        // Run security checks before image build and publication so vulnerable
        // production dependencies cannot be packaged or pushed to the registry.
        stage('Dependency security scan') {
            agent {
                docker {
                    image 'node:16'
                    args '-u 1000:1000 -e HOME=/tmp'
                    reuseNode true
                }
            }

            steps {
                // Record all findings, including development dependencies.
                sh 'npm audit --json > npm-audit-report.json || true'

                // Fail on High or Critical findings in production dependencies.
                sh 'npm audit --omit=dev --audit-level=high'
            }
        }

        // Build the application image only after tests and security checks pass.
        stage('Build Docker image') {
            steps {
                sh '''
                    docker build --pull \
                      --tag "$IMAGE_NAME:$IMAGE_TAG" \
                      --tag "$IMAGE_NAME:latest" \
                      .
                '''
            }
        }

        // Authenticate using a Jenkins-managed token and publish both tags.
        stage('Push to Docker Hub') {
            steps {
                script {
                    try {
                        withCredentials([
                            usernamePassword(
                                credentialsId: 'dockerhub-creds',
                                usernameVariable: 'DOCKERHUB_USERNAME',
                                passwordVariable: 'DOCKERHUB_TOKEN'
                            )
                        ]) {
                            // Pass the token through stdin so it is not exposed
                            // as a command-line argument or stored in the repo.
                            sh '''
                                echo "$DOCKERHUB_TOKEN" |
                                  docker login \
                                    --username "$DOCKERHUB_USERNAME" \
                                    --password-stdin
                            '''

                            sh 'docker push "$IMAGE_NAME:$IMAGE_TAG"'
                            sh 'docker push "$IMAGE_NAME:latest"'
                        }
                    } finally {
                        // Remove Docker Hub authentication after every attempt.
                        sh 'docker logout || true'
                    }
                }
            }
        }
    }

    post {
        always {
            // Preserve the complete audit report as Jenkins build evidence.
            archiveArtifacts(
                artifacts: 'npm-audit-report.json',
                allowEmptyArchive: true,
                fingerprint: true
            )

            echo 'Pipeline execution finished.'
        }

        success {
            echo "Published ${IMAGE_NAME}:${IMAGE_TAG} and ${IMAGE_NAME}:latest."
        }

        failure {
            echo 'The pipeline failed. Review the stage logs and audit report.'
        }

        cleanup {
            // Remove local image tags and workspace files after archiving.
            sh 'docker image rm "$IMAGE_NAME:$IMAGE_TAG" "$IMAGE_NAME:latest" || true'
            deleteDir()
        }
    }
}

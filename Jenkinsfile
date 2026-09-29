pipeline {
    // Use the Jenkins controller as the top-level agent because it has the
    // Docker CLI connection to DinD and provides one shared workspace.
    agent any

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
    }

    post {
        always {
            // Reports and artifacts will be archived here before cleanup.
            echo 'Pipeline execution finished.'
        }

        success {
            echo 'Dependency installation and unit tests completed successfully.'
        }

        failure {
            echo 'The pipeline failed. Review the stage logs for details.'
        }

        cleanup {
            // Run last so reports can be archived before deleting the workspace.
            deleteDir()
        }
    }
}

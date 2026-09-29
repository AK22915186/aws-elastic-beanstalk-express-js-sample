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
            echo 'Dependencies, tests, and security checks completed successfully.'
        }

        failure {
            echo 'The pipeline failed. Review the stage logs and audit report.'
        }

        cleanup {
            // Run last so reports are archived before workspace deletion.
            deleteDir()
        }
    }
}

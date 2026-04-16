pipeline {
    agent any

    environment {
        SONAR_PROJECT_KEY = 'JrinconRG_tallercontrol'
        SONAR_PROJECT_NAME = 'tallercontrol'
        IMAGE_NAME = 'sigec'
        CONTAINER_NAME = 'sigec'
        PORT = '80'
    }

    stages {

        stage('Install dependencies') {
            agent {
                docker {
                    image 'node:20'
                }
            }
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests with Coverage') {
            agent { docker { image 'node:20' } }
            environment {
                VITE_SUPABASE_URL      = credentials('SUPABASE_URL')
                VITE_SUPABASE_ANON_KEY = credentials('SUPABASE_ANON_KEY')
            }
            steps {
                sh 'npm run test -- --coverage'
            }
        }

        stage('SonarQube Analysis') {
            agent any
            steps {
                script {
                    def scannerHome = tool name: 'SonarScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'

                    withSonarQubeEnv('SonarQube') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                        -Dsonar.projectName="${SONAR_PROJECT_NAME}" \
                        -Dsonar.sources=src \
                        -Dsonar.tests=src \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                        -Dsonar.sourceEncoding=UTF-8
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            agent any
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            agent any
            steps {
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Deploy Container') {
            agent any
            steps {
                sh """
                docker rm -f ${CONTAINER_NAME} || true
                docker run -d --name ${CONTAINER_NAME} -p ${PORT}:80 ${IMAGE_NAME}
                """
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'coverage/**,coverage.xml', fingerprint: true
        }
    }
}
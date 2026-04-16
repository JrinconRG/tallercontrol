pipeline {
    agent any

    environment {
        SONAR_PROJECT_KEY  = 'JrinconRG_tallercontrol'
        SONAR_PROJECT_NAME = 'tallercontrol'
        IMAGE_NAME         = 'sigec'
        CONTAINER_NAME     = 'sigec'
        PORT               = '80'
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests with Coverage') {
            environment {
                VITE_SUPABASE_URL      = credentials('SUPABASE_URL')
                VITE_SUPABASE_ANON_KEY = credentials('SUPABASE_ANON_KEY')
            }
            steps {
                sh 'npm run test -- --run --coverage'
            }
            post {
                always {
                    junit testResults: 'test-results.xml',
                          allowEmptyResults: true
                }
            }
        }

        stage('SonarQube Analysis') {
            steps { 
                script {
                    def scannerHome = tool name: 'SonarScanner',
                        type: 'hudson.plugins.sonar.SonarRunnerInstallation'

                    withSonarQubeEnv('SonarQube') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                        -Dsonar.projectName="${SONAR_PROJECT_NAME}" \
                        -Dsonar.sources=src \
                        -Dsonar.exclusions=src/test/**,coverage/** \
                        -Dsonar.tests=src/test \
                        -Dsonar.test.inclusions=src/test/** \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                        -Dsonar.testExecutionReportPaths=test-results.xml \
                        -Dsonar.sourceEncoding=UTF-8 \
                        -Dsonar.nodejs.executable=/usr/bin/node \
                        -Dsonar.javascript.node.maxspace=2048
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                sh """
                docker build -t ${IMAGE_NAME} .
                docker rm -f ${CONTAINER_NAME} || true
                docker run -d --name ${CONTAINER_NAME} -p ${PORT}:80 ${IMAGE_NAME}
                """
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            archiveArtifacts artifacts: 'coverage/**', fingerprint: true
            echo 'Pipeline completado exitosamente'
        }
        failure {
            echo ' Pipeline falló'
            archiveArtifacts artifacts: 'coverage/**',
                             allowEmptyArchive: true,
                             fingerprint: true
        }
    }
}
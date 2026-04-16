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
                // Usamos la herramienta configurada en Jenkins Tools
                nodejs('node20') {
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests with Coverage') {
            environment {
                VITE_SUPABASE_URL      = credentials('SUPABASE_URL')
                VITE_SUPABASE_ANON_KEY = credentials('SUPABASE_ANON_KEY')
            }
            steps {
                nodejs('node20') {
                    // Forzamos la creación del reporte XML y la cobertura
                    sh 'npm run test -- --run --coverage --reporter=junit --outputFile=test-results.xml'
                }
            }
            post {
                always {
                    junit testResults: 'test-results.xml', allowEmptyResults: true
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
                        -Dsonar.junit.reportPaths=test-results.xml \
                        -Dsonar.sourceEncoding=UTF-8 \
                        -Dsonar.nodejs.executable=/usr/bin/node \
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
            echo 'Pipeline falló'
        }
    }
}
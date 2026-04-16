pipeline {
    agent any

    environment {
        SONAR_PROJECT_KEY = 'JrinconRG_tallercontrol'
        SONAR_PROJECT_NAME = 'tallercontrol'
        IMAGE_NAME = 'sigec'
        CONTAINER_NAME = 'sigec'
        PORT = '80'
        // Limita la memoria de Node.js durante los tests
        NODE_OPTIONS = '--max-old-space-size=1024'
    }

    stages {
        stage('Install Dependencies') {
            steps {
                // Usamos el plugin de NodeJS (configurado en Global Tool Configuration como 'node20')
                    sh 'npm install'
                
            }
        }

        stage('Run Tests with Coverage') {
            environment {
                VITE_SUPABASE_URL      = credentials('SUPABASE_URL')
                VITE_SUPABASE_ANON_KEY = credentials('SUPABASE_ANON_KEY')
            }
            steps {
                nodejs('node20') {
                    // --maxWorkers=2 evita que use todos los núcleos y congele la RAM
                    sh 'npm run test -- --coverage --watchAll=false --maxWorkers=2'
                }
            }
        }

        stage('SonarQube Analysis') {
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
                        -Dsonar.sourceEncoding=UTF-8 \
                        -Dsonar.ce.javaOpts=-Xmx512m \
                        -Dsonar.search.javaOpts=-Xmx512m
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
            archiveArtifacts artifacts: 'coverage/**', fingerprint: true
            // Limpia el espacio de trabajo para no dejar basura
            cleanWs()
        }
    }
}
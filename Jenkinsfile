pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'http://gitea:3000/paperOCB/papercall.git'
            }
        }
        stage('Build') {
            steps {
                dir('app') {
                    sh './mvnw clean package -DskipTests'
                }
            }
        }
        stage('Docker Build') {
            steps {
                sh 'docker build -t registry:5000/callflow-api:latest .'
            }
        }
        stage('Push to Registry') {
            steps {
                sh 'docker push registry:5000/callflow-api:latest'
            }
	        stage('Deploy') {
            steps {
                sh 'docker pull registry:5000/callflow-api:latest'
                sh 'docker stop callflow-api || true'
                sh 'docker rm callflow-api || true'
                sh '''
                docker run -d --name callflow-api \
                  --network papercall_default \
                  -e DB_URL=jdbc:mysql://mysql:3306/callflow \
                  -e DB_USERNAME=callflow \
                  -e DB_PASSWORD=callflow_password \
                  -e REDIS_HOST=redis \
                  -e REDIS_PORT=6379 \
                  -e KAFKA_BOOTSTRAP_SERVERS=kafka:19092 \
                  registry:5000/callflow-api:latest
                '''
            }
        }

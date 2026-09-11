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
                sh 'docker build -t localhost:5000/callflow-api:latest .'
            }
        }
        stage('Push to Registry') {
            steps {
                sh 'docker push localhost:5000/callflow-api:latest'
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker compose up -d --force-recreate api'
            }
        }
    }
}

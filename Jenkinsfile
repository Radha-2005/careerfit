pipeline {
  agent any
  stages {
    stage('Install dependencies') {
      steps {
        sh 'npm install'
      }
    }
    stage('Build') {
      steps {
        echo 'Building project...'
      }
    }
    stage('Deploy') {
      steps {
        echo 'Deployment step here!'
        // Add actual deploy commands if needed
      }
    }
  }
}

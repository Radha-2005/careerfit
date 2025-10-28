pipeline {
  agent any
  stages {
    stage('Install Node.js') {
      steps {
        sh '''
          curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
          apt-get install -y nodejs
        '''
      }
    }
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
      }
    }
  }
}

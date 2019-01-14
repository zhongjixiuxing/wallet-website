pipeline {
  agent any
  stages {
    stage('Install-Pkg') {
      agent {
        docker {
          image 'node:8.15'
        }

      }
      steps {
        sh 'echo env'
        sh 'npm i'
        sh 'npm run build'
        script{
          echo 'workspace ----------- : '
          echo WORKSPACE
        }
      }
    }
    stage('Deploy') {
      agent any
      steps {
        script {
          echo 'workspace2 ----------- : '
          echo WORKSPACE
          def deployTo = input(id: 'userInput', message: 'GOOOOOOOOG', parameters: [
            [$class: 'ChoiceParameterDefinition', choices: ["none", "dev(localhost)", "production"], description: "What's the env of you want to deploy?", name: 'deployTo'],
          ])

          if (deployTo != 'dev(localhost)') {
            return echo ("deployment[${deployTo}] is un-support at now. nothing to do for the choice")
          }

          def deployCfg = [:]
          deployCfg.buildImageName = "btc-website:latest"
          deployCfg.sshHost = "192.168.1.104"
          deployCfg.sshUser = "root"
          deployCfg.sshPassword = ""
          deployCfg.customCommand = ""
          deployCfg.customEnv = ""

          while(true) {
            deployCfg = input(id: 'deployCfg', message: 'Publish Configure', parameters: [
              [$class: 'StringParameterDefinition', defaultValue: "${deployCfg.buildImageName}", description: "What's the build image name", name: 'buildImageName'],
              [$class: 'StringParameterDefinition', defaultValue: "${deployCfg.sshHost}", description: "SSH host of deployment server", name: 'sshHost'],
              [$class: 'StringParameterDefinition', defaultValue: "${deployCfg.sshUser}", description: "SSH user name", name: 'sshUser'],
              [$class: 'StringParameterDefinition', defaultValue: "${deployCfg.sshPassword}", description: "SSH password", name: 'sshPassword'],
              [$class: 'TextParameterDefinition', defaultValue: "${deployCfg.customCommand}", description: "custom define exec publish command(option)", name: 'customCommand'],
            ])

            if (!deployCfg.buildImageName || deployCfg.buildImageName.trim() == "") {
              input(message: 'Invalid build image name')
              continue
            } else {
              deployCfg.buildImageName = deployCfg.buildImageName.trim()
            }

            if (!deployCfg.sshHost || deployCfg.sshHost.trim() == "") {
              input(message: 'Invalid SSH host!')
              continue
            } else {
              deployCfg.sshHost = deployCfg.sshHost.trim()
            }

            if (!deployCfg.sshUser || deployCfg.sshUser.trim() == "") {
              input(message: 'Invalid SSH user!')
              continue
            } else {
              deployCfg.sshUser = deployCfg.sshUser.trim()
            }

            deployCfg.sshPassword = deployCfg.sshPassword.trim()
            if (deployCfg.customCommand) {
              deployCfg.customCommand = deployCfg.customCommand.trim()
            }

            break
          }


          def customImage = docker.build("${deployCfg.buildImageName}")

          def remote = [:]
          remote.name = deployCfg.sshHost
          remote.host = deployCfg.sshHost
          remote.user = deployCfg.sshUser
          remote.password = deployCfg.sshPassword
          remote.allowAnyHosts = true

          def command = deployCfg.customCommand
          if (!command || command == "") {
            command = "docker run -id --name btc-website -p 6000:80 ${deployCfg.buildImageName}"
          }

          try {
            sshCommand remote:remote, command:'nohup docker rm -f btc-website &'
            sshCommand remote:remote, command:'sleep 5 && echo yes'
            sshCommand remote:remote, command:command
          } catch (exec) {
            println("happen error")
            println(exec)

            throw exec
          }
        }

      }
    }
  }
  post {
    success {
      mail(to: '1965198272@qq.com', subject: "successbul: ${currentBuild.fullDisplayName}", body: 'OK')

    }

    failure {
      mail(to: '1965198272@qq.com', subject: "failure: ${currentBuild.fullDisplayName}", body: 'failure')

    }

  }
}

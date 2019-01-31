pipeline {
  agent any
  stages {

    stage("Publish") {
      agent any
      steps: {
        script {
          def deployTo = input(id: 'userInput', message: 'GOOOOOOOOG', parameters: [
            [$class: 'ChoiceParameterDefinition', choices: ["none", "dev(localhost)", "production"], description: "What's the env of you want to deploy?", name: 'deployTo'],
          ])

          if (deployTo != 'dev(localhost)') {
            return echo ("deployment[${deployTo}] is un-support at now. nothing to do for the choice")
          }

          def deployCfg = [:]
          deployCfg.sshHost = "47.244.105.11"
          deployCfg.sshUser = "root"
          deployCfg.sshPassword = ""
          deployCfg.customCommand = "docker run -id --name website -p 80:80 anxing131/blockchain-tokens-website"
          deployCfg.customEnv = ""

          while(true) {
            deployCfg = input(id: 'deployCfg', message: 'Publish Configure', parameters: [
              [$class: 'StringParameterDefinition', defaultValue: "${deployCfg.sshHost}", description: "SSH host of deployment server", name: 'sshHost'],
              [$class: 'StringParameterDefinition', defaultValue: "${deployCfg.sshUser}", description: "SSH user name", name: 'sshUser'],
              [$class: 'StringParameterDefinition', defaultValue: "${deployCfg.sshPassword}", description: "SSH password", name: 'sshPassword'],
              [$class: 'TextParameterDefinition', defaultValue: "${deployCfg.customCommand}", description: "custom define exec publish command(option)", name: 'customCommand'],
            ])

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


          def remote = [:]
          remote.name = deployCfg.sshHost
          remote.host = deployCfg.sshHost
          remote.user = deployCfg.sshUser
          remote.password = deployCfg.sshPassword
          remote.allowAnyHosts = true

          def command = deployCfg.customCommand
          if (!command || command == "") {
            command = "docker run -id --name website -p 80:80 anxing131/blockchain-tokens-website"
          }

          try {
            sshCommand remote:remote, command:'nohup docker rm -f website &'
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
      sh 'rm -rf ${SHARE_DIR}/dist'
      mail(to: '1965198272@qq.com', subject: "successbul: ${currentBuild.fullDisplayName}", body: 'OK')

    }

    failure {
      sh 'rm -rf ${SHARE_DIR}/dist'
      mail(to: '1965198272@qq.com', subject: "failure: ${currentBuild.fullDisplayName}", body: 'failure')
    }

  }
}

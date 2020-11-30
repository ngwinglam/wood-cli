const program = require('commander')
const fs = require('fs')
const inquirer = require('inquirer')
const download = require('download-git-repo')
const handlebars = require('handlebars')
const ora = require('ora')
const chalk = require('chalk')
const symbols = require('log-symbols')
const shell = require('shelljs')

program.parse(process.argv)
let projectName = program.args[0]

if(fs.existsSync(projectName)) {
  console.log(symbols.error, chalk.red('The project has exist.'))
  return false
}
inquirer
  .prompt([
    {
      name: 'name',
      message: 'Input the project name: ',
      validate: value => {
        if(value.length > 1) {
          if(/^(?:@[a-z0-9-*~][a-z0-9-*._~]*)?[a-z0-9-~][a-z0-9-._~]*$/.test(value)) {
            return true
          }
          return 'String does not match the pattern of "^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*$".'
        }
        return 'String is shorter than the minimum length of 1.'
      },
      default: projectName
    },
  ])
  .then((answers) => {
    projectName = answers.name
    const spinner = ora('Downlaoding...')
    spinner.start()
    download('ngwinglam/vue-cli#main', projectName, error => {
      if(error) {
        spinner.fail()
        console.log(symbols.error, chalk.red(error))
        return false
      }
      spinner.succeed()
      const fileName = `${projectName}/package.json`
      if(fs.existsSync(fileName)) {
        const content = fs.readFileSync(fileName).toString()
        // TODO 设置模板后生效
        const result = handlebars.compile(content)({
          name: projectName
        })
        fs.writeFileSync(fileName, result)
      }
      console.log(symbols.success, chalk.green('Downloaded successfully!'))
      inquirer
        .prompt([
          {
            type: 'confirm',
            name: 'isInstall',
            message: 'Do you want to install dependencies now?',
            default: true
          }
        ])
        .then((answers) => {
          console.log(answers)
          if(answers.isInstall) {
            inquirer
              .prompt([
                {
                  type: 'list',
                  name: 'tool',
                  message: 'Choose your tool to install',
                  choices: ['npm', 'cnpm','yarn']
                }
              ])
              .then((answers) => {
                let spinner = ora('Installing...')
                shell.exec(`cd ${projectName} && ${answers.tool} install`, (err) => {
                  if(err) {
                    spinner.fail()
                    console.log(symbols.error, chalk.red('err'))
                    console.log(chalk.bold.yellow('Please install by yourself.'))
                    return
                  }
                  spinner.succeed()
                  console.log(symbols.success, chalk.green('Install successfully!'))
                })
              })
          } else {
            console.log(chalk.bold.yellow('Please install by yourself.'))
          }
        })
    })
  })
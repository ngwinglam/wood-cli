#!/usr/bin/env node

const program = require('commander')

program
  .version(require('../package.json').version, '-v, -V, --version')
  .command('create <name>','create a new project powered by template')
  .parse(process.argv)
module.exports = {
  default: {
    require: [
      'src/support/world.ts',
      'src/support/hooks.ts',
      'src/steps/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    paths: ['features/**/*.feature'],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    }
  }
};

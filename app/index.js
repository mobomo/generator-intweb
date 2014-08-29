'use strict';

var join = require('path').join;
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    // setup the test-framework property, Gruntfile template will need this
    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });
    this.testFramework = this.options['test-framework'];

    this.option('coffee', {
      desc: 'Use CoffeeScript',
      type: Boolean,
      defaults: true
    });
    this.coffee = this.options.coffee;

    this.pkg = require('../package.json');
  },

  askFor: function () {
    var done = this.async();

    // welcome message
    if (!this.options['skip-welcome-message']) {
      this.log(require('yosay')());
      this.log(chalk.magenta(
        'Out of the box I include HTML5 Boilerplate, and a ' +
        'Gruntfile.js to build your app. I also default to using CoffeeScript.'
      ));
    }

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      },{
        name: 'jQuery',
        value: 'includeJQuery',
        checked: false
      },{
        name: 'Bootstrap (will include jQuery)',
        value: 'includeBootstrap',
        checked: false
      }]
    }, {
      when: function (answers) {
        return answers && answers.features &&
          (answers.features.indexOf('includeJQuery') !== -1 ||
           answers.features.indexOf('includeBootstrap') !== -1 );
      },
      type: 'confirm',
      name: 'ie9',
      value: 'supportIE9',
      message: 'Do you need to support IE 9?',
      default: false
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      }

      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeJQuery = hasFeature('includeJQuery') || this.includeBootstrap;
      this.includeModernizr = hasFeature('includeModernizr');

      this.supportIE9 = answers.ie9;

      this.includeLibSass = answers.libsass;
      this.includeRubySass = !answers.libsass;

      done();
    }.bind(this));
  },

  gruntfile: function () {
    this.template('Gruntfile.js');
  },

  packageJSON: function () {
    this.template('_package.json', 'package.json');
  },

  git: function () {
    this.template('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
  },

  bower: function () {
    var bower = {
      name: this._.slugify(this.appname),
      private: true,
      dependencies: {}
    };

    if (this.includeJQuery || this.includeBootstrap) {
      bower.dependencies.jquery = this.supportIE9 ? "~1.11.1" : ">= 2.1.1";
    }

    if (this.includeBootstrap) {
      var bs = 'bootstrap-sass-official';
      bower.dependencies[bs] = "~3.2.0";
    }

    if (this.includeModernizr) {
      bower.dependencies.modernizr = "~2.8.2";
    }

    this.write('bower.json', JSON.stringify(bower, null, 2));
  },

  jshint: function () {
    this.copy('jshintrc', '.jshintrc');
  },

  editorConfig: function () {
    this.copy('editorconfig', '.editorconfig');
  },

  mainStylesheet: function () {
    var css = 'application.scss';
    this.template(css, 'app/styles/' + css);
  },

  writeIndex: function () {
    this.indexFile = this.engine(
      this.readFileAsString(join(this.sourceRoot(), 'index.html')),
      this
    );

    this.indexFile = this.appendFiles({
      html: this.indexFile,
      fileType: 'js',
      optimizedPath: 'scripts/application.js',
      sourceFileList: ['scripts/application.js'],
      searchPath: ['app', '.tmp']
    });
  },

  app: function () {
    var mkdir = this.mkdir.bind(this),
        write = this.write.bind(this),
        template  = this.template.bind(this),
        copyFiles = function (files, dir) {
          files.forEach(function (file) {
            if (file.replace(/^_/, '') == dir) { // if the filename is the same as the directory, it should be an example file
              template('styles/' + file + '.scss', 'app/styles/' + dir + '/_example.scss');
            } else {
              template('styles/' + file + '.scss', 'app/styles/' + dir + '/' + file + '.scss');
            }
          });
        };

    this.directory('app');
    this.mkdir('app/scripts');
    this.mkdir('app/styles');
    this.mkdir('app/images');
    this.write('app/index.html', this.indexFile);

    this.mkdir('app/styles/core');
    copyFiles(['_variables', '_base', '_reset', '_helpers'], 'core');

    this.mkdir('app/styles/components');
    copyFiles(['_card'], 'components');

    this.mkdir('app/styles/structures');
    copyFiles(['_structures'], 'structures');

    if (this.coffee) {
      this.write(
        'app/scripts/application.coffee',
        'console.log "\'Allo from CoffeeScript!"'
      );
    }
    else {
      this.write('app/scripts/application.js', 'console.log(\'\\\'Allo \\\'Allo!\');');
    }
  },

  install: function () {
    this.on('end', function () {
      this.invoke(this.options['test-framework'], {
        options: {
          'skip-message': this.options['skip-install-message'],
          'skip-install': this.options['skip-install'],
          'coffee': this.options.coffee
        }
      });

      if (!this.options['skip-install']) {
        this.installDependencies({
          skipMessage: this.options['skip-install-message'],
          skipInstall: this.options['skip-install']
        });
      }
    });
  }
});

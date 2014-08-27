/*global describe, beforeEach, it*/

var path = require('path');
var assert = require('assert');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-generator').assert;
var _ = require('underscore');

describe('Webapp generator', function () {
  // not testing the actual run of generators yet
  it('the generator can be required without throwing', function () {
    this.app = require('../app');
  });

  describe('run test', function () {

    var expectedContent = [
      ['.gitignore', /\.sass-cache/],
      ['app/index.html', /Sass/],
      ['bower.json', /"name": "tmp"/],
      ['Gruntfile.js', /sass/],
      ['package.json', /"name": "tmp"/],
      ['package.json', /grunt-contrib-sass/],
    ];
    var expected = [
      '.editorconfig',
      '.gitignore',
      '.gitattributes',
      'package.json',
      'bower.json',
      'Gruntfile.js',
      'app/favicon.ico',
      'app/robots.txt',
      'app/index.html'
    ];

    var options = {
      'skip-install-message': true,
      'skip-install': true,
      'skip-welcome-message': true,
      'skip-message': true
    };

    var runGen;

    beforeEach(function () {
      runGen = helpers
        .run(path.join(__dirname, '../app'))
        .inDir(path.join(__dirname, '.tmp'))
        .withGenerators([[helpers.createDummyGenerator(), 'mocha:app']]);
    });

    it('creates expected files', function (done) {
      runGen.withOptions(options).on('end', function () {

        assert.file([].concat(
          expected,
          'app/styles/application.scss',
          'app/scripts/application.coffee'
        ));
        assert.noFile([
          'app/styles/main.css',
          'app/scripts/application.js'
        ]);

        assert.fileContent(expectedContent);
        assert.noFileContent([
          ['Gruntfile.js', /modernizr/],
          ['app/index.html', /modernizr/],
          ['bower.json', /modernizr/],
          ['package.json', /modernizr/],
          ['Gruntfile.js', /bootstrap-sass-official/],
          ['app/index.html', /Sass is a mature/],
          ['bower.json', /bootstrap-sass-official/]
        ]);
        done();
      });
    });

    it('creates expected CoffeeScript files', function (done) {
      runGen.withOptions(
        _.extend(options, {coffee: true})
      ).on('end', function () {

        assert.file([].concat(
          expected,
          'app/scripts/application.coffee'
        ));
        assert.noFile('app/scripts/application.js');

        assert.fileContent([].concat(
          expectedContent,
          [['Gruntfile.js', /coffee/]]
        ));

        done();
      });
    });

    it('excludes CoffeeScript files', function (done) {
      runGen.withOptions(
        _.extend(options, {coffee: false})
      ).on('end', function () {

        assert.file([].concat(
          expected,
          'app/scripts/application.js'
        ));
        assert.noFile('app/scripts/application.coffee');

        assert.fileContent(expectedContent);
        assert.noFileContent([
          ['Gruntfile.js', /coffee/]
        ]);
        done();
      });
    });

    it('creates expected modernizr components', function (done) {
      runGen.withOptions(options).withPrompt({features: ['includeModernizr']})
      .on('end', function () {

        assert.fileContent([
          ['Gruntfile.js', /modernizr/],
          ['app/index.html', /modernizr/],
          ['bower.json', /modernizr/],
          ['package.json', /modernizr/],
        ]);

        done();
      });
    });

    it('creates expected ruby SASS components', function (done) {
      runGen.withOptions(options).withPrompt({features: []})
      .on('end', function () {

        assert.fileContent([
          ['Gruntfile.js', /sass/],
          ['app/index.html', /Sass/],
          ['.gitignore', /\.sass-cache/],
          ['package.json', /grunt-contrib-sass/]
        ]);

        assert.noFileContent([
          ['package.json', /grunt-sass/],
          ['app/index.html', /Sass is a mature/]
        ]);

        done();
      });
    });

    it('creates expected SASS and Bootstrap components', function (done) {
      runGen.withOptions(options).withPrompt({
        features: ['includeBootstrap']
      }).on('end', function () {

        assert.fileContent([
          ['Gruntfile.js', /bootstrap-sass-official/],
          ['app/index.html', /Sass is a mature/],
          ['bower.json', /bootstrap-sass-official/]
        ]);

        done();
      });
    });

    it('uses jQuery version 2 by default', function (done) {
      runGen.withOptions(options).withPrompt({
        features: ['includeJQuery']
      }).on('end', function () {

        assert.fileContent([
          ['bower.json', /\"jquery\":\s\">=\s2\./]
        ]);

        done();
      });
    });

    it('use jQuery version 2 for Bootstrap by default', function (done) {
      runGen.withOptions(options).withPrompt({
        features: ['includeBootstrap']
      }).on('end', function () {

        assert.fileContent([
          ['bower.json', /\"jquery\":\s\">=\s2\./]
        ]);

        done();
      });
    });

    it('uses jQuery version 2 when not supporting IE9', function (done) {
      runGen.withOptions(options).withPrompt({
        features: ['includeJQuery'],
        ie9: false
      }).on('end', function () {

        assert.fileContent([
          ['bower.json', /\"jquery\":\s\">=\s2\./]
        ]);

        done();
      });
    });

    it('uses jQuery version 2 for Bootstrap when not supporting IE9', function (done) {
      runGen.withOptions(options).withPrompt({
        features: ['includeBootstrap'],
        ie9: false
      }).on('end', function () {

        assert.fileContent([
          ['bower.json', /\"jquery\":\s\">=\s2\./]
        ]);

        done();
      });
    });

    it('uses jQuery version 1 for IE9', function (done) {
      runGen.withOptions(options).withPrompt({
        features: ['includeJQuery'],
        ie9: true
      }).on('end', function () {

        assert.fileContent([
          ['bower.json', /\"jquery\":\s\"\~1\./]
        ]);

        done();
      });
    });

    it('uses jQuery version 1 for IE9 for Bootstrap', function (done) {
      runGen.withOptions(options).withPrompt({
        features: ['includeBootstrap'],
        ie9: true
      }).on('end', function () {

        assert.fileContent([
          ['bower.json', /\"jquery\":\s\"\~1\./]
        ]);

        done();
      });
    });
  });
});

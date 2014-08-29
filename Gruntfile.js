'use strict';

module.exports = function (grunt) {
  require('time-grunt')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({
    simplemocha: {
      options: {
        reporter: 'spec'
      },

      all: {
        src: ['test/*.js']
      }
    },
    watch: {
      scripts: {
        files: ['test/*.js', 'app/*.js'],
        tasks: ['test'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.registerTask('test', ['simplemocha']);
};

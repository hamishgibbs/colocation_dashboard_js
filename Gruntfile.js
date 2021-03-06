module.exports = function(grunt) {
	// Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    concat: {
    	options: {
        	banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      	},
	      dist: {
	      src: ['src/utils.js',
            'src/load_figure_text.js',
	      		'src/map_setup.js',
	      		'src/create_map.js',
	      		'src/area_compare_panel.js',
            'src/overview_panel_setup.js',
	      		'src/description_panel_setup.js',
	      		'src/panel_setup.js',
            'src/ts_panel_setup.js'],
	      dest: 'build/<%= pkg.name %>.js',
	    }
    },
    cssmin: {
      options: {
        mergeIntoShorthands: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'build/<%= pkg.name %>.min.css': ['build/<%= pkg.name %>.css']
        }
      }
    },
    watch: {
      scripts: {
          files: 'src/*.js',
          tasks: ['concat', 'uglify', 'cssmin'],
          options: {
              atBegin: true
          }
      },
    },
  });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['concat', 'uglify', 'cssmin', 'watch']);
};
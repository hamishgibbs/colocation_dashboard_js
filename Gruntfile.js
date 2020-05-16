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
	      		'src/overview_panel_setup.js',
	      		'src/map_setup.js',
	      		'src/create_map.js',
	      		'src/ts_panel_setup.js',
	      		'src/area_compare_panel.js',
	      		'src/description_panel_setup.js',
	      		'src/panel_setup.js'],
	      dest: 'build/<%= pkg.name %>.js',
	    }
    },
  });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'uglify']);
};
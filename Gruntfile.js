module.exports = function(grunt) {

    grunt.initConfig({

        concat: {

            js: {
                src: [
                    'lib/js/handlebars.runtime.js',
                    'build/templates.js',
                    'build/widget-gallery.js'
                ],
                dest: 'build/widget-gallery.concat.js'
            },

            css: {
                src: [
                    'lib/css/bootstrap.css',
                    'lib/css/widget-gallery.css'
                ],
                dest: 'build/widget-gallery.concat.css'
            }
        },

        includes: {

            options: {

                includeRegexp: /\s*\/\/\s*@include\s"(\S+)"\s*$/,
                duplicates: false,
                debug: true
            },

            files: {

                src    : [ 'lib/js/widget-gallery.js' ],
                dest   : 'build',
                flatten: true,
                cwd    : '.'
            }
        },

        cssmin: {

            with_banner: {

                options: {
                    banner: '/* widget-gallery css */'
                },

                files: {
                    'build/widget-gallery.min.css': [ 'build/widget-gallery.concat.css' ]
                }
            }
        },

        uglify: {

            js: {
                files: {
                    'build/widget-gallery.min.js': ['<%= concat.js.dest %>']
                }
            }
        },

        jshint: {

            options: {
                smarttabs: true
            },
            js: ['build/widget-gallery.js']
        },

        shell: {

            compileTemplates: {

                command: 'tools/compileTemplates.pl',
                options: {
                    stdout: true
                }
            }
        },

        watch: {

            hbs: {
                files: ['lib/templates/*.hbs'],
                tasks: ['shell:compileTemplates']
            },

            css: {
                files: ['lib/css/*.css'],
                tasks: ['concat', 'cssmin']
            },

            js: {
                files: [ 'lib/js/*.js', 'build/templates.js' ],
                tasks: [ 'includes', 'concat', 'jshint', 'uglify' ]
            }
        }

    });

    grunt.loadNpmTasks('grunt-includes');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['includes', 'concat', 'jshint', 'uglify', 'cssmin' ] );
};
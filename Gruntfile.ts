// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export default function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.registerTask('sync', [
		'clean:all',
		'copy:json',
		'coffee:compile'
	]);

	return grunt.initConfig({
		watch: {
			coffee: {
				files: 'src/**/*.coffee',
				tasks: ['coffee:compile']
			},
			json: {
				files: 'src/**/*.json',
				tasks: ['copy:json']
			}
		},

		clean: {
			all: ['js/*']
		},

		copy: {
			json: {
				files: [
					{
						expand: true,
						cwd: 'src',
						src: '**/*.json',
						dest: 'js/'
					}
				]
			}
		},

		coffee: {
			compile: {
				options: {
					bare: true
				},
				expand: true,
				flatten: false,
				cwd: 'src',
				src: '**/*.coffee',
				dest: 'js/',
				ext: '.js'
			}
		}
	});
};
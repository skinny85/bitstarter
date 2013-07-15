#!/usr/bin/env node

var util = require('util');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkSite = function (siteUrl, checksfile) {
	rest.get(siteUrl).on('complete', function (result, response) {
		if (result instanceof Error) {
			console.error('Error: ' + util.format(result.message));
			process.exit(1);
		} else {
			$ = cheerio.load(result);
			var checks = loadChecks(checksfile).sort();
			var checkJson = {};
			for (var ii in checks)
				checkJson[checks[ii]] = $(checks[ii]).length > 0;
			var outJson = JSON.stringify(checkJson, null, 4);
			console.log(outJson);
		}
	});
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if (require.main == module) {
    program
        .option('-u, --url <html_url>', 'URL to the site')
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .parse(process.argv);
    checkSite(program.url, program.checks);   
}


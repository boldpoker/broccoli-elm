'use strict';

var _ = require('lodash');
var rsvp = require('rsvp');
var Plugin = require('broccoli-plugin');
var childProcess = require('child_process');
var compilerBinaryName = "elm-make";

var defaultOptions = {
  warn:       console.warn,
  pathToMake: undefined,
  yes:        undefined,
  help:       undefined,
  output:     undefined,
  verbose:    false
};

var supportedOptions = _.keys(defaultOptions);

function compile(sources, options) {
  if (typeof sources === "string") {
    sources = [sources];
  }

  if (!(sources instanceof Array)) {
    throw "compile() received neither an Array nor a String for its sources argument."
  }

  options = _.defaults({}, options, defaultOptions);

  var compilerArgs = compilerArgsFromOptions(options, options.warn);
  var processArgs  = sources ? sources.concat(compilerArgs) : compilerArgs;
  var env = _.merge({LANG: 'en_US.UTF-8'}, process.env);
  var processOpts = { env: env, stdio: [process.stdin, "ignore", process.stderr] };
  var pathToMake = options.pathToMake || compilerBinaryName;
  var verbose = options.verbose;

  try {
    if (verbose) {
      console.log(["Running", pathToMake].concat(processArgs || []).join(" "));
    }

    return childProcess.spawn(pathToMake, processArgs, processOpts)
      .on('error', function(err) {
        handleError(pathToMake, err);

        process.exit(1)
      });
  } catch (err) {
    if ((typeof err === "object") && (typeof err.code === "string")) {
      handleError(pathToMake, err);
    } else {
      console.error("Exception thrown when attempting to run Elm compiler " + JSON.stringify(pathToMake) + ":\n" + err);
    }

    process.exit(1)
  }
}

function handleError(pathToMake, err) {
  if (err.code === "ENOENT") {
    console.error("Could not find Elm compiler \"" + pathToMake + "\". Is it installed?")
  } else if (err.code === "EACCES") {
    console.error("Elm compiler \"" + pathToMake + "\" did not have permission to run. Do you need to give it executable permissions?");
  } else {
    console.error("Error attempting to run Elm compiler \"" + pathToMake + "\":\n" + err);
  }
}

function escapePath(pathStr) {
  return pathStr.replace(/ /g, "\\ ");
}

// Converts an object of key/value pairs to an array of arguments suitable
// to be passed to child_process.spawn for elm-make.
function compilerArgsFromOptions(options, logWarning) {
  return _.flatten(_.map(options, function(value, opt) {
    if (value) {
      switch(opt) {
        case "yes":    return ["--yes"];
        case "help":   return ["--help"];
        case "output": return ["--output", escapePath(value)];
        default:
          if (supportedOptions.indexOf(opt) === -1) {
            logWarning('Unknown Elm compiler option: ' + opt);
          }

          return [];
      }
    } else {
      return [];
    }
  }));
}

module.exports = ElmPlugin;
ElmPlugin.prototype = Object.create(Plugin.prototype);
ElmPlugin.prototype.constructor = ElmPlugin;

function ElmPlugin (inputNode, options) {
  options = options || {};
  Plugin.call(this, [inputNode], {
    annotation: options.annotation
  });
}

ElmPlugin.prototype.build = function() {
  var promise = new rsvp.Promise(function(resolvePromise, rejectPromise) {
    compile(this.inputPaths, {
      output: this.outputPath + "/elm.js"
    }).on("close", function(exitCode) {
      if (exitCode === 0) {
        resolvePromise();
      } else {
        rejectPromise({ message: "Compiler error." });
      }
    }.bind(this));
  }.bind(this));
  return promise;
};

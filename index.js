'use strict';

var _ = require('lodash');
var rsvp = require('rsvp');
var Plugin = require('broccoli-plugin');
var childProcess = require('child_process');
var compilerBinaryName = "elm-make";

var defaultCompilerArgs = {
  yes:  undefined,
  help: undefined
};
var supportedCompilerArgs = _.keys(defaultCompilerArgs);
var defaultOptions = {
  annotation: undefined,
  pathToMake: undefined
};

function compile(sources, flags, options) {
  if (typeof sources === "string") {
    sources = [sources];
  }

  if (!(sources instanceof Array)) {
    throw "compile() received neither an Array nor a String for its sources argument."
  }

  var processArgs  = sources ? sources.concat(flags) : flags;
  var env = _.merge({ LANG: 'en_US.UTF-8' }, process.env);
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

function compilerArgsToFlags(compilerArgs) {
  return _.flatten(_.map(compilerArgs, function(value, arg) {
    if (value) {
      switch(arg) {
        case "yes":    return ["--yes"];
        case "help":   return ["--help"];
        case "output": return ["--output", escapePath(value)];
        default:
          if (supportedCompilerArgs.indexOf(arg) === -1) {
            console.warn('Unknown Elm compiler option: ' + arg);
          }
          return [];
      }
    } else {
      return [];
    }
  }));
}
ElmPlugin.prototype = Object.create(Plugin.prototype);
ElmPlugin.prototype.constructor = ElmPlugin;

function ElmPlugin (inputNode, options) {
  this.options = _.defaults({}, options, defaultOptions);
  this.compilerArgs = _.defaults({}, this.options.compilerArgs, defaultCompilerArgs);
  Plugin.call(this, [inputNode], {
    annotation: this.options.annotation
  });
}

ElmPlugin.prototype.build = function() {
  var promise = new rsvp.Promise(function(resolvePromise, rejectPromise) {
    this.compilerArgs.output = this.outputPath + "/elm.js";
    var flags = compilerArgsToFlags(this.compilerArgs);
    compile(this.inputPaths, flags, this.options).on("close", function(exitCode) {
      if (exitCode === 0) {
        resolvePromise();
      } else {
        rejectPromise({ message: "Compiler error." });
      }
    }.bind(this));
  }.bind(this));
  return promise;
};

module.exports = ElmPlugin;

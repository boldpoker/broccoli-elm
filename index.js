var rsvp = require('rsvp');
var Plugin = require('broccoli-plugin');
var Elm = require('node-elm-compiler');

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
    Elm.compile(this.inputPaths, {
      output: this.outputPath + "/elm.js"
    }).on("close", function(exitCode) {
      console.log("close", exitCode);
      if (exitCode === 0) {
        resolvePromise();
      } else {
        rejectPromise({ message: "Compiler error." });
      }
    }.bind(this));
  }.bind(this));
  return promise;
};

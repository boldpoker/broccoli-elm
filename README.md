# broccoli-elm

A Broccoli plugin for Elm.

## Installation

```bash
npm install --save broccoli-elm
```

## Usage

```js
var BroccoliElm = require('broccoli-elm');
var outputNode = new BroccoliElm("directory/containing/elm-files", {
  destination: "elm-app.js" // relative to input path
});
```

## Options

```{
  annotation:  undefined, // String: annotate the broccoli-elm plugin instance
  pathToMake:  "elm-make", // String: alternative path to elm-make
  destination: "/elm.js", // String: name your elm JS bundle,
  compilerArgs: {
    yes: false // Boolean: auto-yes all automatic prompts
  }
}
```

The `--output` flag for `elm-make` is managed by broccoli-elm. Use the `destination` option to specify the path of the output tree.

## Test

Install deps via `npm install`, then run tests via `npm run test`.

## TODO

Support building multiple elm main JS files.

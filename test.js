'use strict'

var Fixture = require('broccoli-fixture');
var BroccoliElm = require('./');
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('broccoli-elm', function() {
  it('compiles .elm files', function() {
    var inputNode = "fixtures";
    var outputNode = new BroccoliElm(inputNode, {
      destination: "broccoli-elm-test.js"
    });
    return Fixture.build(outputNode).then(function(outputFixture) {
      return expect(outputFixture)
        .to.have.property('broccoli-elm-test.js')
        .that.is.a('string')
        .that.contains('var main = $Graphics$Element.show("Hello, World!");');
    });
  })
});

'use strict'

var Fixture = require('broccoli-fixture');
var BroccoliElm = require('./');
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('broccoli-elm', function() {
  it('compiles .elm files', function() {
    var inputNode = "fixtures/broccoli-elm-test.elm";
    var outputNode = new BroccoliElm(inputNode);
    return Fixture.build(outputNode).then(function(outputFixture) {
      return expect(outputFixture)
        .to.have.property('elm.js')
        .that.is.a('string')
        .that.contains('var main = $Graphics$Element.show("Hello, World!");');
    });
  })
});

var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var _ = require('lodash');

// var constants = require('../constants');

var noop = function () {};

var typesToCheck = {
  STRING: 'string',
  NUMBER: 0,
  NULL: null,
  UNDEFINED: undefined,
  NOT_A_NUMBER: NaN,
  INFINITY: Infinity,
  OBJECT: {},
  ARRAY: [],
  REGEXP: /.+/,
  DATE: new Date(),
  BOOLEAN_TRUE: true,
  BOOLEAN_FALSE: false,
  FUNCTION: noop
};

var lib;
var data;
var error;
var getResObj;

// var req = {
//   params: {}
// };

// var res = {};

// _.extend(res, {
//   status: sinon.stub().returns(res),
//   setHeader: sinon.spy(),
//   json: sinon.stub().returns(res)
// });

// function getLastReturnResult(spy) {
//   return spy.returnValues.slice(-1)[0];
// }

// function getLastCallArgs(spy) {
//   return spy.args.slice(-1)[0];
// }

describe('The aop-ajax-responses module', function () {

  beforeEach(function () {
    data = {
      data: 'data'
    };

    // @todo: stub i18n-future
    lib = proxyquire('../lib/index', {

    });

    lib = lib({
      baseDir: 'baseDir'
    });
  });

  describe('when getting a response object', function () {

    beforeEach(function () {
      getResObj = sinon.spy(lib, 'getResponseObj');
    });

    after(function () {
      getResObj.restore();
    });

    it('data or error must be present', function () {
      var typesExceptEmpty = _(typesToCheck).pick(['NULL', 'UNDEFINED']).values().value();

      typesExceptEmpty.forEach(function (type) {
        try {
          getResObj(type, type);
        } catch (e) {}
      });

      assert.strictEqual(getResObj.callCount, _.size(typesExceptEmpty));
      assert.strictEqual(getResObj.alwaysThrew('TypeError'), true);
    });

    it('data and error can not be present together', function () {
      var typesExceptEmpty = _(typesToCheck).omit(['NULL', 'UNDEFINED']).values().value();

      typesExceptEmpty.forEach(function (type) {
        try {
          getResObj(type, type);
        } catch (e) {}
      });

      assert.strictEqual(getResObj.callCount, _.size(typesExceptEmpty));
      assert.strictEqual(getResObj.alwaysThrew('TypeError'), true);
    });

    it('should only allow a string errCode parameter', function () {
      var someTypes = _(typesToCheck).omit(['NULL', 'UNDEFINED', 'NUMBER', 'NOT_A_NUMBER', 'BOOLEAN_FALSE']).values().value();

      someTypes.forEach(function (type) {
        try {
          getResObj(type);
        } catch (e) {}
      });

      assert.strictEqual(getResObj.callCount, _.size(someTypes));
      assert.strictEqual(getResObj.alwaysThrew('TypeError'), true);
    });

    it('should only allow an object as error parameter', function () {
      var allTypes = _(typesToCheck).values().value();

      allTypes.forEach(function (type) {
        try {
          getResObj(type);
        } catch (e) {}
      });

      assert.strictEqual(getResObj.callCount, _.size(allTypes));
      assert.strictEqual(getResObj.alwaysThrew('TypeError'), true);
    });

  });
});

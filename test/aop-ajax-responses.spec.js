var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var _ = require('lodash');

var constants = require('../constants');

var typesToCheck = [
  'string',
  null,
  undefined,
  NaN,
  Infinity, {},
  [],
  /.+/,
  1,
  new Date()
];

var lib;
var data;
var error;
var getResObj;
var sendSuccessResponse;
var sendErrorResponse;

var req = {
  params: {}
};

var res = {};

_.extend(res, {
  status: sinon.stub().returns(res),
  setHeader: sinon.spy(),
  json: sinon.stub().returns(res)
});

function getLastReturnResult(spy) {
  return spy.returnValues.slice(-1)[0];
}

function getLastCallArgs(spy) {
  return spy.args.slice(-1)[0];
}

describe('The aop-ajax-responses module', function () {

  beforeEach(function () {
    data = {
      data: 'data'
    };

    // @todo: stub i18n-future
    lib = proxyquire('../lib/index', {

    });
  });

  describe('when getting a response object', function () {

    beforeEach(function () {
      getResObj = sinon.spy(lib, 'getResponseObj');
    });

    after(function () {
      getResObj.restore();
    });

    it('should only allow a boolean isSuccess parameter', function () {
      typesToCheck.forEach(function (type) {
        try {
          getResObj(type);
        } catch (e) {

        }
      });

      assert.strictEqual(getResObj.callCount, typesToCheck.length);
      assert.strictEqual(getResObj.alwaysThrew('TypeError'), true);
    });

    it('should only allow a string errCode parameter', function () {
      _.without(typesToCheck, 'string').forEach(function (type) {
        try {
          getResObj(false, null, type, 'whatever');
        } catch (e) {}
      });

      assert.strictEqual(getResObj.callCount, typesToCheck.length - 1);
      assert.strictEqual(getResObj.alwaysThrew('TypeError'), true);
    });

    it('should only allow a string errMsg parameter', function () {
      _.without(typesToCheck, 'string').forEach(function (type) {
        try {
          getResObj(false, null, error.code, type);
        } catch (e) {}
      });

      assert.strictEqual(getResObj.callCount, typesToCheck.length - 1);
      assert.strictEqual(getResObj.alwaysThrew('TypeError'), true);
    });

    it('should provide a frozen object', function () {
      try {
        var resObj = getResObj(true, data);
        resObj.success = false;
      } catch (e) {
        assert.instanceOf(e, Error);
      }
    });

  });

  describe('when calling sendSuccessResponse', function () {
    beforeEach(function () {
      sendSuccessResponse = sinon.spy(lib, 'sendSuccessResponse');
      res.json.reset();
    });

    after(function () {
      sendSuccessResponse.restore();
    });

    it('sets the correct status code on the request', function () {
      sendSuccessResponse(req, res, data);
      assert.strictEqual(getLastCallArgs(res.status)[0], constants.HTTP_CODES.OK);
    });

  });

  describe('when calling sendErrorResponse', function () {
    beforeEach(function () {
      sendErrorResponse = sinon.spy(lib, 'sendErrorResponse');
      res.json.reset();
    });

    after(function () {
      sendErrorResponse.restore();
    });

    it('sets the correct status code on the request', function () {
      sendErrorResponse(req, res, data);
      assert.strictEqual(getLastCallArgs(res.status)[0], constants.HTTP_CODES.OK);
    });
  });

});

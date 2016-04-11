var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var _ = require('lodash');

var constants = require('../constants');

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

// function getLastReturnResult(spy) {
//   return spy.returnValues.slice(-1)[0];
// }

// function getLastCallArgs(spy) {
//   return spy.args.slice(-1)[0];
// }

describe('The aop-ajax-responses module', function () {

  beforeEach(function () {
    var self = this;

    self.error = {
      errCode: 'errCode',
      errMsg: 'errMsg'
    };

    self.data = {
      data: 'data'
    };

    self.req = {
      params: {}
    };

    self.res = {};

    _.extend(self.res, {
      status: sinon.stub().returns(self.res),
      setHeader: sinon.spy(),
      json: sinon.stub().returns(self.res)
    });

    self.i18TransateStub = sinon.stub();
    function i18nStub() {
      return {
        translate: self.i18TransateStub
      };
    }

    self.lib = proxyquire('../lib/index', {
      'i18n-future': i18nStub
    });

    // init the lib
    self.lib = this.lib({
      baseDir: 'baseDir'
    });
  });

  describe('when getting a response object', function () {

    beforeEach(function () {
      this.getResObj = sinon.spy(this.lib, 'getResponseObj');
    });

    after(function () {
      this.getResObj.restore();
    });

    it('data or error must be present', function () {
      var self = this;

      var typesExceptEmpty = _(typesToCheck).pick(['NULL', 'UNDEFINED']).values().value();

      typesExceptEmpty.forEach(function (type) {
        try {
          self.getResObj(type, type);
        } catch (e) {}
      });

      assert.strictEqual(self.getResObj.callCount, _.size(typesExceptEmpty));
      assert.strictEqual(self.getResObj.alwaysThrew('TypeError'), true);
    });

    it('data and error can not be present together', function () {
      var self = this;
      
      var typesExceptEmpty = _(typesToCheck).omit(['NULL', 'UNDEFINED']).values().value();

      typesExceptEmpty.forEach(function (type) {
        try {
          self.getResObj(type, type);
        } catch (e) {}
      });

      assert.strictEqual(self.getResObj.callCount, _.size(typesExceptEmpty));
      assert.strictEqual(self.getResObj.alwaysThrew('TypeError'), true);
    });

    it('should only allow a string errCode parameter', function () {
      var self = this;
      
      var someTypes = _(typesToCheck).omit(['NULL', 'UNDEFINED', 'NUMBER', 'NOT_A_NUMBER', 'BOOLEAN_FALSE']).values().value();

      someTypes.forEach(function (type) {
        try {
          self.getResObj(type);
        } catch (e) {}
      });

      assert.strictEqual(self.getResObj.callCount, _.size(someTypes));
      assert.strictEqual(self.getResObj.alwaysThrew('TypeError'), true);
    });

    it('should only allow an object as error parameter', function () {
      var self = this;
      
      var allTypes = _(typesToCheck).values().value();

      allTypes.forEach(function (type) {
        try {
          self.getResObj(type);
        } catch (e) {}
      });

      assert.strictEqual(self.getResObj.callCount, _.size(allTypes));
      assert.strictEqual(self.getResObj.alwaysThrew('TypeError'), true);
    });

  });

  describe('when sending a success response', function () {

    beforeEach(function () {
      this.getResObj = sinon.spy(this.lib, 'getResponseObj');
      this.sendSuccessRes = sinon.spy(this.lib, 'sendSuccessResponse');
    });

    after(function () {
      this.getResObj.restore();
      this.sendSuccessRes.restore();
    });

    it('res must be called with data', function () {
      var self = this;

      self.sendSuccessRes(self.req, self.res, self.data);

      // @todo: getResObj is not stubbed properly. check how to do it.
      // assert.equal(self.getResObj.calledWith(null, self.data), true);
      assert.strictEqual(self.res.setHeader.calledWith(constants.HEADER_NAMES.CONTENT_TYPE, constants.CONTENT_TYPES.APPLICATION_JSON), true);
      assert.strictEqual(self.res.status.calledWith(constants.HTTP_CODES.OK), true);
      assert.strictEqual(self.res.json.calledWith({ data: self.data }), true);
    });
  });

  describe('when sending an error response', function () {

    beforeEach(function () {
      this.getResObj = sinon.spy(this.lib, 'getResponseObj');
      this.sendErrorRes = sinon.spy(this.lib, 'sendErrorResponse');
    });

    after(function () {
      this.getResObj.restore();
      this.sendErrorRes.restore();
    });

    it('getResponseObj must be called with data', function () {
      var self = this;

      self.i18TransateStub.returns(self.error.errMsg);

      self.sendErrorRes(self.req, self.res, self.error.errCode);

      // @todo: getResObj is not stubbed properly. check how to do it.
      // assert.equal(self.getResObj.calledWith(null, { data: self.data }), true);
      assert.equal(self.i18TransateStub.calledWith(self.error.errCode, { lang:'en' }), true);
      assert.equal(self.res.setHeader.calledWith(constants.HEADER_NAMES.CONTENT_TYPE, constants.CONTENT_TYPES.APPLICATION_JSON), true);
      assert.equal(self.res.status.calledWith(constants.HTTP_CODES.OK), true);
      assert.equal(self.res.json.calledWith({ error: {message: self.error.errMsg, code: self.error.errCode} }), true);
    });
  });

});

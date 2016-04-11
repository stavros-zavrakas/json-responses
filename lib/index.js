var _ = require('lodash');

var i18n = require('i18n-future');

var constants = require('../constants');

function getResponseObj(err, data) {
  if (!err && !data) {
    throw new TypeError('getResponseObj: Err or Data should be present');
  }

  if (err && data) {
    throw new TypeError('getResponseObj: Err and Data can not be present together');
  }

  if (err && (!err.errMsg || !err.errCode)) {
    throw new TypeError('getResponseObj: Error message and Error code must be present');
  }

  if (!_.isUndefined(data)) {
    return {
      data: data
    };
  }

  return {
    error: {
      message: err.errMsg,
      code: err.errCode
    }
  };
}

function sendResponse(res, responseObj) {
  res.setHeader(constants.HEADER_NAMES.CONTENT_TYPE, constants.CONTENT_TYPES.APPLICATION_JSON);

  return res.status(constants.HTTP_CODES.OK).json(responseObj);
}

function sendSuccessResponse(req, res, data) {
  var dataToSend = getResponseObj(null, data);

  return sendResponse(res, dataToSend);
}

function sendErrorResponse(req, res, errCode) {
  // @todo: we have to retrieve the language from the client that called us.
  var language = {
    lang: req.params.lang || 'en'
  };

  var errMsg = i18n.translate(errCode, language);

  var errorObj = {
    errCode: errCode,
    errMsg: errMsg
  };

  var dataToSend = getResponseObj(errorObj);
  return sendResponse(res, dataToSend);
}

module.exports = function jsonResponses(options) {
  options = options || {};

  if (!options.baseDir) {
    throw new TypeError('jsonResponses: the baseDir must be provided.');
  }

  i18n = i18n({
    baseDir: options.baseDir
  });

  // @todo: should we use it somehow?
  // i18n.on('ready', function () {
  // });

  return {
    getResponseObj: getResponseObj,
    sendSuccessResponse: sendSuccessResponse,
    sendErrorResponse: sendErrorResponse
  };
};

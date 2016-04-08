var _ = require('lodash');

var i18n = require('i18n-future');

var constants = require('../constants');
var getErrorCodeTranslation = require('../lang/getErrorCodeTranslation');

function getResponseObj(err, data) {
  if (_.isEmpty(err) && _.isEmpty(data)) {
    throw new TypeError('getResponseObj: Err or Data should be present');
  }

  if (!_.isEmpty(err) && !_.isEmpty(data)) {
    throw new TypeError('getResponseObj: Err and Data can not be present together');
  }

  if (!_.isEmpty(err) && (_.isEmpty(err.errMsg) || _.isEmpty(err.errCode))) {
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

  // i18n.on('ready', function () {
  //   var en = i18n.translate('ERR_000100', { lang: 'en' });
  //   console.log('en: ', en);
  //   var gr = i18n.translate('ERR_000100', { lang: 'gr' });
  // });

  return {
    getResponseObj: getResponseObj,
    sendSuccessResponse: sendSuccessResponse,
    sendErrorResponse: sendErrorResponse
  };
}

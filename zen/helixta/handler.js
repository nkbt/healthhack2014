// Copyright Helix Technologies Australia 2014

var util = require('util');
var extend = require('underscore').extend;
var qq = require('./qq');
var inject = require('./inject');
var Injector = inject.Injector;

var nextRqId = 1;
exports.mkHandler = function(config, appProviders, reqProviders) {
  var appScope = new Injector(null, config, appProviders);
  appScope.name = 'appscope';

  return function(h, mappings) {
    if (mappings == null) {
      mappings = {};
    }
    var providers = extend({}, Injector.mappedProviders(mappings), reqProviders);
    return function(rq, rs) {
      var startTime = Date.now();
      var rqid = String.fromCharCode(65 + (nextRqId % 26)) + String.fromCharCode(65 + ((nextRqId + 10) % 26)) + nextRqId;
      nextRqId += 1;
      var desc = '[' + rqid + ']' + rq.method.charAt(0) + rq.url;
      if (desc.length > 25) {
        desc = desc.substring(0, 22) + '...';
      }
      var urlSummary = rq.url;
      if (urlSummary.length > 30) {
        urlSummary = urlSummary.substring(0, 30) + '...';
      }
      var scope = appScope.child({
        rq: rq,
        rs: rs,
        rqdesc: desc
      }, providers);
      scope.name = 'rqscope';
      rq._inject_scope = scope;
      rq._desc = desc;
      return qq.resolve(null, rq).then(function() {
        console.info('begin', urlSummary);
        return scope.invoke(h);
      }).then(function() {
        return console.info('complete', Date.now() - startTime, 'ms');
      }).fail(function(err) {
        console.error('... ERROR', desc, ' failed at', Date.now() - startTime, 'ms with ', err);
        if (err != null ? err.stack : void 0) {
          util.puts(err.stack);
        }
        return scope.invoke(function(writer) {
          var _ref;
          if (err.bcode) {
            return writer({
              err: err.bcode,
              message: (_ref = err.message) != null ? _ref : 'error'
            }, err.bcode);
          } else {
            return writer({
              err: 500,
              message: 'Internal error'
            }, 500);
          }
        });
      });
    };
  };
}

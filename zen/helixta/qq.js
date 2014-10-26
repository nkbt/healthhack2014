// Copyright Helix Technologies Australia 2014

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

var Q = require('q');

var QqPromise = (function() {
  function QqPromise(cxt, promise) {
    this.cxt = cxt;
    this.promise = promise;
    this.fin = __bind(this.fin, this);
    this.fail = __bind(this.fail, this);
    this.then = __bind(this.then, this);
    if (!this.cxt) {
      throw new Error("No cxt provided");
    }
    if (process.DEV !== false) {
      this.promise.fail(function(e) {
        console.log('(Promise failed, ' + e.toString().substring(0, 50).replace(/\n/, '') + '...)');
        throw e;
      });
    }
  }

  QqPromise.prototype.then = function(fulfilled, rejected, progressed) {
    if (fulfilled) {
      fulfilled = this._wrap(fulfilled);
    }
    if (rejected) {
      rejected = this._wrap(rejected);
    }
    if (progressed) {
      progressed = this._wrap(progressed);
    }
    return new QqPromise(this.cxt, this.promise.then(fulfilled, rejected, progressed));
  };

  QqPromise.prototype.fail = function(fn) {
    return this.then(null, fn, null);
  };

  QqPromise.prototype.fin = function(fn) {
    return this.promise.fin(this._wrap(fn));
  };

  QqPromise.prototype.done = function() {
    return this.promise.done();
  };

  QqPromise.prototype._wrap = function(fn) {
    return (function(_this) {
      return function(v) {
        return withContext(_this.cxt, function() {
          return fn(v);
        });
      };
    })(this);
  };

  return QqPromise;

})();

function withContext(cxt, block) {
  var orig;
  orig = process._qq_cxt;
  try {
    process._qq_cxt = cxt;
    return block();
  } finally {
    process._qq_cxt = orig;
  }
};

var Qq = (function() {
  function Qq() {
    this.context = __bind(this.context, this);
    this.decorate = __bind(this.decorate, this);
    this.maybeContext = __bind(this.maybeContext, this);
    this.newThread = __bind(this.newThread, this);
    this.npost = __bind(this.npost, this);
    this.ninvoke = __bind(this.ninvoke, this);
    this.nfcall = __bind(this.nfcall, this);
    this.reject = __bind(this.reject, this);
    this.resolve = __bind(this.resolve, this);
    this.defer = __bind(this.defer, this);
  }

  Qq.prototype.defer = function(cxt) {
    var d;
    if (cxt == null) {
      cxt = process._qq_cxt;
    }
    d = Q.defer();
    d.promise = new QqPromise(cxt, d.promise);
    return d;
  };

  Qq.prototype.resolve = function(val, cxt) {
    if (cxt == null) {
      cxt = process._qq_cxt;
    }
    return new QqPromise(cxt, Q.resolve(val));
  };

  Qq.prototype.reject = function(reason, cxt) {
    if (cxt == null) {
      cxt = process._qq_cxt;
    }
    return new QqPromise(cxt, Q.reject(reason));
  };

  Qq.prototype.nfcall = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return new QqPromise(process._qq_cxt, Q.nfcall.apply(Q, args));
  };

  Qq.prototype.ninvoke = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return new QqPromise(process._qq_cxt, Q.ninvoke.apply(Q, args));
  };

  Qq.prototype.npost = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return new QqPromise(process._qq_cxt, Q.npost.apply(Q, args));
  };

  Qq.prototype.withContext = withContext;

  Qq.prototype.newThread = function(name, block) {
    if (!this.log) {
      this.log = require('../lib/log')('qq');
    }
    this.resolve(null, {
      _desc: name
    }).then((function(_this) {
      return function() {
        _this.log.info('begin thread', name);
        return block();
      };
    })(this)).fail(function(er) {
      return this.log.error(er);
    }).fin(function() {
      return this.log.info('finished thread', name);
    });
  };

  Qq.prototype.maybeContext = function() {
    return process._qq_cxt;
  };

  Qq.prototype.decorate = function(obj, methods) {
    var m, qq, wrapped, _i, _len;
    qq = this;
    wrapped = {};
    for (_i = 0, _len = methods.length; _i < _len; _i++) {
      m = methods[_i];
      wrapped[m] = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return qq.npost(obj, m, args);
      };
    }
    return wrapped;
  };

  Qq.prototype.context = function() {
    if (process._qq_cxt) {
      return process._qq_cxt;
    } else {
      throw new Error('No current qq context');
    }
  };

  return Qq;

})();

var qq = new Qq;
module.exports = qq;

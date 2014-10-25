// Copyright Helix Technologies Australia 2014

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

var Q = require('q');

var HQPromise = (function() {
  function HQPromise(cxt, promise) {
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
        var errStr = e.toString()
        var limit = 200;
        errStr = errStr.substring(0, limit) + (errStr.length > limit ? '...' : '');
        console.error('Promise failed (', errStr.replace(/\n/, ''), ')');
        throw e;
      });
    }
  }

  HQPromise.prototype.then = function(fulfilled, rejected, progressed) {
    if (fulfilled) {
      fulfilled = this._wrap(fulfilled);
    }
    if (rejected) {
      rejected = this._wrap(rejected);
    }
    if (progressed) {
      progressed = this._wrap(progressed);
    }
    return new HQPromise(this.cxt, this.promise.then(fulfilled, rejected, progressed));
  };

  HQPromise.prototype.fail = function(fn) {
    return this.then(null, fn, null);
  };

  HQPromise.prototype.fin = function(fn) {
    return this.promise.fin(this._wrap(fn));
  };

  HQPromise.prototype.done = function() {
    return this.promise.done();
  };

  HQPromise.prototype._wrap = function(fn) {
    return (function(_this) {
      return function(v) {
        return withContext(_this.cxt, function() {
          return fn(v);
        });
      };
    })(this);
  };

  return HQPromise;

})();

function withContext(cxt, block) {
  var orig;
  orig = process._hq_cxt;
  try {
    process._hq_cxt = cxt;
    return block();
  } finally {
    process._hq_cxt = orig;
  }
};

var HQ = (function() {
  function HQ() {
    this.context = __bind(this.context, this);
    this.decorate = __bind(this.decorate, this);
    this.maybeContext = __bind(this.maybeContext, this);
    this.newThread = __bind(this.newThread, this);
    this.npost = __bind(this.npost, this);
    this.ninvoke = __bind(this.ninvoke, this);
    this.nfcall = __bind(this.nfcall, this);
    this.reject = __bind(this.reject, this);
    this.resolve = __bind(this.resolve, this);
    this.all = __bind(this.all, this);
    this.wrap = __bind(this.wrap, this);
    this.defer = __bind(this.defer, this);
  }

  HQ.prototype.wrap = function(cxt, promise) {
    if (cxt == null) {
      cxt = process._hq_cxt;
    }
    return new HQPromise(cxt, promise);
  };

  HQ.prototype.defer = function(cxt) {
    var d = Q.defer();
    d.promise = this.wrap(cxt, d.promise);
    return d;
  };

  HQ.prototype.begin = function(cxt) {
    return this.resolve(null, cxt);
  }

  HQ.prototype.resolve = function(val, cxt) {
    if (cxt == null) {
      cxt = process._hq_cxt;
    }
    return new HQPromise(cxt, Q(val));
  };

  HQ.prototype.reject = function(reason, cxt) {
    if (cxt == null) {
      cxt = process._hq_cxt;
    }
    return new HQPromise(cxt, Q.reject(reason));
  };

  HQ.prototype.all = function() {
    var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return new HQPromise(process._hq_cxt, Q.all.apply(Q, args));
  };

  HQ.prototype.nfcall = function() {
    var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return new HQPromise(process._hq_cxt, Q.nfcall.apply(Q, args));
  };

  HQ.prototype.ninvoke = function() {
    var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return new HQPromise(process._hq_cxt, Q.ninvoke.apply(Q, args));
  };

  HQ.prototype.npost = function() {
    var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return new HQPromise(process._hq_cxt, Q.npost.apply(Q, args));
  };

  HQ.prototype.withContext = withContext;

  HQ.prototype.newThread = function(name, block) {
    if (!this.log) {
      this.log = require('../lib/log')('hq');
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

  HQ.prototype.decorate = function(obj, methods) {
    wrapped = {};
    methods.forEach(function(m) {
      wrapped[m] = function() {
        var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.npost(obj, m, args);
      };
    });
    return wrapped;
  };

  HQ.prototype.wrapMethods = function(obj, methods) {
    wrapped = {};
    var hq = this;
    methods.forEach(function(m) {
      wrapped[m] = function() {
        var promise = obj[m].apply(obj, arguments);
        return hq.wrap(null, promise);
      }
    });
    return wrapped;
  };

  HQ.prototype.maybeContext = function() {
    return process._hq_cxt;
  };

  HQ.prototype.context = function() {
    if (process._hq_cxt) {
      return process._hq_cxt;
    } else {
      throw new Error('No current hq context');
    }
  };

  return HQ;

})();

var hq = new HQ;
module.exports = hq;

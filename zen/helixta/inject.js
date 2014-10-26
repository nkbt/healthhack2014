// Copyright Helix Technologies Australia 2014

var _ = require('underscore');

String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, '');
};

var funcParams;
exports.funcParams = funcParams = function(func) {
  var mapped;
  mapped = _.map(/\(([\s\S]*?)\)/.exec(func)[1].replace(/\/\*.*\*\//g, '').split(','), (function(arg) {
    return arg.trim();
  }));
  return _.filter(mapped, function(a) {
    return a;
  });
};

var inheritObject;
exports.inheritObject = inheritObject = function(fromObj) {
  var F;
  F = function() {};
  F.prototype = fromObj;
  return new F;
};

var Injector;
exports.Injector = Injector = (function() {
  Injector.providerOfDep = function(name) {
    return function($injector) {
      return $injector.get(name);
    };
  };

  Injector.providerFromCtor = function(ctor) {
    if (!ctor) {
      throw new Error('ctor required');
    }
    return function($injector) {
      return $injector.instantiate(ctor);
    };
  };

  Injector.mappedProviders = function(mappings) {
    var k, providers, v;
    providers = {};
    for (k in mappings) {
      v = mappings[k];
      providers[k] = Injector.providerOfDep(v);
    }
    return providers;
  };

  function Injector(parent, values, providers) {
    this.parent = parent;
    this.values = values;
    this.providers = providers;
    this.values.$injector = this;
  }

  Injector.prototype.get = function(name) {
    var maybeVal;
    maybeVal = this.resolve(name);
    if (maybeVal !== void 0) {
      return maybeVal;
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    throw new Error('Unresolved dependency: ' + name);
  };

  Injector.prototype.resolve = function(name) {
    if (this.values.hasOwnProperty(name)) {
      return this.values[name];
    }
    if (this.providers[name]) {
      this.values[name] = this.invoke(this.providers[name], null);
    }
    return this.values[name];
  };

  Injector.prototype.invoke = function(func, self) {
    var args;
    if (self == null) {
      self = null;
    }
    args = _.map(funcParams(func), (function(_this) {
      return function(p) {
        return _this.get(p);
      };
    })(this));
    return func.apply(self, args);
  };

  Injector.prototype.instantiate = function(ctor) {
    var Dummy, instance;
    Dummy = function() {};
    Dummy.prototype = ctor.prototype;
    instance = new Dummy;
    this.invoke(ctor, instance);
    return instance;
  };

  Injector.prototype.child = function(values, providers) {
    return new Injector(this, values, providers);
  };

  return Injector;

})();
var Q = require('./hq');

var mode = '';

exports.schema = function schema(proc) {
  mode = 'schema';
  return proc({ states: {} }).schema;
}

exports.run = function run(proc, data) {
  mode = 'run';
  return proc({ states: {}, data: data });
}

exports.start = function start(input) {
  if (mode === 'run') {
    return Q.resolve(input, {});
  } else {
    var me = {
      then: function(task) {
        me.schema.push(task);
        return me;
      },
      schema: [],
    };
    return me;
  }
}

function setTimeout(defer, timeout, taskName) {
  if (timeout) {
    setTimeout(function() {
      defer.reject(taskName + ' timed out.');
    }, timeout);
  }
}

function getState(input, taskName) {
  var state = input.states[taskName] || {};
  input.states[taskName] = state;
  return state;
}

function processState(input, state) {
  var output = { states: input.states };
  switch(state.status) {
    case 'done':
      return { states: input.states, data: state.data };
    case 'running':
    case 'failed':
      return { states: input.states, data: '##SKIP##' };
    default:
      if (input.data === '##SKIP##') {
        return { states: input.states, data: '##SKIP##' };
      }
  }
}

var count = 0;

exports.mkTask = function mkTask(taskName, callback, timeout) {
  if (mode === 'schema') {
    return { name: taskName };
  }
  callback = callback || function(data) { console.log('callback', taskName); return count++; };

  function taskFn(input) {
    console.log('Running task ' + taskName, input);
    var defer = Q.defer();
    setTimeout(defer, timeout, taskName);

    var state = getState(input, taskName);
    var output = processState(input, state);
    if (output) {
      defer.resolve(output);
    } else if (input.data !== undefined) {
      state.status = 'running';
      Q.resolve(input.data).then(callback)
      .then(function(result) {
        if (result !== undefined) {
          state.status = 'done';
        }
        state.data = result;
        input.states[taskName] = state;
        console.log('result:', result);
        defer.resolve({ states: input.states, data: result });
      }, function(error) {
        state.status = 'failed';
        delete state.data;
        input.states[taskName] = state;
        defer.resolve({ states: input.states});
      });
    }
    return defer.promise;
  }
  taskFn.taskName = taskName;
  return taskFn;
}

exports.mkNestedTask = function mkNestedTask(taskName, tasks) {
  if (mode === 'run') {
    function taskFn(input) {
      console.log('Running nested task ' + taskName, input);
      var promises = tasks.map(function(task) {
        return Q.resolve(input).then(task);
      });
      return Q.all(promises).then(function(results) {
        var resultMap = {};
        tasks.forEach(function(task, idx) {
          resultMap[task.taskName] = results[idx].data;
        });
        return { states: input.states, data: resultMap };
      });
    }
    taskFn.taskName = taskName;
    return taskFn;
  } else {
    return { name: taskName, children: tasks };
  }
}

exports.inParallel = function inParallel() {
  console.log(arguments);
  return exports.mkNestedTask(null, arguments);
}

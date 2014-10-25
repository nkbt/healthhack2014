var Q = require('./hq');

var mode = '';

exports.schema = function schema(proc) {
  mode = 'schema';
  return proc({ state: {} }).schema;
}

exports.run = function run(proc, data) {
  mode = 'run';
  return proc({ state: {}, data: data });
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

exports.mkTask = function mkTask(taskName, callback) {
  callback = callback || function(data) { return data; };
  if (mode === 'run') {
    function taskFn(input) {
      console.log('Running task ' + taskName);
      var result = callback(input.data);
      console.log('result:', result);
      return { state: input.state, data: result };
    }
    taskFn.taskName = taskName;
    return taskFn;
  } else {
    return { name: taskName };
  }
}

exports.mkNestedTask = function mkNestedTask(taskName, tasks) {
  if (mode === 'run') {
    function taskFn(input) {
      console.log('Running nested task ' + taskName);
      var promises = tasks.map(function(task) {
        return Q.resolve(input).then(task)
        .then(function(result) { return { state: input.state, data: result }; });
      });
      return Q.all(promises).then(function(results) {
        var resultMap = {};
        tasks.forEach(function(task, idx) {
          resultMap[task.taskName] = results[idx];
        });
        return resultMap;
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

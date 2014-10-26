var mode = '';

function Zen(states) {
  this.data = {};
  this.schema = [];
  this.states = states || {}
}

exports.Zen = Zen;

Zen.prototype.then = function(task) {
  this.schema.push(task);
  return this;
}

Zen.prototype.run = function(data) {
  this.data = data || this.data;
  for (var i in this.schema) {
    data = this._runTask(this.schema[i], data).data;
  }
  return data;
}

Zen.prototype.getStatus = function() {
  console.log('get status');
  var states = this.states;
  var firstTask = this.schema[0];
  var lastTask = this.schema[this.schema.length - 1];
  var lastState = states[lastTask.name];
  var firstState = states[firstTask.name];

  console.log(states);
  if (lastState && lastState.status) {
    return lastState.status;
  }
  var failed = Object.keys(states).filter(function(taskName) {
    return states[taskName].status === 'failed'
  }).length;
  if (failed) {
    return 'failed';
  }
  if (firstState && firstState.status) {
    return 'running';
  }
}

Zen.prototype._runTask = function(task, data) {
  if (task.all) {
    return this._runAllTasks(task.all, data);
  }
  var taskName = task.name;
  var state = this.states[taskName] || {};
  this.states[taskName] = state;

  switch (state.status) {
    case 'done':
    case 'running':
      return state;
  }
  var me = this;
  delete state.data; // just in case it's still hanging around;
  if (task.fn && data !== undefined) {
    function resolve(data, skipRun) {
      state.status = 'done';
      state.data = data;
      delete state.error;
      if (!skipRun) {
        me.run();
      }
    }
    function reject(error, skipRun) {
      state.status = 'failed';
      state.error = error;
      delete state.data;
      if (!skipRun) {
        me.run();
      }
    }

    try {
      // if the function returns right away, record data and mark
      // task as done otherwise it's still running.
      state.status = 'running';
      var result = task.fn(data, resolve, reject)
      if (result !== undefined) {
        resolve(result, true);
      }
      return state;
    } catch(e) {
      reject(e, true);
    }
  }
  return state;
}

Zen.prototype._runAllTasks = function(tasks, data) {
  var me = this;
  var resultStates = tasks.map(function(task) {
    var result = me._runTask(task, data);
    return { taskName: task.name, status: result.status };
  });
  var allDone = resultStates.filter(function(state) {
    return state.status !== 'done';
  }).length === 0;
  if (allDone) {
    var results = {};
    tasks.forEach(function(task, idx) {
      results[task.name] = resultStates[idx].data;
    });
    return { status: 'done', data: results };
  } else {
    return {};
  }
}

Zen.mkTask = function mkTask(taskName, taskFn, timeout) {
  taskFn = taskFn || function(data) {
    console.log('Running task', taskName);
    return data;
  };
  return { name: taskName, fn: taskFn, timeout: timeout };
}

Zen.all = function all(tasks) {
  return { all: tasks };
}

function setTimeout(defer, timeout, taskName) {
  if (timeout) {
    setTimeout(function() {
      defer.reject(taskName + ' timed out.');
    }, timeout);
  }
}
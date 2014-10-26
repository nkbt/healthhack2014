var qq = require('./helixta/qq');
var fs = require('fs');
var Projects = require('./services/projects');

exports.applicationLevel = {
  qfs: function() { return qq.decoreate(fs, ['readfile', 'writefile']); },
  Projects: function() {
    return new Projects();
  },
};

exports.requestLevel = {
  jsonWriter: function(rs) {
    return function(data, status) {
      if (status == null) {
        status = 200;
      }
      rs.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8"
      });
      if (process.DEV !== false) {
        rs.write(JSON.stringify(data, null, '  '));
      } else {
        rs.write(JSON.stringify(data));
      }
      return rs.end();
    };
  },
};

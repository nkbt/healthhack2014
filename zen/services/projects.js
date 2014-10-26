var Projects = (function() {
  function Projects() {}

  Projects.prototype.list = function() {
    return projects.map(function(proj) {
      return {
        id: proj.id,
        name: proj.name,
        status: proj.getStatus(),
      };
    });
  };

  Projects.prototype.get = function(id) {
    var proj = projects.filter(function(proj) {
      return proj.id == id; // id is a string.
    })[0];
    if (proj) {
      proj.status = proj.getStatus();
    }
    return proj || {};
  };

  Projects.prototype.reset = function() {
    initProjects();
  }

  return Projects;
})();

module.exports = Projects;

var genome = require('../genome');

function runProjects() {
  projects.forEach(function(proj, idx) {
    setTimeout(function() {
      proj.run({});
    }, idx * 100);
  });
}

var projects = [];

function initProjects() {
  for(var i = 0; i < 20; i++) {
    var proj = genome(i + 1);
    projects.push(proj);

    runProjects();
  }
}

initProjects();
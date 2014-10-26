exports.listProjects = function(rq, writer, Projects) {
  writer(Projects.list());
}

exports.getProject = function(rq, writer, Projects) {
  var id = rq.params.id;
  writer(Projects.get(id));
}

angular.module('zen', [
  'hx.ui',
])
.controller('MainCtrl', function ($scope, $injector) {

  var di = heroin.Injector.wrapAngular($injector);
  di.load({
    route: createNgRouter,

    ZenService: di.factory(ZenService),
  });

  $scope.route = di.make(AppCtrl).route;
});

function AppCtrl(createUi, route, make) {
  this.route = route([
    ['projects', function(setCurrent) {
      var projRoute = route.child('projects');
      setCurrent( make(ProjectListCtrl, { route: projRoute }) );
      return projRoute;
    }],
  ], 'projects');
}

function ProjectListCtrl(createUi, route, make, ZenService) {
  route([
    [/(.+)/, itemRoute(make.factory(ProjectCtrl))],
  ]);

  var ui;
  this.ui = ui = createUi('project-list.html', {
    route: route,
    listing: [],
  });

  ZenService.listProjects(function(listing) {
    ui.listing = listing;
  });
}

function ProjectCtrl(createUi, make, projId, ZenService) {
  var ui;
  this.ui = ui = createUi('project.html', {
    projId: projId,
    projData: {},
  });

  ZenService.getProject(projId, function(projData) {
    ui.projData = projData;
  });
}

function ZenService($http) {
  var listingCallback;
  var projectCallback;
  var projectId;

  function listProjects() {
    $http.get('/projects')
    .then(function(resp) { listingCallback(resp.data); });
  }

  function getProject() {
    $http.get('/projects/' + projectId)
    .then(function(resp) { projectCallback(resp.data); });
  }

  function poll() {
    if (listingCallback) {
      listProjects();
    }
    if (projectCallback && projectId) {
      getProject();
    }

    setTimeout(poll, 500);
  }
  poll();

  this.listProjects = function(callback) {
    listingCallback = callback;
    return listProjects();
  };
  this.getProject = function(id, callback) {
    projectCallback = callback;
    projectId = id;
    return getProject();
  };
}

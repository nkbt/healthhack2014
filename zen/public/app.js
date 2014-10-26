angular.module('zen', [
  'hx.ui',
])
.controller('MainCtrl', function ($scope, $injector) {

  var di = heroin.Injector.wrapAngular($injector);
  di.load({
    route: createNgRouter,

    ZenService: di.factory(ZenService),
  });

  var app = di.make(AppCtrl);

  $scope.ui = app.ui;
});

function AppCtrl(createUi, route, make) {

  var ui;
  this.ui = ui = createUi('app.html', {
    go: route.go,
    route: route,
    // nav: make(NavCtrl),
    // profile: make(ProfileCtrl),
  });
}

function ZenService($http) {
  this.listProjects = function() {
    return $http.get('/projects');
  };
  this.getProject = function(id) {
    return $http.get('/projects/' + id);
  };
}

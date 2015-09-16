var app = angular.module('comic_app', ['ui.bootstrap', 'ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when(
      '/search', {
        templateUrl: 'character_search.html',
        controller: 'characterSearchController'
      })
    .when(
      '/events/:character_id', {
        templateUrl: 'events.html',
        controller: 'eventsController'
      })
      .otherwise({ redirectTo: '/search' });
}]);
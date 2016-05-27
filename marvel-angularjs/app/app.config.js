(function(){
  angular
    .module('marvelLearnApp')
    .config(configRoutes);

  configRoutes.$inject=['$routeProvider'];

  function configRoutes($routeProvider){
    $routeProvider
      .when(
        '/search', {
          templateUrl: '/app/characterSearch/character_search.html',
          controller: 'characterSearchController',
          controllerAs: 'vm'
        })
      .when(
        '/events/:character_id', {
          templateUrl: '/app/events/events.html',
          controller: 'eventsController',
          controllerAs: 'vm'
        })
        .otherwise({ redirectTo: '/search' });
  }
})();

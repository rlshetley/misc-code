(function() {
  'use strict';

  angular
    .module('comic_app')
    .controller('eventsController', eventsController);

  eventsController.$inject = ['$scope', 'comicService', '$routeParams', '$modal'];

  function eventsController($scope, comicService, $routeParams, $modal) {
    function init() {

      comicService.get_character_events($scope.character_id)
      .then(function(data) {
        $scope.events = data.data.results;
      });

    }

    $scope.viewComics = function(event) {

      var modalInstance = $modal.open({
        templateUrl: 'event_comics.html',
        controller: 'eventComicsController',
        resolve: {
          comics: function() {
            return event.comics.items;
          }
        }
      });
    };

    $scope.character_id = $routeParams.character_id;

    $scope.events = [];

    init();
  }
})();
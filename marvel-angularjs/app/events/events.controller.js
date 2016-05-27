(function() {
  'use strict';

  angular
    .module('marvelLearnApp')
    .controller('eventsController', eventsController);

  eventsController.$inject = ['comicService', '$routeParams', '$modal', 'blockUI'];

  function eventsController(comicService, $routeParams, $modal, blockUI) {
    var vm = this;

    function init() {
      // Block the user interface
      blockUI.start();

      comicService.get_character_events(vm.character_id)
      .then(function(data) {
        vm.events = data.data.results;
        blockUI.stop();
      });

    }

    vm.viewComics = function(event) {

      var modalInstance = $modal.open({
        templateUrl: 'app/eventComics/event_comics.html',
        controller: 'eventComicsController',
        controllerAs: 'vm',
        resolve: {
          comics: function() {
            return event.comics.items;
          }
        }
      });
    };

    vm.character_id = $routeParams.character_id;

    vm.events = [];

    init();
  }
})();

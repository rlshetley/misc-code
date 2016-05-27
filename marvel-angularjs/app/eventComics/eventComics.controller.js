(function() {
  'use strict';

  angular
    .module('marvelLearnApp')
    .controller('eventComicsController', eventComicsController);

  eventComicsController.$inject = ['$modalInstance', 'comics'];

  function eventComicsController($modalInstance, comics) {
    var vm = this;

    vm.comics = comics;

    vm.close = function () {
      $modalInstance.close();
    };

  }
})();

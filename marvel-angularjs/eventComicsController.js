(function() {
  'use strict';

  angular
    .module('comic_app')
    .controller('eventComicsController', eventComicsController);

  function eventComicsController($scope, $modalInstance, comics) {
    $scope.comics = comics;

    $scope.close = function () {
      $modalInstance.close();
    };

  }
})();
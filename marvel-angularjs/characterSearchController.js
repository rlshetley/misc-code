(function() {
  'use strict';

  angular
    .module('comic_app')
    .controller('characterSearchController', characterSearchController);

  characterSearchController.$inject = ['$scope', 'comicService'];

  function characterSearchController($scope, comicService) {

    $scope.search = function() {
      comicService.get_characters($scope.search_name)
        .then(function(data) {
          $scope.characters = data.data.results;
        });
    }

    $scope.clear = function() {
      $scope.characters = [];
      $scope.search_name = '';
    }

    $scope.select = function(id) {
      comicService.get_character(id)
      .then(function(data) {
        $scope.selected_character = data.data.results[0];
      });
    }

    $scope.selected_character = {};

    $scope.dynamicPopover = {
      templateUrl: 'character_details.html'
    };

    $scope.search_name = '';

    $scope.characters = [];
  }
})();
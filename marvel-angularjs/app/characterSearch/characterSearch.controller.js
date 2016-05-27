(function() {
  'use strict';

  angular
    .module('marvelLearnApp')
    .controller('characterSearchController', characterSearchController);

  characterSearchController.$inject = ['comicService'];

  function characterSearchController(comicService) {
    var vm = this;

    vm.search = function() {
      comicService.get_characters(vm.search_name)
        .then(function(data) {
          vm.characters = data.data.results;
        });
    }

    vm.clear = function() {
      vm.characters = [];
      vm.search_name = '';
    }

    vm.select = function(id) {
      comicService.get_character(id)
      .then(function(data) {
        vm.selected_character = data.data.results[0];
      });
    }

    vm.selected_character = {};

    vm.dynamicPopover = {
      templateUrl: 'character_details.html'
    };

    vm.search_name = '';

    vm.characters = [];
  }
})();

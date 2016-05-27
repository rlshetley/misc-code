(function () {
    'use strict';

    angular
        .module('marvelLearnApp')
        .factory('comicService', comicService);

    comicService.$inject = ['$q', '$http'];

    function comicService($q, $http){
        var publicKey = 'YOU WILL NEED A KEY';
      	var baseUrl = 'http://gateway.marvel.com/v1/';
      	var limit = 50;

        function get_characters(name){

      		var def = $q.defer();
      		var url = baseUrl + 'public/characters?limit='+ limit +'&apikey=' + publicKey + '&nameStartsWith=' + name;
      		$http.get(url).success(def.resolve).error(def.reject);

      		return def.promise;
        }

        function get_character_events(id){

        		var def = $q.defer();
        		var url = baseUrl + 'public/characters/' + id +'/events?apikey=' + publicKey ;
        		$http.get(url).success(def.resolve).error(def.reject);

        		return def.promise;
        }

        return {
          get_characters : get_characters,
          get_character_events : get_character_events
        }
    }
})();

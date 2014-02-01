'use strict';

angular.module('menulangApp', [
  'ngRoute',
  'ngCookies',
  'ngSanitize',
  'ParseServices',
  'menulangControllers',
  'ExternalDataServices',
  'google-maps'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/restaurants', {
            templateUrl: 'views/restaurant-list.html',
            controller: 'RestaurantListCtrl',
            resolve: {
                'restaurants': ['RestaurantService', function(RestaurantService) {

                    // get the collection from our data definitions
                    var restaurants = new RestaurantService.collection;

                    // use the extended Parse SDK to load the whole collection
                    return restaurants.load();

                }]
            }
        }).
        otherwise({
            redirectTo: '/restaurants'
        });
}])

.run(['ParseSDK', 'ExtendParseSDK', '$rootScope', function(ParseService, ExtendParseSDK, $rootScope) {
}]);
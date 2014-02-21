'use strict';

angular.module('menulangApp', [
  'ngRoute',
  'ngCookies',
  'ngSanitize',
  'ParseServices',
  'menulangControllers',
  'loginControllers',
  'adminControllers',
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
                    var restaurants = new RestaurantService.collection();

                    // use the extended Parse SDK to load the whole collection
                    return restaurants.load();

                }]
            }
        }).
        when('/dashboard', {
            templateUrl: 'views/admin.html',
            controller: 'AdminCtrl'
        }).
        when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        }).
        otherwise({
            redirectTo: '/restaurants'
        });
    }
])

.run(['ParseSDK', 'ExtendParseSDK', '$rootScope', function(ParseService, ExtendParseSDK, $rootScope) {
}]);
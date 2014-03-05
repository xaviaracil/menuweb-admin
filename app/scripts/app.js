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
  'google-maps',
  'ngGrid'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/restaurants', {
            templateUrl: 'views/restaurant-list.html',
            controller: 'RestaurantListCtrl'
        }).
        when('/dashboard', {
            templateUrl: 'views/admin.html',
            controller: 'AdminCtrl'
        }).
        when('/dashboard/restaurants/:id', {
            templateUrl: 'views/admin-restaurant.html',
            controller: 'AdminRestaurantCtrl'            
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
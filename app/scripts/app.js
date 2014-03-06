'use strict';

angular.module('menulangApp', [
  'ionic',
  'ngCookies',
  'ngSanitize',
  'ParseServices',
  'menulangControllers',
  'loginControllers',
  'adminControllers',
  'ExternalDataServices',
  'google-maps',
])

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('restaurants', {
            url: "/restaurants",
            templateUrl: 'views/restaurant-list.html',
            controller: 'RestaurantListCtrl'
        })
        
        .state('dashboard', {
            url: "/dashboard",
            templateUrl: 'views/admin.html',
            controller: 'AdminCtrl'
        })
        
        .state('dashboard.restaurants/:id', {
            url: "/restaurants",
            templateUrl: 'views/admin-restaurant.html',
            controller: 'AdminRestaurantCtrl'            
        })
        .state('login', {
            url: "/login",
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        });
    
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/restaurants');

    }
)

.run(['ParseSDK', 'ExtendParseSDK', '$rootScope', function(ParseService, ExtendParseSDK, $rootScope) {
}]);
'use strict';

angular.module('menuwebAdminApp', [
  'menuweb.login.controllers',
  'menuweb.admin.controllers',
  'ngCookies',
  'ngSanitize',
  'ParseServices',
  'ExternalDataServices',
  'google-maps',
  'ngGrid',
  'ui.router'
])

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
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
        .state('restaurants/:id', {
            url: "/restaurants",
            templateUrl: 'views/restaurant-info.html',
            controller: 'RestaurantListCtrl'
        });
        
    
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/dashboard');

})

.run(['ParseSDK', 'ExtendParseSDK', '$rootScope', function(ParseService, ExtendParseSDK, $rootScope) {
}]);
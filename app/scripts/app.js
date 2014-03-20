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
            views: {
                'admin@': {
                    templateUrl: 'views/login.html',
                    controller: 'LoginCtrl'
                }
            }
        })
        .state('logout', {
            url: "/logout",
            views: {
                'admin@': {
                    controller: 'LogoutCtrl'                
                }
            }
        })
        .state('dashboard', {
            url: "/dashboard",
            views: {
                'admin': {
                    templateUrl: 'views/admin.html',            
                    controller: ['$scope', '$state', function($scope, $state) {
                        var currentUser = Parse.User.current();
                        if (!currentUser) {
                            $state.go('login');
                        } else {
                            $state.go('dashboard.restaurants');
                        }                
                    }]
                }
            }            
        })
        .state('dashboard.restaurants', {
            url: "",
            templateUrl: 'views/restaurant-list.html',
            controller: 'AdminRestaurantsListCtrl'
        })
        .state('dashboard.restaurants.new', {
            url: "/new",
            views: {
                '@dashboard': {
                    templateUrl: 'views/restaurant.html',
                    controller: 'AdminRestaurantsNewCtrl'
                }
            }
        })
        .state('dashboard.translations', {
            url: "/translations",
            templateUrl: 'views/translation-list.html',
            controller: 'AdminTranslationListCtrl'
        })
        .state('dashboard.translations.translation', {
            url: "/:translationId",
            views: {
                '@dashboard': {
                    templateUrl: 'views/translation.html',
                    controller: 'AdminTranslationCtrl'
                }
            }
        })
        /*
        .state('restaurant', {
            url: "/restaurants/id",
            templateUrl: 'views/restaurant-info.html',
            controller: 'RestaurantListCtrl'
        });*/
        
    
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/dashboard');

})

.run(['ParseSDK', 'ExtendParseSDK', '$rootScope', function(ParseService, ExtendParseSDK, $rootScope) {
}]);
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
  'ui.router',
  'ja.qr'
])

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('login', {
      url: '/login',
      views: {
        'admin@': {
          templateUrl: 'views/login.html',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('logout', {
      url: '/logout',
      views: {
        'admin@': {
          controller: 'LogoutCtrl'
        }
      }
    })
    .state('dashboard', {
      url: '/dashboard',
      views: {
        'admin': {
          templateUrl: 'views/admin.html',
          controller: ['isAuthenticated', '$state', function(isAuthenticated, $state) {
            if (isAuthenticated()) {
              $state.go('dashboard.restaurants');
            }
          }]
        }
      }
    })
    .state('dashboard.restaurants', {
      url: '/restaurants',
      templateUrl: 'views/restaurant-list.html',
      controller: 'AdminRestaurantsListCtrl'
    })
    .state('dashboard.restaurants.dishes', {
      url: '/:restaurantId/dishes',
      views: {
        '@dashboard': {
          templateUrl: 'views/dishes-list.html',
          controller: 'AdminDishesListCtrl'
        }
      }
    })
    .state('dashboard.restaurants.categories', {
      url: '/:restaurantId/categories',
      views: {
        '@dashboard': {
          templateUrl: 'views/restaurant-categories-list.html',
          controller: 'AdminRestaurantCategoriesListCtrl'
        }
      }
    })
    .state('dashboard.restaurants.general', {
      url: '/:restaurantId/general',
      views: {
        '@dashboard': {
          templateUrl: 'views/restaurant-general-categories-list.html',
          controller: 'AdminRestaurantGeneralCategoriesListCtrl'
        }
      }
    })
    .state('dashboard.restaurants.new', {
      url: '/new',
      views: {
        '@dashboard': {
          templateUrl: 'views/restaurant.html',
          controller: 'AdminRestaurantsNewCtrl'
        }
      }
    })
    .state('dashboard.translations', {
      url: '/translations',
      templateUrl: 'views/translation-list.html',
      controller: 'AdminTranslationListCtrl'
    })
    .state('dashboard.translations.translation', {
      url: '/:translationId',
      views: {
        '@dashboard': {
          templateUrl: 'views/translation.html',
          controller: 'AdminTranslationCtrl'
        }
      }
    })
    .state('dashboard.translations.translation.categories', {
      url: '/categories',
      views: {
        '@dashboard': {
          templateUrl: 'views/translation-categories.html',
          controller: 'AdminTranslationCategoriesCtrl'
        }
      }
    })
    .state('dashboard.categories', {
      url: '/categories',
      templateUrl: 'views/categories-list.html',
      controller: 'AdminCategoriesListCtrl'
    })
    .state('dashboard.categories.translations', {
      url: '/:categoryId/translations',
      views: {
        '@dashboard': {
          templateUrl: 'views/category-translation-list.html',
          controller: 'AdminCategoryTranslationListCtrl'
        }
      }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/dashboard');
  })

  .run(['ParseSDK', 'ExtendParseSDK', '$rootScope', function() {
}]);

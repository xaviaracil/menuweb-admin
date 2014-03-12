var adminControllers = angular.module('menuweb.admin.controllers', []);

adminControllers.controller('AdminTranslationListCtrl', ['$scope', '$state', 'ParseQueryAngular', 'RestaurantService', 'TranslationService',
    function($scope, $state, ParseQueryAngular, RestaurantService, TranslationService) {
        var currentUser = Parse.User.current();
        if (!currentUser) {
            console.log('not logged in');
            $state.go('login');
            return;
        }

        $scope.goToTranslation = function(row) {
            $state.go('.translation', {translationId: row.getProperty('id')});
            return false;
        }
        
        $scope.translations = [];
        $scope.gridOptions = { 
            data: 'translations',
            columnDefs: [
                {field: 'name', displayName: 'Name', cellTemplate: '<div class="ngCellText" ng-click="goToTranslation(row)">{{row.getProperty(col.field)}}</div>'},
                {field: 'language', displayName:'Language'},
                {field: 'completed', displayName:'Completed?'}
            ],
            showColumnMenu: true,
            rowTemplate: 'views/admin-restaurant-row.html'
        };
                                         
        // get the collection from our data definitions
        var translations = new TranslationService.collection();
        
        translations.loadTranslations().then(function(foundTranslations) {
            $scope.translations = _.map(foundTranslations.models, function(translation) {
                return {
                    id: translation.id,
                    language: translation.getLanguage(),
                    completed: translation.getCompleted(),
                    name: translation.get("restaurant").getName()
                };
            });
        });        
    }
]);

adminControllers.controller('AdminRestaurantsListCtrl', ['$scope', '$state', 'ParseQueryAngular', 'RestaurantService',
    function($scope, $state, ParseQueryAngular, RestaurantService) {
        var currentUser = Parse.User.current();
        if (!currentUser) {
            console.log('not logged in');
            $state.go('login');
            return;
        }
        $scope.restaurants = [];
        $scope.gridOptions = { 
            data: 'restaurants',
            columnDefs: [
                {field: 'name', displayName: 'Name'},
                {field: 'normalizedName', displayName:'normalizedName'},
                {field: 'completed', displayName:'Translated'}
            ],
            showColumnMenu: true,
            afterSelectionChange: $scope.onRowSelected,
            rowTemplate: 'views/admin-restaurant-row.html'
        };
                                         
        // get the collection from our data definitions
        var restaurants = new RestaurantService.collection();
        
        restaurants.loadRestaurantsOrderedByName().then(function(foundRestaurants) {
            $scope.restaurants = _.map(foundRestaurants.models, function(restaurant) {
                return {
                    id: restaurant.id,
                    name: restaurant.getName(),
                    normalizedName: restaurant.get("normalizedName"),
                    completed: restaurant.getTranslated()
                };
            });
        });        
    }
]);

adminControllers.controller('AdminTranslationCtrl', ['$scope', '$state', '$stateParams', 'ParseQueryAngular', 'TranslationService',
    function($scope, $state, $stateParams, ParseQueryAngular, TranslationService) {
        var currentUser = Parse.User.current();
        if (!currentUser) {
            console.log('not logged in');
            $state.go('login');
            return;
        }
        
        $scope.translationId = $stateParams.translationId;
    }
]);

adminControllers.controller('AdminRestaurantCtrl', ['$scope', '$location', '$stateParams', 'ParseQueryAngular', 'RestaurantService',
    function($scope, $location, $routeParams, ParseQueryAngular, RestaurantService) {
        var currentUser = Parse.User.current();
        if (!currentUser) {
            console.log('not logged in');
            $location.path('/login');
            return;
        }

        var restaurant = new RestaurantService.model();
        restaurant.id = $stateParams.id;
        restaurant.load().then(function(rest) {
            $scope.restaurant = rest;
        });
    }
]);
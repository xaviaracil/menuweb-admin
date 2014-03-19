var adminControllers = angular.module('menuweb.admin.controllers', []);

adminControllers.controller('AdminTranslationListCtrl', ['$scope', '$state', 'ParseQueryAngular', 'RestaurantService', 'TranslationService', '$rootScope', 
    function($scope, $state, ParseQueryAngular, RestaurantService, TranslationService, $rootScope) {
        var currentUser = Parse.User.current();
        if (!currentUser) {
            console.log('not logged in');
            $state.go('login');
            return;
        }

        $scope.goToTranslation = function(row) {
            $rootScope.currentTranslation = row.getProperty('model');
            $rootScope.currentRestaurant = row.getProperty('restaurant');
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
                    name: translation.get("restaurant").getName(),
                    model: translation,
                    restaurant: translation.get("restaurant")
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

adminControllers.controller('AdminTranslationCtrl', ['$scope', '$state', '$stateParams', 'ParseQueryAngular', 'RestaurantService', 'TranslationService', 'TranslatedDishesService',
    function($scope, $state, $stateParams, ParseQueryAngular, RestaurantService, TranslationService, TranslatedDishesService) {
        var currentUser = Parse.User.current();
        if (!currentUser) {
            console.log('not logged in');
            $state.go('login');
            return;
        }
        
        // only for debug purposes
        $scope.translationId = $stateParams.translationId;
        
        $scope.dishes = [];
        $scope.currentDish = [];
        $scope.gridOptions = { 
            data: 'dishes',
            enableCellSelection: true,
            enableCellEditOnFocus: true,
            multiSelect: false,
            selectedItems: $scope.currentDish,
            columnDefs: [
                {field: 'name', displayName: 'Name', enableCellEdit: false},
                {field: 'translation', displayName:'Translation', enableCellEdit: true},
            ],
            showColumnMenu: true,
        };
                                         
        // get the collection from our data definitions
        var dishes = new TranslatedDishesService.collection();
        var translation = new TranslationService.model();
        translation.id = $stateParams.translationId;

        dishes.loadDishesOfTranslation(translation).then(function(foundDishes) {
            $scope.dishes = _.map(foundDishes.models, function(dish) {
                return {
                    id: dish.id,
                    name: dish.get('dish').get('name'),
                    translation: dish.getName(),
                    model: dish
                };
            });
        }); 
        $scope.$on('ngGridEventEndCellEdit', function() {
            var gridSelection = $scope.currentDish[0];
            if (gridSelection.translation !== gridSelection.model.getName()) {
                gridSelection.model.setName(gridSelection.translation);
                gridSelection.model.saveParse(); // TODO check for result and display an alert if not saved
            }
        });
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

adminControllers.controller('AdminRestaurantsNewCtrl', ['$scope', '$location', '$stateParams', 'ParseQueryAngular', 'RestaurantService', 'TranslationService',
    function($scope, $location, $routeParams, ParseQueryAngular, RestaurantService, TranslationService) {
        var currentUser = Parse.User.current();
        if (!currentUser) {
            console.log('not logged in');
            $location.path('/login');
            return;
        }

        $scope.languages = [{id:'es', name:'Castellano'}, {id:'ca', name:'Català'}, {id:'en', name:'English'}, {id:'fr', name:'Française'}]; // TODO: load from server?
        $scope.dishes = _(10).times(function(n) { 
            return {name: 'Put dish name here', edited:false};
        });
        $scope.currentDish = [];
        
        $scope.gridOptions = { 
            data: 'dishes',
            enableCellSelection: true,
            enableCellEditOnFocus: true,
            multiSelect: false,
            selectedItems: $scope.currentDish,
            columnDefs: [
                {field: 'name', displayName: 'Name', enableCellEdit: true}
            ],
            showColumnMenu: true
        };

        $scope.save = function(restaurant) {
            console.log(restaurant);
            console.log('Saving new restaurant with name ' + restaurant.name);
            _.each($scope.dishes, function(dish) {
                if (dish.edited) {
                    console.log("Dish " + dish.name);
                }
            });

            var newRestaurant = new RestaurantService.model();
            newRestaurant.setName(restaurant.name);
            newRestaurant.saveParse().then(function(savedRestaurant){
                var translation = new TranslationService.model();
                translation.setLanguage(restaurant.language);    
                translation.setCompleted(true);    
                translation.setRestaurant(savedRestaurant);
                translation.saveParse();
            })

            // TODO: dishes and translated dished with initial language
        };
        
        $scope.addDishes = function() {
            _(10).times(function(n) { 
                $scope.dishes.push({name: 'Put dish name here'});
            });
        };

        $scope.$on('ngGridEventEndCellEdit', function() {
            // TODO it doesn't work
            $scope.currentDish[0].edited = true;
        });
    }
]);
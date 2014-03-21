var adminControllers = angular.module('menuweb.admin.controllers', []);

adminControllers.controller('AdminTranslationListCtrl', ['$scope', '$state', 'ParseQueryAngular', 'RestaurantService', 'TranslationService', '$rootScope', 'DishesService', 'TranslatedDishesService', 'isAuthenticated',
    function($scope, $state, ParseQueryAngular, RestaurantService, TranslationService, $rootScope, DishesService, TranslatedDishesService, isAuthenticated) {
        if (!isAuthenticated()) { return; }

        $scope.goToTranslation = function(row) {
            $rootScope.currentTranslation = row.getProperty('model');
            $rootScope.currentRestaurant = row.getProperty('restaurant');
            $state.go('.translation', {translationId: row.getProperty('id')});
            return false;
        }
        
        $scope.languages = [{id:'es', name:'Castellano'}, {id:'ca', name:'Català'}, {id:'en', name:'English'}, {id:'fr', name:'Française'}]; // TODO: load from server?

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
            $scope.foundTranslations = foundTranslations;
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
        
        // get the collection from our data definitions
        var restaurants = new RestaurantService.collection();
        restaurants.loadRestaurantsOrderedByName().then(function(foundRestaurants) {
            $scope.restaurants = foundRestaurants.models;
        });

        $('#save-modal').on('shown.bs.modal', function(e) {
            if (!$scope.translation) { return ;}
            
            var restaurant = restaurants.get($scope.translation.restaurant);
            $rootScope.progessAction = 'Getting dishes of ' + restaurant.getName();
            $rootScope.progress = 0;
            var dishesService = new DishesService.collection();

            dishesService.loadDishesOfRestaurant(restaurant).then(function(dishes) {
                var steps = 1 + _.size(dishes.models);
                var currentStep = 1;
                $rootScope.progress = (currentStep * 100) / steps;
                $scope.foundTranslations.addTranslation($scope.translation.language, restaurant, dishes,$rootScope, "#save-modal", currentStep, steps).then(function() {
                    // reload table data                    
                    $scope.translations = _.map($scope.foundTranslations.models, function(translation) {
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
            });
        });

        $scope.create = function() {
            $('#save-modal').modal('show');
        }
             
    }
]);

adminControllers.controller('AdminRestaurantsListCtrl', ['$scope', '$state', 'ParseQueryAngular', 'RestaurantService', 'isAuthenticated',
    function($scope, $state, ParseQueryAngular, RestaurantService, isAuthenticated) {
        if (!isAuthenticated()) { return; }

        console.log('getting restaurants...');
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
            console.log('foound some restaruants: ' + _.size(foundRestaurants.models));
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

adminControllers.controller('AdminTranslationCtrl', ['$scope', '$state', '$stateParams', 'ParseQueryAngular', 'RestaurantService', 'TranslationService', 'TranslatedDishesService', 'isAuthenticated',
    function($scope, $state, $stateParams, ParseQueryAngular, RestaurantService, TranslationService, TranslatedDishesService, isAuthenticated) {
        if (!isAuthenticated()) { return; }
        
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
            showColumnMenu: true
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

adminControllers.controller('AdminRestaurantCtrl', ['$scope', '$state', '$stateParams', 'ParseQueryAngular', 'RestaurantService', 'isAuthenticated',
    function($scope, $state, $routeParams, ParseQueryAngular, RestaurantService, isAuthenticated) {
        if (!isAuthenticated()) { return; }

        var restaurant = new RestaurantService.model();
        restaurant.id = $stateParams.id;
        restaurant.load().then(function(rest) {
            $scope.restaurant = rest;
        });
    }
]);

adminControllers.controller('AdminRestaurantsNewCtrl', ['$scope', '$state', '$stateParams', 'ParseQueryAngular', 'RestaurantService', 'TranslationService', 'DishesService', 'TranslatedDishesService','$rootScope', 'isAuthenticated',
    function($scope, $state, $routeParams, ParseQueryAngular, RestaurantService, TranslationService, DishesService, TranslatedDishesService, $rootScope, isAuthenticated) {
        if (!isAuthenticated()) { return; }

        $scope.progress = 0;
        $scope.languages = [{id:'es', name:'Castellano'}, {id:'ca', name:'Català'}, {id:'en', name:'English'}, {id:'fr', name:'Française'}]; // TODO: load from server?
        $scope.dishes = _(10).times(function(n) { 
            return {name: 'Put dish name here', edited:false};
        });

        $scope.gridOptions = { 
            data: 'dishes',
            enableCellSelection: true,
            enableCellEditOnFocus: true,
            enableRowSelection: false,
            multiSelect: false,
            columnDefs: [
                {field: 'name', displayName: 'Name', enableCellEdit: true}
            ],
            beforeSelectionChange: function(rowItem, event) {
                if (!rowItem.entity.edited) {
                    rowItem.entity.name = '';
                    rowItem.entity.edited = true;
                }
                return true;
            }
        };
        
        $('#save-modal').on('hidden.bs.modal', function(e) {        
            if (!$scope.restaurant) { return ;}
            $state.go('^');
        });       

        $('#save-modal').on('shown.bs.modal', function(e) {
            if (!$scope.restaurant) { return ;}
            $rootScope.progessAction = 'Creating restaurant ' + $scope.restaurant.name;
            var steps = 1 + 1 + _.size(_.filter($scope.dishes, function(dish) {return dish.edited && dish.name && dish.name != ''; }));
            var currentStep = 1;
            $rootScope.progress = (currentStep * 100) / steps;

            var newRestaurant = new RestaurantService.model();
            newRestaurant.setName($scope.restaurant.name);
            newRestaurant.saveParse().then(function(savedRestaurant){
                $rootScope.progress = (++currentStep * 100) / steps;
                $rootScope.progessAction = 'Creating translation ' + $scope.restaurant.language;

                var translation = new TranslationService.model();
                translation.setLanguage($scope.restaurant.language);    
                translation.setCompleted(true);    
                translation.setRestaurant(savedRestaurant);
                translation.saveParse().then(function(savedTranslation) {
                    // dishes and translated dished with initial language
                    _.each($scope.dishes, function(dish, index) {
                        if (dish.edited && dish.name && dish.name != '') {
                            $rootScope.progress = (++currentStep * 100) / steps;
                            $rootScope.progessAction = 'Creating dish ' + dish.name;

                            var newDish = new DishesService.model();
                            newDish.setName(dish.name);
                            newDish.setRestaurant(savedRestaurant);
                            newDish.saveParse().then(function(savedDish) {
                                var translatedDish = new TranslatedDishesService.model();
                                translatedDish.setDish(savedDish);
                                translatedDish.setTranslation(savedTranslation);
                                translatedDish.setName(savedDish.getName());
                                translatedDish.saveParse().then(function() {
                                    if(currentStep == steps) {
                                        $rootScope.progress = 100;
                                        $rootScope.progessAction = 'Created!';
                                        $('#save-modal').modal('hide');
                                    } 
                                });
                            });
                        }
                    });
                });
            })
        });       
        
        $scope.save = function(restaurant) {
            $('#save-modal').modal('show');
        };
        
        $scope.addDishes = function() {
            _(10).times(function(n) { 
                $scope.dishes.push({name: 'Put dish name here', edited: false});
            });
        };
    }
]);
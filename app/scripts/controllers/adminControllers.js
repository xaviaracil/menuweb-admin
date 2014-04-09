/* global _,$ */
var adminControllers = angular.module('menuweb.admin.controllers', []);

adminControllers.controller('AdminTranslationListCtrl', ['$scope', '$state', 'ParseQueryAngular', 'RestaurantService', 'TranslationService', '$rootScope', 'DishesService', 'TranslatedDishesService', 'isAuthenticated',
  function($scope, $state, ParseQueryAngular, RestaurantService, TranslationService, $rootScope, DishesService, TranslatedDishesService, isAuthenticated) {
    'use strict';
    if (!isAuthenticated()) { return; }

    $scope.goToTranslation = function(row) {
      $rootScope.currentTranslation = row.getProperty('model');
      $rootScope.currentRestaurant = row.getProperty('restaurant');
      $state.go('.translation', {translationId: row.getProperty('id')});
      return false;
    };

    $scope.updateData = function(foundTranslations) {
      $scope.foundTranslations = foundTranslations;
      $scope.translations = _.map(foundTranslations.models, function(translation) {
        return {
          id: translation.id,
          language: translation.getLanguage(),
          completed: translation.getCompleted(),
          name: translation.getRestaurant() ? translation.getRestaurant().getName() : 'No restaurant',
          model: translation,
          restaurant: translation.getRestaurant
        };
      });
    };

    $scope.deleteTranslation = function(row) {
      $scope.foundTranslations.removeTranslation(row.getProperty('model')).then(function(){
        $scope.updateData($scope.foundTranslations);
      });
    };

    $scope.markTranslation = function(translation, completed) {
      translation.setCompleted(completed);
      translation.saveParse().then(function() {
        $scope.updateData($scope.foundTranslations);
      });
    };

    $scope.markAsCompleted = function(row) {
      $scope.markTranslation(row.getProperty('model'), true);
    };

    $scope.markAsPending = function(row) {
      $scope.markTranslation(row.getProperty('model'), false);
    };

    $scope.languages = [{id:'es', name:'Castellano'}, {id:'ca', name:'Català'}, {id:'en', name:'English'}, {id:'fr', name:'Française'}]; // TODO: load from server?

    $scope.translations = [];
    $scope.gridOptions = {
      data: 'translations',
      columnDefs: [
        {field: 'name', displayName: 'Name', cellTemplate: '<div class="ngCellText" ng-click="goToTranslation(row)">{{row.getProperty(col.field)}}</div>'},
        {field: 'language', displayName:'Language'},
        {field: 'completed', displayName:'Completed?'},
        {displayName: 'Actions', cellTemplate: 'views/templates/translation-action-cell.html'}
      ],
      showColumnMenu: true,
      enableCellSelection: false,
      enableRowSelection: false,
      rowTemplate: 'views/templates/admin-restaurant-row.html'
    };

    // get the collection from our data definitions
    var translations = new TranslationService.collection();

    translations.loadTranslations().then(function(foundTranslations) {
      $scope.updateData(foundTranslations);
    });

    // get the collection from our data definitions
    var restaurants = new RestaurantService.collection();
    restaurants.loadRestaurantsOrderedByName().then(function(foundRestaurants) {
      $scope.restaurants = foundRestaurants.models;
    });

    $('#save-modal').on('shown.bs.modal', function() {
      if (!$scope.translation) { return ;}

      var restaurant = restaurants.get($scope.translation.restaurant);
      $rootScope.progessAction = 'Getting dishes of ' + restaurant.getName();
      $rootScope.progress = 0;

      var dishesService = new DishesService.collection();
      dishesService.loadDishesOfRestaurant(restaurant).then(function(dishes) {
        var steps = 1 + _.size(dishes.models);
        var currentStep = 1;
        $rootScope.progress = (currentStep * 100) / steps;
        $scope.foundTranslations.addTranslation($scope.translation.language, restaurant, dishes,$rootScope, '#save-modal', currentStep, steps).then(function() {
          $scope.updateData($scope.foundTranslations);
        });
      });
    });

    $scope.create = function() {
      $rootScope.progessAction = 'Preparing...';
      $rootScope.progress = 0;
      $('#save-modal').modal('show');
    };
  }
]);

adminControllers.controller('AdminRestaurantsListCtrl', ['$scope', '$state', '$rootScope', 'ParseQueryAngular', 'RestaurantService', 'isAuthenticated',
  function($scope, $state, $rootScope, ParseQueryAngular, RestaurantService, isAuthenticated) {
    'use strict';
    if (!isAuthenticated()) { return; }

    $scope.restaurants = [];
    $scope.gridOptions = {
      data: 'restaurants',
      columnDefs: [
        {field: 'name', displayName: 'Name'},
        {field: 'normalizedName', displayName:'normalizedName'},
        {field: 'completed', displayName:'Translated'},
        {displayName: 'Actions', cellTemplate: '<div class="ngCellText"><button type="button" class="btn btn-xs btn-info" ng-click="goToCategories(row)">Categories</button>&nbsp;<button type="button" class="btn btn-xs btn-info" ng-click="goToDishes(row)">Dishes</button>&nbsp;<button type="button" class="btn btn-xs btn-danger" ng-click="deleteRestaurant(row)"><span class="glyphicon glyphicon-remove-sign"></span> Delete</button></div>'}
      ],
      showColumnMenu: true,
      afterSelectionChange: $scope.onRowSelected,
      rowTemplate: 'views/templates/admin-restaurant-row.html'
    };

    // get the collection from our data definitions
    var restaurants = new RestaurantService.collection();
    restaurants.loadRestaurantsOrderedByName().then(function(foundRestaurants) {
      $scope.updateData(foundRestaurants);
    });

    $scope.updateData = function(foundRestaurants) {
      $scope.foundRestaurants = foundRestaurants;
      $scope.restaurants = _.map(foundRestaurants.models, function(restaurant) {
        return {
          id: restaurant.id,
          name: restaurant.getName(),
          normalizedName: restaurant.getNormalizedName(),
          completed: restaurant.getTranslated(),
          model: restaurant
        };
      });
    };

    $scope.deleteRestaurant = function(row) {
      restaurants.removeRestaurant(row.getProperty('model')).then(function() {
        $scope.updateData($scope.foundRestaurants);
      });
    };

    $scope.goToDishes = function(row) {
      $rootScope.currentRestaurant = row.getProperty('model');
      $state.go('.dishes', {restaurantId: row.getProperty('id')});
      return false;
    };
    
    $scope.goToCategories = function(row) {
      $rootScope.currentRestaurant = row.getProperty('model');
      $state.go('.categories', {restaurantId: row.getProperty('id')});
      return false;
    }
  }
]);

adminControllers.controller('AdminTranslationCtrl', ['$scope', '$state', '$stateParams', 'ParseQueryAngular', 'RestaurantService', 'TranslationService', 'TranslatedDishesService', 'isAuthenticated',
  function($scope, $state, $stateParams, ParseQueryAngular, RestaurantService, TranslationService, TranslatedDishesService, isAuthenticated) {
    'use strict';
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
  function($scope, $state, $stateParams, ParseQueryAngular, RestaurantService, isAuthenticated) {
    'use strict';
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
    'use strict';
    if (!isAuthenticated()) { return; }

    $scope.languages = [{id:'es', name:'Castellano'}, {id:'ca', name:'Català'}, {id:'en', name:'English'}, {id:'fr', name:'Française'}]; // TODO: load from server?
    $scope.dishes = _(10).times(function() {
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
      beforeSelectionChange: function(rowItem) {
        if (!rowItem.entity.edited) {
          rowItem.entity.name = '';
          rowItem.entity.edited = true;
        }
        return true;
      }
    };

    $('#save-modal').on('hidden.bs.modal', function() {
      if (!$scope.restaurant) { return ;}
      $state.go('^');
    });

    $('#save-modal').on('shown.bs.modal', function() {
      if (!$scope.restaurant) { return ;}
      $rootScope.progessAction = 'Creating restaurant ' + $scope.restaurant.name;
      var steps = 1 + 1 + _.size(_.filter($scope.dishes, function(dish) {return dish.edited && dish.name && dish.name !== ''; }));
      var currentStep = 1;
      $rootScope.progress = (currentStep * 100) / steps;

      var newRestaurant = new RestaurantService.model();
      newRestaurant.setName($scope.restaurant.name);
      newRestaurant.setInitialLanguage($scope.restaurant.language);
      newRestaurant.saveParse().then(function(savedRestaurant){
        $rootScope.progress = (++currentStep * 100) / steps;
        $rootScope.progessAction = 'Creating translation ' + $scope.restaurant.language;

        var translation = new TranslationService.model();
        translation.setLanguage($scope.restaurant.language);
        translation.setCompleted(true);
        translation.setRestaurant(savedRestaurant);
        translation.saveParse().then(function(savedTranslation) {
          // dishes and translated dished with initial language
          _.each($scope.dishes, function(dish) {
            if (dish.edited && dish.name && dish.name !== '') {
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
                  if(currentStep === steps) {
                    $rootScope.progress = 100;
                    $rootScope.progessAction = 'Created!';
                    $('#save-modal').modal('hide');
                  }
                });
              });
            }
          });
        });
      });
    });

    $scope.save = function() {
      $rootScope.progessAction = 'Preparing...';
      $rootScope.progress = 0;
      $('#save-modal').modal('show');
    };

    $scope.addDishes = function() {
      _(10).times(function() {
        $scope.dishes.push({name: 'Put dish name here', edited: false});
      });
    };
  }
]);

adminControllers.controller('AdminDishesListCtrl', ['$scope', '$state', '$stateParams', 'ParseQueryAngular', '$rootScope', 'DishesService', 'RestaurantService', 'TranslationService', 'isAuthenticated',
  function($scope, $state, $stateParams, ParseQueryAngular, $rootScope, DishesService, RestaurantService, TranslationService, isAuthenticated) {
    'use strict';
    if (!isAuthenticated()) { return; }

    $scope.updateData = function(foundDishes) {
      $scope.foundDishes = foundDishes;
      $scope.dishes = _.map(foundDishes.models, function(dish) {
        return {
          id: dish.id,
          name: dish.getName(),
          model: dish
        };
      });
    };

    $scope.dishes = [];
    $scope.gridOptions = {
      data: 'dishes',
      columnDefs: [
        {field: 'name', displayName: 'Name'},
        {displayName: 'Actions', cellTemplate: '<div class="ngCellText"><button type="button" class="btn btn-xs btn-danger" ng-click="deleteDish(row)"><span class="glyphicon glyphicon-remove-sign"></span> Delete</button></div>'}
      ],
      enableCellSelection: false,
      enableRowSelection: false
    };

    // get the collection from our data definitions
    var dishes = new DishesService.collection();
    var restaurant = new RestaurantService.model();
    restaurant.id = $stateParams.restaurantId;

    dishes.loadDishesOfRestaurant(restaurant).then(function(foundDishes) {
      $scope.updateData(foundDishes);
    });

    $scope.deleteDish = function(row) {
      dishes.removeDish(row.getProperty('model')).then(function() {
        $scope.updateData($scope.foundDishes);
      });
    };

    $scope.create = function() {
      $rootScope.progessAction = 'Preparing...';
      $rootScope.progress = 0;
      $('#save-modal').modal('show');
    };

    $('#save-modal').on('shown.bs.modal', function() {
      if (!$scope.dish) { return ;}

      $rootScope.progessAction = 'Getting translations of ' + $rootScope.currentRestaurant.getName();
      $rootScope.progress = 0;
      var translationService = new TranslationService.collection();
      translationService.loadTranslationsOfRestaurant($rootScope.currentRestaurant).then(function(foundTranslations) {
        var steps = 1 + _.size(foundTranslations.models);
        var currentStep = 1;
        $rootScope.progress = (currentStep * 100) / steps;
        $scope.foundDishes.addDish($scope.dish.name, $rootScope.currentRestaurant, foundTranslations, $rootScope, '#save-modal', currentStep, steps).then(function() {
          $scope.updateData($scope.foundDishes);
        });
      });
    });
  }
]);

adminControllers.controller('AdminCategoriesListCtrl', ['$scope', '$state', '$stateParams', 'ParseQueryAngular', '$rootScope', 'CategoriesService', 'RestaurantService', 'TranslationService', 'isAuthenticated',
  function($scope, $state, $stateParams, ParseQueryAngular, $rootScope, CategoriesService, RestaurantService, TranslationService, isAuthenticated) {
    'use strict';
    if (!isAuthenticated()) { return; }

    $scope.updateData = function(foundCategories) {
      $scope.foundCategories = foundCategories;
      $scope.categories = _.map(foundCategories.models, function(category) {
        return {
          id: category.id,
          name: category.getName(),
          model: category
        };
      });
    };

    $scope.categories = [];
    $scope.gridOptions = {
      data: 'categories',
      columnDefs: [
        {field: 'name', displayName: 'Name'},
        {displayName: 'Actions', cellTemplate: '<div class="ngCellText"><button type="button" class="btn btn-xs btn-danger" ng-click="deleteCategory(row)"><span class="glyphicon glyphicon-remove-sign"></span> Delete</button></div>'}
      ],
      enableCellSelection: false,
      enableRowSelection: false
    };

    // get the collection from our data definitions
    var categories = new CategoriesService.collection();
    var restaurant = new RestaurantService.model();
    restaurant.id = $stateParams.restaurantId;

    categories.loadCategoriesOfRestaurant(restaurant).then(function(foundCategories) {
      $scope.updateData(foundCategories);
    });

    $scope.deleteCategory = function(row) {
      categories.removeCategory(row.getProperty('model')).then(function() {
        $scope.updateData($scope.foundCategories);
      });
    };

    $scope.create = function() {
      $rootScope.progessAction = 'Preparing...';
      $rootScope.progress = 0;
      $('#save-modal').modal('show');
    };

    $('#save-modal').on('shown.bs.modal', function() {
      if (!$scope.category) { return ;}

      $rootScope.progessAction = 'Getting translations of ' + $rootScope.currentRestaurant.getName();
      $rootScope.progress = 0;
      var translationService = new TranslationService.collection();
      translationService.loadTranslationsOfRestaurant($rootScope.currentRestaurant).then(function(foundTranslations) {
        var steps = 1 + _.size(foundTranslations.models);
        var currentStep = 1;
        $rootScope.progress = (currentStep * 100) / steps;
        $scope.foundCategories.addCategory($scope.category.name, $rootScope.currentRestaurant, foundTranslations, $rootScope, '#save-modal', currentStep, steps).then(function() {
          $scope.updateData($scope.foundCategories);
        });
      });
    });
  }
]);
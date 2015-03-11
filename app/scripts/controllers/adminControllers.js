/* global _,$,Parse */
var adminControllers = angular.module('menuweb.admin.controllers', []);

adminControllers.controller('AdminTranslationListCtrl', ['$scope', '$state', 'ParseQueryAngular', 'RestaurantService', 'TranslationService', '$rootScope', 'DishesService', 'TranslatedDishesService', 'isAuthenticated',
  function($scope, $state, ParseQueryAngular, RestaurantService, TranslationService, $rootScope, DishesService, TranslatedDishesService, isAuthenticated) {
    'use strict';
    if (!isAuthenticated()) { return; }

    $scope.goToDishes = function(row) {
      $rootScope.currentTranslation = row.getProperty('model');
      $rootScope.currentRestaurant = row.getProperty('restaurant');
      $state.go('.translation', {translationId: row.getProperty('id')});
      return false;
    };

    $scope.goToCategories = function(row) {
      $rootScope.currentTranslation = row.getProperty('model');
      $rootScope.currentRestaurant = row.getProperty('restaurant');
      $state.go('.translation.categories', {translationId: row.getProperty('id')});
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
          restaurant: translation.getRestaurant()
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

    Parse.Cloud.run('languages', null, {
      success: function(languages) {
        $scope.languages = languages;
      }
    });

    $scope.translations = [];
    $scope.gridOptions = {
      data: 'translations',
      columnDefs: [
        {field: 'name', displayName: 'Name'},
        {field: 'language', displayName:'Language', width:'10%'},
        {field: 'completed', displayName:'Completed?', width:'10%'},
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

    $('#save-modal').off('hidden.bs.modal');
    $('#save-modal').off('shown.bs.modal');
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

    Parse.Cloud.run('priceranges', null, {
      success: function(priceranges) {
        $scope.priceranges = priceranges;
      }
    });

    $scope.restaurants = [];
    $scope.gridOptions = {
      data: 'restaurants',
      columnDefs: [
        {field: 'name', displayName: 'Name'},
        {field: 'address', displayName:'Address'},
        {field: 'qr', displayName:'QR Code', width: '5%', cellTemplate: '<div class="ngCellText"><button data-target="#restaurantModal" type="button" class="btn btn-xs btn-link" ng-click="showQR(row)" data-toggle="modal"><span class="glyphicon glyphicon-qrcode"></span></button></div>'},
        {field: 'priceRange', displayName:'Price Range', width:'10%'},
        {field: 'completed', displayName:'Translated', width:'10%'},
        {displayName: 'Actions', cellTemplate: '<div class="ngCellText"><button type="button" class="btn btn-xs btn-info" ng-click="goToCategories(row)">Categories</button>&nbsp;<button type="button" class="btn btn-xs btn-info" ng-click="goToDishesCategories(row)">Dishes Categories</button>&nbsp;<button type="button" class="btn btn-xs btn-info" ng-click="goToDishes(row)">Dishes</button>&nbsp;<button type="button" class="btn btn-xs btn-danger" ng-click="deleteRestaurant(row)"><span class="glyphicon glyphicon-remove-sign"></span> Delete</button></div>'}
      ],
      showColumnMenu: true,
      //afterSelectionChange: $scope.onRowSelected,
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
          address: restaurant.getAddress(),
          priceRange: restaurant.getPriceRange(),
          completed: restaurant.getTranslated(),
          model: restaurant,
          url: 'http://menu-web.laibeth.com/#/restaurants/' + restaurant.id
        };
      });
    };

    $rootScope.selectedRestaurant = {
      name: '',
      url: ''
    };
    $scope.showQR = function(row) {
      $rootScope.selectedRestaurant = {
        name: row.getProperty('name'),
        url: row.getProperty('url')
      };
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

    $scope.goToDishesCategories = function(row) {
      $rootScope.currentRestaurant = row.getProperty('model');
      $state.go('.categories', {restaurantId: row.getProperty('id')});
      return false;
    };
    $scope.goToCategories = function(row) {
      $rootScope.currentRestaurant = row.getProperty('model');
      $state.go('.general', {restaurantId: row.getProperty('id')});
      return false;
    };
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
        {field: 'description', displayName:'Description', enableCellEdit: false},
        {field: 'translatedDescription', displayName:'Translation', enableCellEdit: true},
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
          description: dish.get('dish').get('description'),
          translatedDescription: dish.getDescription(),
          model: dish
        };
      });
    });

    $scope.$on('ngGridEventEndCellEdit', function() {
      var gridSelection = $scope.currentDish[0];
      console.log(gridSelection, gridSelection.translation, gridSelection.model.getName(), gridSelection.translatedDescription, gridSelection.model.getDescription());
      var dirty = false;
      if (gridSelection.translation !== gridSelection.model.getName()) {
        gridSelection.model.setName(gridSelection.translation);
        dirty = true;
      }
      if (gridSelection.translatedDescription !== gridSelection.model.getDescription()) {
        gridSelection.model.setDescription(gridSelection.translatedDescription);
        dirty = true;
      }
      if (dirty) {
        console.log('saving...');
        gridSelection.model.saveParse(); // TODO check for result and display an alert if not saved
      }
    });
  }
]);

adminControllers.controller('AdminTranslationCategoriesCtrl', ['$scope', '$state', '$stateParams', 'ParseQueryAngular', 'RestaurantService', 'TranslationService', 'TranslatedCategoriesService', 'isAuthenticated',
  function($scope, $state, $stateParams, ParseQueryAngular, RestaurantService, TranslationService, TranslatedCategoriesService, isAuthenticated) {
    'use strict';
    if (!isAuthenticated()) { return; }

    $scope.categories = [];
    $scope.currentCategory = [];
    $scope.gridOptions = {
      data: 'categories',
      enableCellSelection: true,
      enableCellEditOnFocus: true,
      multiSelect: false,
      selectedItems: $scope.currentCategory,
      columnDefs: [
        {field: 'name', displayName: 'Name', enableCellEdit: false},
        {field: 'translation', displayName:'Translation', enableCellEdit: true},
      ],
      showColumnMenu: true
    };

    // get the collection from our data definitions
    var categories = new TranslatedCategoriesService.collection();
    var translation = new TranslationService.model();
    translation.id = $stateParams.translationId;

    categories.loadCategoriesOfTranslation(translation).then(function(foundCategories) {
      $scope.categories = _.map(foundCategories.models, function(category) {
        return {
          id: category.id,
          name: category.getCategory().get('name'),
          translation: category.getName(),
          model: category
        };
      });
    });

    $scope.$on('ngGridEventEndCellEdit', function() {
      var gridSelection = $scope.currentCategory[0];
      console.log(gridSelection);
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

    Parse.Cloud.run('languages', null, {
      success: function(languages) {
        $scope.languages = languages;
      }
    });

    Parse.Cloud.run('priceranges', null, {
      success: function(priceranges) {
        $scope.priceranges = priceranges;
      }
    });

    // init values
    $scope.restaurant = {};
    $scope.dishes = _(10).times(function() {
      return {name: 'Put dish name here', edited:false};
    });

    $scope.map = {
      center: {
        latitude: 41.39,
        longitude: 2.17
      },
      zoom: 13,
      clickedMarker: {
        title: 'Restaurant position',
        latitude: null,
        longitude: null
      },
      events: {
        click: function(mapModel, eventName, originalEventArgs) {
          var e = originalEventArgs[0];

          if (!$scope.map.clickedMarker) {
            $scope.map.clickedMarker = {
              title: 'You clicked here',
              latitude: e.latLng.lat(),
              longitude: e.latLng.lng()
            };
          } else {
            $scope.map.clickedMarker.latitude = e.latLng.lat();
            $scope.map.clickedMarker.longitude = e.latLng.lng();
          }

          $scope.$apply();
        }
      }
    };

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

    $('#save-modal').off('hidden.bs.modal');
    $('#save-modal').off('shown.bs.modal');
    $('#save-modal').on('hidden.bs.modal', function() {
      if (!$scope.restaurant) { return ;}
      $state.go('^');
    });

    $('#save-modal').on('shown.bs.modal', function() {
      if (!$scope.restaurant) {
        $rootScope.progessAction = 'Data Required';
        $scope.currentError = 'Data Required';
        return;
      }
      if (!$scope.map.clickedMarker || !$scope.map.clickedMarker.latitude) {
        $rootScope.progessAction = 'Location Required';
        $scope.currentError = 'Location Required';
        return;
      }
      $rootScope.progessAction = 'Creating restaurant ' + $scope.restaurant.name;
      var steps = 1 + 1 + _.size(_.filter($scope.dishes, function(dish) {return dish.edited && dish.name && dish.name !== ''; }));
      var currentStep = 1;
      $rootScope.progress = (currentStep * 100) / steps;

      var newRestaurant = new RestaurantService.model();
      newRestaurant.setName($scope.restaurant.name);
      newRestaurant.setDescription($scope.restaurant.description);
      newRestaurant.setInitialLanguage($scope.restaurant.language);
      newRestaurant.setAddress($scope.restaurant.address);
      newRestaurant.setPostalCode($scope.restaurant.postalCode);
      newRestaurant.setCity($scope.restaurant.city);
      newRestaurant.setState($scope.restaurant.state);
      newRestaurant.setLocation(new Parse.GeoPoint({
        latitude: $scope.map.clickedMarker.latitude,
        longitude: $scope.map.clickedMarker.longitude
      }));
      newRestaurant.setPriceRange($scope.restaurant.pricerange);
      if ($scope.restaurant.logoFile) {
        newRestaurant.setLogoFile($scope.restaurant.logoFile);
      }
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

      var fileUploadControl = $('#logoFile')[0];
      if (fileUploadControl.files.length > 0) {
        var file = fileUploadControl.files[0];
        var parseFile = new Parse.File(file.name, file, file.type);
        parseFile.save().then(function(savedFile) {
          // The file has been saved to Parse.
          $scope.restaurant.logoFile = savedFile;
          $('#save-modal').modal('show');

        }, function(error) {
          // The file either could not be read, or could not be saved to Parse.
          $rootScope.progessAction = 'Got an error saving file: ' + error.code + ' - ' + error.message;
        });
      } else {
        $('#save-modal').modal('show');
      }
    };

    $scope.addDishes = function() {
      _(10).times(function() {
        $scope.dishes.push({name: 'Put dish name here', edited: false});
      });
    };
  }
]);

adminControllers.controller('AdminDishesListCtrl', ['$scope', '$state', '$stateParams', 'ParseQueryAngular', '$rootScope', 'DishesService', 'RestaurantService', 'TranslationService', 'CategoriesService', 'isAuthenticated',
  function($scope, $state, $stateParams, ParseQueryAngular, $rootScope, DishesService, RestaurantService, TranslationService, CategoriesService, isAuthenticated) {
    'use strict';
    if (!isAuthenticated()) { return; }

    $scope.updateData = function(foundDishes) {
      $scope.foundDishes = foundDishes;
      $scope.dishes = _.map(foundDishes.models, function(dish) {
        return {
          id: dish.id,
          name: dish.getName(),
          description: dish.getDescription(),
          price: dish.getPrice(),
          category: dish.get('category') ? dish.get('category').get('name') : 'Uncategorized',
          model: dish
        };
      });
    };

    $scope.dishes = [];
    $scope.gridOptions = {
      data: 'dishes',
      columnDefs: [
        {field: 'name', displayName: 'Name'},
        {field: 'description', displayName: 'Description'},
        {field: 'price', displayName: 'Price'},
        {field: 'category', displayName: 'Category'},
        {displayName: 'Actions', cellTemplate: '<div class="ngCellText"><button type="button" class="btn btn-xs btn-danger" ng-click="deleteDish(row)"><span class="glyphicon glyphicon-remove-sign"></span> Delete</button></div>', width:'10%'}
      ],
      enableCellSelection: false,
      enableRowSelection: false
    };

    // get the collection from our data definitions
    var dishes = new DishesService.collection();
    var categories = new CategoriesService.collection();
    var restaurant = new RestaurantService.model();
    restaurant.id = $stateParams.restaurantId;

    dishes.loadDishesOfRestaurant(restaurant).then(function(foundDishes) {
      $scope.updateData(foundDishes);
    });

    categories.loadCategoriesOfRestaurant(restaurant).then(function(foundCategories) {
      $scope.categories =  _.map(foundCategories.models, function(category) {
        return {
          id: category.id,
          name: category.getName(),
          model: category
        };
      });
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

    $('#save-modal').off('hidden.bs.modal');
    $('#save-modal').off('shown.bs.modal');
    $('#save-modal').on('shown.bs.modal', function() {
      if (!$scope.dish) { return ;}
      console.log($scope.dish);
      var category = null;
      if ($scope.dish.category) {
        category = new CategoriesService.model();
        category.id = $scope.dish.category;
      }
      $rootScope.progessAction = 'Getting translations of ' + $rootScope.currentRestaurant.getName();
      $rootScope.progress = 0;
      var translationService = new TranslationService.collection();
      translationService.loadTranslationsOfRestaurant($rootScope.currentRestaurant).then(function(foundTranslations) {
        var steps = 1 + _.size(foundTranslations.models);
        var currentStep = 1;
        $rootScope.progress = (currentStep * 100) / steps;
        $scope.foundDishes.addDish($scope.dish.name, $scope.dish.description, $scope.dish.price, $rootScope.currentRestaurant, category, foundTranslations, $rootScope, '#save-modal', currentStep, steps).then(function() {
          $scope.updateData($scope.foundDishes);
        });
      });
    });
  }
]);

adminControllers.controller('AdminRestaurantCategoriesListCtrl', ['$scope', '$state', '$stateParams', 'ParseQueryAngular', '$rootScope', 'CategoriesService', 'RestaurantService', 'TranslationService', 'isAuthenticated',
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

    $('#save-modal').off('hidden.bs.modal');
    $('#save-modal').off('shown.bs.modal');
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

adminControllers.controller('AdminRestaurantGeneralCategoriesListCtrl', ['$scope', '$rootScope', 'ParseQueryAngular', 'CategoriesService', 'RestaurantService', 'isAuthenticated',
  function($scope, $rootScope, ParseQueryAngular, CategoriesService, RestaurantService, isAuthenticated) {
    'use strict';
    if (!isAuthenticated()) { return; }

    $scope.updateData = function(restaurant) {
      $scope.categories = _.map(restaurant.get('generalCategories'), function(category) {
        return {
          id: category.id,
          name: categories.get(category) ? categories.get(category).get('name') : 'Undefined',
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
    categories.loadGeneralCategories().then(function(foundCategories) {
      $scope.generalCategories = foundCategories.models;
      $scope.updateData($rootScope.currentRestaurant);
    });

    $scope.deleteCategory = function(row) {
      $rootScope.currentRestaurant.remove('generalCategories', row.getProperty('model'));
      $rootScope.currentRestaurant.saveParse().then(function() {
        $scope.updateData($rootScope.currentRestaurant);
      });
    };

    $scope.create = function() {
      if (!$scope.category) { return ;}
      $rootScope.currentRestaurant.addUnique('generalCategories', categories.get($scope.category.id));
      $rootScope.currentRestaurant.saveParse().then(function() {
        $scope.updateData($rootScope.currentRestaurant);
      });
    };
  }
]);

adminControllers.controller('AdminCategoriesListCtrl', ['$scope','$state', '$rootScope', 'ParseQueryAngular', 'CategoriesService', 'isAuthenticated',
  function($scope, $state, $rootScope, ParseQueryAngular, CategoriesService, isAuthenticated) {
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

    $scope.gridOptions = {
      data: 'categories',
      columnDefs: [
        {field: 'name', displayName: 'Name'},
        {displayName: 'Actions', cellTemplate: '<div class="ngCellText"><button type="button" class="btn btn-xs btn-info" ng-click="goToTranslations(row)">Translations</button>&nbsp;<button type="button" class="btn btn-xs btn-danger" ng-click="deleteCategory(row)"><span class="glyphicon glyphicon-remove-sign"></span> Delete</button></div>'}
      ],
      enableCellSelection: false,
      enableRowSelection: false
    };

    // get the collection from our data definitions
    var categories = new CategoriesService.collection();

    categories.loadGeneralCategories().then(function(foundCategories) {
      $scope.updateData(foundCategories);
    });

    $scope.deleteCategory = function(row) {
      categories.removeCategory(row.getProperty('model')).then(function() {
        $scope.updateData($scope.foundCategories);
      });
    };

    $scope.goToTranslations = function(row) {
      $rootScope.currentCategory = row.getProperty('model');
      console.log($rootScope.currentCategory);
      $state.go('.translations', {categoryId: row.getProperty('id')});
      return false;
    };

    $scope.create = function() {
      if (!$scope.category) { return ;}

      $scope.foundCategories.addGeneralCategory($scope.category.name).then(function() {
        $scope.updateData($scope.foundCategories);
      });
    };
  }
]);

adminControllers.controller('AdminCategoryTranslationListCtrl', ['$scope', '$state', '$stateParams', 'ParseQueryAngular', 'CategoriesService', 'TranslatedCategoriesService', 'isAuthenticated',
  function($scope, $state, $stateParams, ParseQueryAngular, CategoriesService, TranslatedCategoriesService, isAuthenticated) {
    'use strict';
    if (!isAuthenticated()) { return; }

    $scope.categories = [];
    $scope.currentCategory = [];
    $scope.gridOptions = {
      data: 'categories',
      enableCellSelection: true,
      enableCellEditOnFocus: true,
      multiSelect: false,
      selectedItems: $scope.currentCategory,
      columnDefs: [
        {field: 'language', displayName:'Language', enableCellEdit: false},
        {field: 'name', displayName: 'Name', enableCellEdit: true},
        {displayName: 'Actions', enableCellEdit: false, cellTemplate: '<div class="ngCellText"><button type="button" class="btn btn-xs btn-danger" ng-click="deleteCategory(row)"><span class="glyphicon glyphicon-remove-sign"></span> Delete</button></div>'}
      ],
      showColumnMenu: true
    };

    Parse.Cloud.run('languages', null, {
      success: function(languages) {
        $scope.languages = languages;
      }
    });

    // get the collection from our data definitions
    var categories = new TranslatedCategoriesService.collection();
    var category = new CategoriesService.model();
    category.id = $stateParams.categoryId;

    categories.loadTranslationsOfCategory(category).then(function(foundCategories) {
      $scope.updateData(foundCategories);
    });

    $scope.$on('ngGridEventEndCellEdit', function() {
      var gridSelection = $scope.currentCategory[0];
      if (gridSelection.name !== gridSelection.model.getName()) {
        gridSelection.model.setName(gridSelection.name);
        gridSelection.model.saveParse(); // TODO check for result and display an alert if not saved
      }
    });

    $scope.updateData = function(foundCategories) {
      $scope.foundCategories = foundCategories;
      $scope.categories = _.map(foundCategories.models, function(category) {
        return {
          id: category.id,
          name: category.getName(),
          language: category.getLanguage(),
          model: category
        };
      });
    };

    $scope.create = function() {
      if (!$scope.translation) { return ;}

      $scope.foundCategories.addGeneralCategory(category, $scope.translation.language, $scope.translation.name).then(function() {
        $scope.updateData($scope.foundCategories);
      });

    };

    $scope.deleteCategory = function(row) {
      $scope.foundCategories.removeCategory(row.getProperty('model')).then(function() {
        $scope.updateData($scope.foundCategories);
      });
    };
  }
]);

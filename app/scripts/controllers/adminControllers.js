var adminControllers = angular.module('menuweb.admin.controllers', []);

adminControllers.controller('AdminCtrl', ['$scope', '$location', 'ParseQueryAngular', 'RestaurantService',
    function($scope, $location, ParseQueryAngular, RestaurantService) {
        var currentUser = Parse.User.current();
        if (!currentUser) {
            console.log('not logged in');
            $location.path('/login');
            return;
        }

        $scope.restaurants = [];
        $scope.gridOptions = { 
            data: 'restaurants',
            columnDefs: [
                {field: 'name', displayName: 'Name'},
                {field: 'translations', displayName:'Translations'},
                {field: 'completed', displayName:'Completed?'},                
            ],
            rowTemplate: 'views/admin-restaurant-row.html'
        };
                     
        // get the collection from our data definitions
        var restaurants = new RestaurantService.collection();
        
        // use the extended Parse SDK to load the whole collection
        restaurants.loadRestaurantsOrderedByName().then(function(foundRestaurants) {
            $scope.awesomeThings = _.map(foundRestaurants.models, function(rest) {
                return rest.getName();
            });
            $scope.restaurants = _.map(foundRestaurants.models, function(rest) {
                return {
                    id: rest.id,
                    name: rest.getName(), 
                    translations: rest.getTranslationNumber(), 
                    completed: rest.getTranslated()
                };
            });
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
var adminControllers = angular.module('adminControllers', []);

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
        var restaurantsPromise = currentUser.getUsername() === 'traduccions' ? restaurants.loadPendingRestaurants() : restaurants.loadRestaurantsOrderedByName();
        
        // use the extended Parse SDK to load the whole collection
        restaurantsPromise.then(function(foundRestaurants) {
            $scope.awesomeThings = _.map(restaurants.models, function(rest) {
                return rest.getName();
            });
            $scope.restaurants = _.map(restaurants.models, function(rest) {
                return {
                    name: rest.getName(), 
                    translations: rest.getTranslationNumber(), 
                    completed: rest.getTranslated()
                };
            });
        });        
    }
]);
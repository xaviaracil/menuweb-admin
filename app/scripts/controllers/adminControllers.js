var adminControllers = angular.module('adminControllers', []);

adminControllers.controller('AdminCtrl', ['$scope', '$location', 'ParseQueryAngular', 'RestaurantService',
    function($scope, $location, ParseQueryAngular, RestaurantService) {
        var currentUser = Parse.User.current();
        if (!currentUser) {
            console.log('not logged in');
            $location.path('/login');
            return;
        }

        // get the collection from our data definitions
        var restaurants = new RestaurantService.collection();

        // use the extended Parse SDK to load the whole collection
        restaurants.load().then(function(foundRestaurants) {
            $scope.awesomeThings = _.map(restaurants.models, function(rest) {
                return rest.getName();
            });
        });
    }
]);
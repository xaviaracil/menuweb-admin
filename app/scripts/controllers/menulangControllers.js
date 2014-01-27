var menulangControllers = angular.module('menulangControllers', []);

menulangControllers.controller('RestaurantListCtrl', ['$scope', 'RestaurantService', 'restaurants', 
    function($scope, RestaurantService, restaurants) {
        $scope.restaurants = restaurants;
    }
]);
var menulangControllers = angular.module('menulangControllers', []);

menulangControllers.controller('RestaurantListCtrl', ['$scope', 'RestaurantService', 'restaurants',
    function($scope, RestaurantService, restaurants) {
        $scope.restaurants = restaurants;

        // initial map
        $scope.map = {
            center: {
                latitude: 41,
                longitude: 2
            },
            zoom: 8,
            markers: _.map(restaurants.models, function(rest) {
                return {
                    latitude: rest.getLocation().latitude,
                    longitude: rest.getLocation().longitude,
                    title: rest.getName(),
                    icon: "images/pin.png"
                }
            }),
            doCluster: true,
            clusterOptions: {
                title: 'More restaurants here',
                gridSize: 60,
                ignoreHidden: true,
                minimumClusterSize: 2,
                imageExtension: 'png',
                imagePath: 'images/pin',
                imageSizes: [72]
            }
        };
                
        // HTML5 geolocation
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                $scope.map.center = position.coords;
                $scope.map.zoom = 15;
                // TODO: reload restaurants from location
                $scope.$apply();
            });
        } 
        
        _.each($scope.map.markers, function (marker) {
            marker.closeClick = function () {
                marker.showWindow = false;
                $scope.$apply();
            };
            marker.onClicked = function () {
                marker.showWindow = true;
            };
        });        
    }
]);

menulangControllers.controller('RestaurantDetailsCtrl', ['$scope', 'RestaurantService', 'restaurant',
    function($scope, RestaurantService, restaurant) {
        $scope.restaurant = restaurant;
    }
]);
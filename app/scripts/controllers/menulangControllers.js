var menulangControllers = angular.module('menulangControllers', []);

menulangControllers.controller('RestaurantListCtrl', ['$scope', '$ionicLoading', 'RestaurantService',
    function($scope, $ionicLoading, RestaurantService) {
        
        $scope.rightButtons = [
            {
                type: 'button-clear',
                content: '<i class="icon ion-gear-a"></i>',
                tap: function(e) {
                    $scope.sideMenuController.toggleRight();
                }
            }
        ];

        // Show the loading overlay and text
        $scope.loading = $ionicLoading.show({
    
          // The text to display in the loading indicator
          content: 'Loading',
    
          // The animation to use
          animation: 'fade-in',
    
          // Will a dark overlay or backdrop cover the entire view
          showBackdrop: true,
    
          // The maximum width of the loading indicator
          // Text will be wrapped if longer than maxWidth
          maxWidth: 200,
    
          // The delay in showing the indicator
          showDelay: 500
        });
            
        // get the collection from our data definitions
        var restaurants = new RestaurantService.collection();
        var initialMarkers = [];

        // use the extended Parse SDK to load the whole collection
        restaurants.load().then(function(foundRestaurants) {
            $scope.restaurants = restaurants;
            initialMarkers = _.map(restaurants.models, function(rest) {
                return {
                    latitude: rest.getLocation().latitude,
                    longitude: rest.getLocation().longitude,
                    title: rest.getName(),
                    id: rest.id,
                    translationNumber: rest.getTranslationNumber(),
                    icon: "images/pin.png"
                }
            });
            $scope.map.markers = initialMarkers;
            $scope.loading.hide();
        });


        // initial map
        $scope.map = {
            center: {
                latitude: 41,
                longitude: 2
            },
            zoom: 8,
            markers: initialMarkers,
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
                // load translations
            };
        });    
        
        // event handlers
        $scope.find = function(text) {
            $scope.query = text;
            var foundRestaurantsPromise = restaurants.loadRestaurantsWithName(text);
            // update markers
            foundRestaurantsPromise.then(function(foundRestaurants) {
                $scope.map.markers = _.map(foundRestaurants.models, function(rest) {
                    return {
                        latitude: rest.getLocation().latitude,
                        longitude: rest.getLocation().longitude,
                        title: rest.getName(),
                        translationNumber: rest.getTranslationNumber(),
                        icon: "images/pin.png"
                    }
                });
            })            
        };
        
        $scope.resetQuery = function() {
            $scope.query = null;
            $scope.map.markers = initialMarkers;
        };    
    }
]);
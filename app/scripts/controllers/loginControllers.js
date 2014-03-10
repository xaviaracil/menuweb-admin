var loginControllers = angular.module('menuweb.login.controllers', []);

loginControllers.controller('LoginCtrl', ['$scope', '$location', 'ParseQueryAngular',
    function($scope, $location, ParseQueryAngular) {
        $scope.credentials =  {
            name: null,
            password: null
        };
        
        $scope.login = function(credentials) {
            ParseQueryAngular(Parse.User, {functionToCall:"logIn", params:[credentials.name, credentials.password]}).then(function(user) {
                console.log('seems to be loged in');
                $location.path('/dashboard');
            }, function(user, error) {
                $scope.errorMsg = error || 'Invalid login. Please try again';
            });
        }
    }
]);
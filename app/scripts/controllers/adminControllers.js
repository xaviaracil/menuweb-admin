var adminControllers = angular.module('adminControllers', []);

adminControllers.controller('AdminCtrl', ['$scope',
    function($scope) {
        $scope.awesomeThings = ['one', 'two', 'three'];
    }
]);
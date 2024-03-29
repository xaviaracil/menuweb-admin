/* global Parse*/
var loginControllers = angular.module('menuweb.login.controllers', []);

loginControllers.controller('LoginCtrl', ['$scope', '$state', 'ParseQueryAngular', '$rootScope',
  function($scope, $state, ParseQueryAngular, $rootScope) {
    'use strict';
    $scope.credentials =  {
      name: null,
      password: null
    };

    $scope.login = function(credentials) {
      ParseQueryAngular(Parse.User, {functionToCall:'logIn', params:[credentials.name, credentials.password]}).then(function(user) { // jshint ignore:line
        $rootScope.userName = user.getUsername();
        $state.go('dashboard');
      }, function(user, error) {
        $scope.errorMsg = error || 'Invalid login. Please try again';
      });
    };
  }
]);

loginControllers.controller('LogoutCtrl', ['$scope', '$state', 'ParseQueryAngular', '$rootScope',
  function($scope, $state, ParseQueryAngular, $rootScope) {
    'use strict';
    Parse.User.logOut();
    $rootScope.userName = '';
    $state.go('login');
  }
]);

loginControllers.factory('isAuthenticated', ['ParseQueryAngular', '$state', '$rootScope',
  function(ParseQueryAngular, $state, $rootScope) {
    'use strict';
    return function() {
      var currentUser = Parse.User.current();
      if (!currentUser) {
        $state.go('login');
        return false;
      } else {
        $rootScope.userName = currentUser.getUsername();
        return true;
      }
    };
  }
]);
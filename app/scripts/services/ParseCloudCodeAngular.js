/* global Parse */
angular.module('ParseServices')

.factory('ParseCloudCodeAngular',['$q','$timeout','ParseQueryAngular',function ($q, $timeout, ParseQueryAngular) {
	'use strict';
	return function(name,params) {
		return ParseQueryAngular(Parse.Cloud,{functionToCall:'run',params:[name,params]});
	};
}]);

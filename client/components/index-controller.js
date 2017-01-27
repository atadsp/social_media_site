(function(window, angular, undefined) {
	angular.module('app')
		.controller('indexCtrl', ['$scope', '$state', '$http', 'userSvc', function($scope, $state, $http, userSvc) {
			$scope.username = userSvc.user;
			$scope.isLoggedin = function() {
				if(userSvc.token){
					return true;
				} else {
					return false;
				}
			};
		}]);
})(window, window.angular);
(function(window, angular, undefined) {
	angular.module('app')
		.controller('loginCtrl', ['$scope', '$state', '$http', 'userSvc', function($scope, $state, $http, userSvc) {
			$scope.logUserIn = function(user) {
				$http.post('/api/user/login', user)
					.then(function(response) {
						userSvc.token = response.data.token;
						userSvc.user = response.data.user.username;

						localStorage.setItem('token', JSON.stringify(userSvc.token));
						localStorage.setItem('user', JSON.stringify(userSvc.user));
						$state.go('feed');
					}, function(err) {
						console.error(err);
						if (Array.isArray(err.data)) {
							$('#password_Error').empty();
							$('#login_error').empty();
							for (var i = 0; i < err.data.length; i++) {
								$('#login_error').append('<p class="alert alert-danger">' + err.data[i] + "<p>");
							}
						} else {
							$('#password_Error').empty();
							$('#login_error').empty();
							$('#login_error').append('<p class="alert alert-danger">' + err.data + "<p>");
						}

					});
			};
		}]);
})(window, window.angular);
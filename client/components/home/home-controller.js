(function(window, angular, undefined) {
	angular.module('app')
		.controller('homeCtrl', ['$scope', '$http', function($scope, $http) {
			$scope.createUser = function(user) {
				$('#password_Error').empty();
				$('#login_error').empty();
				$http.post('/api/user/create', user)
					.then(function(response) {
						$('#password_Error').empty();
						$('#login_error').empty();
						console.log(response);
					}, function(err) {
						console.error(err);
						if (Array.isArray(err.data)) {
							$('#password_Error').empty();
							$('#login_error').empty();
							for (var i = 0; i < err.data.length; i++) {
								$('#password_Error').append('<p class="alert alert-danger">' + err.data[i] + "<p>");
							}
						} else {
							$('#password_Error').empty();
							$('#login_error').empty();
							$('#password_Error').append('<p class="alert alert-danger">' + err.data + "<p>");
						}
					});
			};
			$scope.logUserIn = function(user) {
				$('#password_Error').empty();
				$('#login_error').empty();
				$http.post('/api/user/login', user)
					.then(function(response) {
						$('#password_Error').empty();
						$('#login_error').empty();
						console.log(response);
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
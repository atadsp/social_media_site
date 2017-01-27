(function(window, angular, undefined) {
	angular.module('app')
		.controller('feedCtrl', ['$scope', '$state', '$http', 'userSvc', function($scope, $state, $http, userSvc) {
			$scope.userData = userSvc.user;
			$scope.userFriends = [];
			$scope.users = [];
			$scope.allPosts = [];
			$scope.newPost = "";
			var config = {
				headers: {
					'auth-token': userSvc.token
				}
			};

			//Global Functions
			$scope.addUser = function(userID) {
				var requestData = {
					'receiver_id': userID
				};

				$http.post('/secure-api/user/request_friend', requestData, config)
					.then(function(reponse) {
						console.log('Friend Request Sent!');
					}, function(err) {
						console.error(err);
					});
			};

			$scope.respondToRequest = function(requestId, confirmation) {
				var requestData = {
					'request_id': requestId,
					'confirmation': confirmation
				};
				$http.post('/secure-api/user/request_friend_response', requestData, config).then(function(response) {
					console.log('User Added to Friends');
				}, function(err) {
					console.log(err);
				});
			};

			$scope.submitPost = function(content) {
				console.log('hello');
				requestData = {
					content: content
				};
				$http.post('/secure-api/post/create_post', requestData, config)
					.then(function(response) {
						$scope.newPost = "";
						console.log("Post Submitted");
					}, function(err) {
						console.log(err);
					});
			};

			$http.get('/secure-api/post/get_posts', config).then(function(response){
				$scope.allPosts = response.data.data;
			}, function(err){
				console.log(err);
			});

			// get friend requests
			$http.get('/secure-api/user/get_friend_requests', config)
				.then(function(response) {
					$scope.friendRequests = response.data.data;
				}, function(err) {
					console.log(err);
				});


			//gets friends
			$http({
				method: "GET",
				url: "/secure-api/user/get_friends",
				headers: {
					'auth-token': userSvc.token
				}
			}).then(function(response) {
				$scope.userFriends = response.data.data;
			}, function(err) {
				console.log(err);
			});

			//gets users
			$http({
				method: "GET",
				url: "/secure-api/user/get_users_by_quantity",
				headers: {
					'auth-token': userSvc.token
				}
			}).then(function(response) {
				$scope.users = response.data.data;
			}, function(err) {
				console.log(err);
			});

		}]);
})(window, window.angular);
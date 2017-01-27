(function(window, angular, undefined) {
    angular.module('app', ['ui.router'])
        .config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
            $stateProvider
                .state('index', {
                    url: '',
                    templateUrl: '/client/index.html',
                    controller: 'indexCtrl',
                })
                .state('login', {
                    url: "/login",
                    templateUrl: '/client/components/login/login.html',
                    controller: 'loginCtrl'
                })
                .state('new', {
                    url: '/new',
                    templateUrl: '/client/components/new/new.html',
                    controller: 'newCtrl'
                })
                .state('feed', {
                    url: '/feed',
                    templateUrl: '/client/components/feed/feed.html',
                    controller: 'feedCtrl'
                });
            $urlRouterProvider.otherwise('/feed');
        }]);
})(window, window.angular);
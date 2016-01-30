// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.service', 'ngCordova'])

  .run(function ($ionicPlatform, $rootScope, $exceptionHandler, $state) {

    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });

  })

  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    //$httpProvider.defaults.withCredentials = true;
  }])


  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl',
        resolve: {
          allUsers: function(mainService) {
            return mainService.getAllUsers();
          },
          checkins: function(mainService) {
            return mainService.getLatestCheckins();
          }
        }

      })

      .state('app.home', {
        url: '/',
        views: {
          'menuContent': {
            templateUrl: 'templates/home.html'
          }
        }
      })

      .state('app.search', {
        url: '/search',
        views: {
          'menuContent': {
            templateUrl: 'templates/search.html'
          }
        }
      })

      .state('app.browse', {
        url: '/browse',
        views: {
          'menuContent': {
            templateUrl: 'templates/browse.html'
          }
        }
      })
      .state('app.reporting', {
        url: '/reporting',
        views: {
          'menuContent': {
            templateUrl: 'templates/reporting.html',
            controller: function ($scope, dataService, checkins, allUsers, pos, mainService) {
              console.log('inside reporting controller');
              $scope.users = allUsers;
              $scope.checkinsByUsers = dataService.checkinsByUsers;
              $scope.lat =pos[0];
              $scope.lng = pos[1];
              $scope.dist = mainService.distance;
            }
          }

        },
        resolve: {
          allUsers: function(mainService) {
            return mainService.getAllUsers();
          },
          checkins: function(mainService) {
            return mainService.getLatestCheckins();
          },
          pos: function($cordovaGeolocation) {

            return $cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: true}).then(function (position) {
              return [position.coords.latitude, position.coords.longitude];
            });
          }
        }
      })

      .state('app.single', {
        url: '/playlists/:playlistId',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlist.html',
            controller: 'PlaylistCtrl'
          }
        }
      })

      .state('app.map', {
        url: '/map',
        views: {
          'menuContent': {
            templateUrl: 'templates/map.html',
            controller: 'MapCtrl'
          }
        },
        resolve: {
          checkins: function(mainService) {
            return mainService.getLatestCheckins();
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/');
  });

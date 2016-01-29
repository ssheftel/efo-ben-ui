angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, $rootScope, $state) {
    window.rs = $rootScope;
    $scope.bob = function(user) {
      $rootScope.user = user;
      $rootScope.uid = user.id;
      localStorage.setItem('uid', user.id)
    };

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // HEROKU
  $http.get('https://efo-ben-service.herokuapp.com/user').then(function(resp) {
  $scope.loginData.users = resp.data._items;
    $rootScope.allUsers = resp.data._items;
  });

  // Form data for the login modal
  $scope.loginData = {};
  $scope.checkLoginUser = true;
  $scope.loginData.isChecked = false;

  //console.log($scope.loginData.isChecked + " thats the isChecked");
  function checkmark() {
    if ($scope.loginData.isChecked = false) {
      $('.radio-content input:text').val("");
    }
  }

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $state.go('app.map');
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})


.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $http) {
  var options = {timeout: 10000, enableHighAccuracy: true};

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    var marker = new google.maps.Marker({
    position: latLng,
    map: $scope.map,
    title: 'Hello World!'
    });

    update_location(latLng);

    function update_location(latLng) {
      var payload = {
        "geo": {"coordinates": [latLng.lat(), latLng.lng()], "type": "Point"},
        "time": "2015-07-24T22:00:00.000000Z",
        "user": "56aa76b0cfc207b71181fce4"
      };
      return $http.post('https://efo-ben-service.herokuapp.com/checkin', payload).then(function(resp) {
        console.log('adslkjfl');
        console.log(resp)
      });
    }
  }, function(error){
    console.log("Could not get location");
  });
});

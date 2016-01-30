angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, $rootScope, $state, $interval) {
    window.rs = $rootScope;
    $scope.bob = function(user) {
      $rootScope.user = user;
      $rootScope.uid = user._id;
      localStorage.setItem('uid', user._id)
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
    window.rs = $rootScope;
    function pollUserLocs() {
      $http.get('https://efo-ben-service.herokuapp.com/checkin').then(function(resp){
        var cords, loc;
        //console.log(resp.data._items)
        cords = (function() {
          var i, len, ref, results;
          ref = resp.data._items;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            loc = ref[i];
            results.push([loc.geo.coordinates[0], loc.geo.coordinates[1]]);
          }

          return [results,ref];
        })();
        window.cords = cords;
      });
    }
    $interval(pollUserLocs, 500);



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


.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $http, $rootScope) {
  var options = {timeout: 10000, enableHighAccuracy: true};

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map =window.mp = new google.maps.Map(document.getElementById("map"), mapOptions);

    var i, j, len, marker;

    for (j = 0, len = window.cords[0].length; j < len; j++) {
      i = cords[0][j];
      //console.log(i);
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(i[0], i[1]),
        map: mp,
        title: 'Hello World!'
      });
    }


    // CALCULATE DISTANCE
    // var from = Location of ITC
    var late = [];
    var from = new google.maps.LatLng(32.061974, 34.770008);
    for (j = 0, len = window.cords[0].length; j < len; j++) {
      i = cords[0][j];
      var to   = new google.maps.LatLng(i[0], i[1]);
      var dist = google.maps.geometry.spherical.computeDistanceBetween(from, to);
      if (dist > 130) {
       late.push(cords[1][j]._id);
      }
    //Need to do
    // IF dist > 130;
      // late -- print name on app/reporting page
    }
    // END OF DISTANCE CALCULATION



    update_location(latLng);

    function update_location(latLng) {
      var payload = {
        "geo": {"coordinates": [latLng.lat(), latLng.lng()], "type": "Point"},
        "time": moment().format('YYYY-MM-DDTHH:mm:ss'),//"2015-07-24T22:00:00.000000Z",
        "user": $rootScope.uid
      };
      return $http.post('https://efo-ben-service.herokuapp.com/checkin', payload).then(function(resp) {
      });
    }
  }, function(error){
    console.log("Could not get location");
  });
});

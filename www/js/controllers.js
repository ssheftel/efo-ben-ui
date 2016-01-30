angular.module('starter.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout, $http, $rootScope, $state, $interval, allUsers, checkins, mainService, dataService) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // HEROKU
    $scope.loginData = {};
    $scope.loginData.users = $rootScope.allUsers;
    //$interval(mainService.getLatestCheckins, 5000);


    // Form data for the login modal
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
    }).then(function (modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
      $scope.modal.show();
    };

    $scope.setUser = function(usr) {
      console.log('setting user');
      $rootScope.uid = usr._id;
      localStorage.setItem('uid', usr._id);
      dataService.uid = usr._id;
      doLogin();


    };
    // Perform the login action when the user submits the login form
    var doLogin = $scope.doLogin = function () {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $state.go('app.map');
        $scope.closeLogin();
      }, 1000);
    };
  })

  .controller('PlaylistsCtrl', function ($scope) {
    $scope.playlists = [
      {title: 'Reggae', id: 1},
      {title: 'Chill', id: 2},
      {title: 'Dubstep', id: 3},
      {title: 'Indie', id: 4},
      {title: 'Rap', id: 5},
      {title: 'Cowbell', id: 6}
    ];
  })

  .controller('PlaylistCtrl', function ($scope, $stateParams) {
  })


  .controller('MapCtrl', function ($scope, $state, $cordovaGeolocation, $http, $rootScope, checkins, mainService, dataService, $interval, $timeout) {
    var options = {timeout: 10000, enableHighAccuracy: true};

    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      var mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      $scope.map = window.mp = new google.maps.Map(document.getElementById("map"), mapOptions);

      var i, j, len, marker;


      //mainService.startPollingCheckins();
      //$interval(mainService.getLatestCheckins, 1000 * 60 * 5);

      var markers = {};
      function addMarker(location, title, uid) {
        var marker;
        if (markers[uid]){
          markers[uid].setMap(null);
        }
        marker = new google.maps.Marker({
          animation: google.maps.Animation.DROP,
          //icon: {url: "/img/BEN.png", size: new google.maps.Size(200, 320), origin: new google.maps.Point(0, 0), anchor: new google.maps.Point(0, 32)},
          //shape: { coords: [1, 1, 1, 20, 18, 20, 18, 1], type: 'poly'},
          position: new google.maps.LatLng(location[0], location[1]),
          map: mp,
          title: title
        });
        markers[uid] = marker
      }



      mainService.getLatestCheckins().then(function() {

        $timeout(function() {
          $scope.$watchCollection('checkinsByUsers', function(nw, od) {
            var ref, title, uCord, uid,
              hasProp = {}.hasOwnProperty;

            ref = nw;
            for (uCord in ref) {
              if (!hasProp.call(ref, uCord)) continue;
              uid = ref[uCord];
              title = dataService.userLookupObj[uCord].first_name;
              addMarker(uid.cord, title, uCord);
            }
          },true);
        }, 3000);
        $interval(mainService.getLatestCheckins, 1000 * 15);
      });
      //debugger;
      console.log(dataService.checkinsByUsers);
      $scope.checkinsByUsers = dataService.checkinsByUsers;




      //for (j = 0, len = window.cords[0].length; j < len; j++) {
      //  i = cords[0][j];
      //  //console.log(i);
      //  marker = new google.maps.Marker({
      //    position: new google.maps.LatLng(i[0], i[1]),
      //    map: mp,
      //    title: title
      //  });
      //}


      // CALCULATE DISTANCE
      // var from = Location of ITC
      //var late = [];
      //var from = new google.maps.LatLng(32.061974, 34.770008);
      //for (j = 0, len = window.cords[0].length; j < len; j++) {
      //  i = cords[0][j];
      //  var to = new google.maps.LatLng(i[0], i[1]);
      //  var dist = google.maps.geometry.spherical.computeDistanceBetween(from, to);
      //  if (dist > 130) {
      //    late.push(cords[1][j]._id);
      //  }
      //  //Need to do
      //  // IF dist > 130;
      //  // late -- print name on app/reporting page
      //}
      // END OF DISTANCE CALCULATION


      //update_location(latLng);
      //
      //function update_location(latLng) {
      //  var payload = {
      //    "geo": {"coordinates": [latLng.lat(), latLng.lng()], "type": "Point"},
      //    "time": moment().format('YYYY-MM-DDTHH:mm:ss'),//"2015-07-24T22:00:00.000000Z",
      //    "user": $rootScope.uid
      //  };
      //  return $http.post('https://efo-ben-service.herokuapp.com/checkin', payload).then(function (resp) {});
      //}

      //mainService.startMonitorUserLoc()
      mainService.postCurrentLoc();
      $interval(mainService.postCurrentLoc, 1000 * 60 * 4);
    }, function (error) {
      console.log("Could not get location");
    });
  });

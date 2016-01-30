(function() {
  var app = angular.module('starter.service', []);

  app.factory('dataService', function() {
    return {
      checkinsByUsers: {},
      allUsers: null,
      userLookupObj: null,
      checkinsPollingPromis: null,
      uid: localStorage.getItem('uid') || null,
      monitorUserLocPromis: null
    };
  });

  app.factory('mainService', function($http, $rootScope, $interval, $cordovaGeolocation, dataService){
    var service = {};
    service.getLatestCheckins = getLatestCheckins;
    service.startPollingCheckins = startPollingCheckins;
    service.getAllUsers = getAllUsers;
    service.postCurrentLoc = postCurrentLoc;
    service.distance = distance;
    //service.startMonitorUserLoc = startMonitorUserLoc;
    return service;
    /////////////////

    //sets $rootScope.checkinsByUsers
    function getLatestCheckins() {
      console.log('getLatestCheckins');
      return $http.get('https://efo-ben-service.herokuapp.com/checkin').then(function(resp) {
        console.log('getLatestCheckins returned');
        var checkin, checkinsByUsers, cord, i, len, rawCheckins, ref, ref1, time, user;
        rawCheckins = resp.data._items;
        checkinsByUsers = dataService.checkinsByUsers;
        for (i = 0, len = rawCheckins.length; i < len; i++) {
          checkin = rawCheckins[i];
          if (!checkin.user) {
            continue;
          }
          if (((ref = checkin.geo) != null ? ref.coordinates : void 0) == null) {
            continue;
          }
          user = checkin.user;

          if (checkinsByUsers[user] && checkinsByUsers[user].time) {
            if (checkinsByUsers[user].time >= checkin.time){
              continue;
            }
            console.log('NEW TIME!');
          }
          //if ((((ref1 = checkinsByUsers[user]) != null ? ref1.time : void 0) != null) >= checkin.time) {
          //  continue;
          //}
          time = checkin.time;
          cord = checkin.geo.coordinates;
          console.log('adding new checkin');
          checkinsByUsers[user] = {
            user: user,
            time: time,
            cord: cord
          };
        }
        //dataService.checkinsByUsers = checkinsByUsers;
        return checkinsByUsers;
      });
    }

    function startPollingCheckins(timeout) {
      if (!timeout) {timeout=5000;}
      var checkinsPollingPromis = $interval(service.getLatestCheckins, timeout);
      dataService.checkinsPollingPromis = checkinsPollingPromis;
      return checkinsPollingPromis;
    }

    //sets $rootScope.allUsers = allUsers;
    function getAllUsers() {
      if ($rootScope.allUsers) {return $rootScope.allUsers;}
      return $http.get('https://efo-ben-service.herokuapp.com/user').then(function(resp) {
        var allUsers = resp.data._items, i, len, u, userLookupObj;
        userLookupObj = {};
        for (i = 0, len = allUsers.length; i < len; i++) {
          u = allUsers[i];
          userLookupObj[u._id] = u;
        }
        $rootScope.allUsers = allUsers;
        dataService.allUsers  = allUsers;
        $rootScope.userLookupObj = userLookupObj;
        dataService.userLookupObj = userLookupObj;
        return allUsers;
      });
    }

    function postCurrentLoc() {
      return $cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: true}).then(function(pos) {
        var lat = pos.coords.latitude, lng = pos.coords.longitude, payload;
        if (!dataService.uid) {return null;}
        payload = {
          "geo": {"coordinates": [lat, lng], "type": "Point"},
          "time": moment().format('YYYY-MM-DDTHH:mm:ss'),//"2015-07-24T22:00:00.000000Z",
          "user": dataService.uid
        };
        console.log('posting current current cossition');
        return $http.post('https://efo-ben-service.herokuapp.com/checkin', payload).then(function (resp) {});
      });
    }
    function startMonitorUserLoc(timeout) {
      if (!timeout) {timeout=7000;}
      dataService.monitorUserLocPromis = $interval(service.postCurrentLoc, timeout);
      return dataService.monitorUserLocPromis;
    }

    function distance(lat1, lon1, lat2, lon2) {
      var p = 0.017453292519943295;    // Math.PI / 180
      var c = Math.cos;
      var a = 0.5 - c((lat2 - lat1) * p)/2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p))/2;

      return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    }

  });

}());

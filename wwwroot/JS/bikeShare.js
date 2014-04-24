/**
 * Created by Dieter Beelaert on 22/04/2014.
 */
var BABikeShare = angular.module('BABikeShare',['ngAnimate']);

BABikeShare.controller('stationController', function($scope,$http){

    $scope.stations = [];
    $scope.currentPosition = {};
    $scope.listView = true;
    $scope.detailView = false;
    $scope.selectedStation = null;
    $scope.mapDetail = '';
    $scope.mapLink = '';

    /*
        Get the list of bike stations
     */
    $scope.getList = function(){
        $http({
            url:'/getList'
        }).success(function(json){
            $scope.stations = json.stationBeanList;
            $scope.addDistance(json.stationBeanList);
        }).error(function(err){console.log(err);})
    }
    $scope.getList();

    $scope.addDistance = function() {
        getCurrentPosition(function(location){
           $scope.currentPosition = location; //keep the current location to know when the user moved
           var lat = location.latitude;
           var long = location.longitude;

            for(var i = 0; i < $scope.stations.length; i++){
               var station = $scope.stations[i];
                var dist = distance(lat,long,station.latitude,station.longitude,'M');
                console.log(dist);
                dist = dist > 0.1 ? Number(dist).toFixed(2) + " mi" : Number(dist * 5280).toFixed(0) + " ft";
               $scope.stations[i].distance = dist;
           }
           $scope.stations.sort(compareByDistance);
           $scope.$apply();
        });
    }

    $scope.doDetailView = function(station){
        $scope.selectedStation = station;
        var lat = station.latitude; var long = station.longitude
        $scope.mapDetail = 'http://maps.googleapis.com/maps/api/staticmap?center=' + lat +
            ',' + long  +'&markers='+ lat +','+long +'&size=288x200&sensor=true&zoom=14';

        //$scope.mapLink = 'http://maps.google.com/?ie=UTF8&hq=&ll=' + lat + ',' + long +'&z=13';
        $scope.mapLink = 'http://maps.google.com/maps?q='+lat + ',' + long +'(Marker)&z=14&ll=' + lat + ',' + long;
        $scope.detailView = true;
        $scope.listView = false;
    }

    $scope.doListView = function(){
        $scope.selectedStation = null;
        $scope.detailView = false;
        $scope.listView = true;
        //check if the user has moved so we need to update the distance
        $scope.checkIfMoved();
    }

    $scope.checkIfMoved = function(){
        getCurrentPosition(function(position){
           if(position.longitude !== $scope.currentPosition.longitude
               && position.latitude !== $scope.currentPosition.latitude){
               //user moved, recalculate distances
               $scope.addDistance();
           }
        });
    }

});


/*--- extra functions --- */
function getCurrentPosition(callback){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var loc = { latitude : position.coords.latitude, longitude : position.coords.longitude};
            callback(loc);
        });
    }//no geolocation no party ...
}

//calculate the distance between two coordinates
function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var radlon1 = Math.PI * lon1/180
    var radlon2 = Math.PI * lon2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit==='K') { dist = dist * 1.609344 }
    if (unit==='N') { dist = dist * 0.8684 }
    return dist;
}

function compareByDistance(a,b){
    if(a.distance < b.distance)
        return -1;
    if(a.distance > b.distance)
        return 1;
    return 0;
}
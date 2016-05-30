'use strict';
angular.module('ngMemeDemoApp').controller('ngMemeDemoAppCtrl', function($scope, MemeAPI) {
  $scope.memeImage = "one-does-not-simply.jpg";
  $scope.memeImageHeight = 0;
  $scope.memeImageWidth = 0;
  $scope.memeLoadedCallback = function() {
    alert("Image successfully loaded!")
  };
  $scope.memeLoadedErrback = function() {
    alert("Error loading image!")
  };
  $scope.updateMemeCanvas = function() {
    $scope.memeImageHeight = document.getElementById('memeDiv').offsetHeight;
    $scope.memeImageWidth = document.getElementById('memeDiv').offsetWidth;
  };
  $scope.memeTopLinePlaceholder = "top line (optional)";
  $scope.memeBottomLinePlaceholder = "bottom line (optional)";
  $scope.memeTopLineText = "";
  $scope.memeBottomLineText = "";
  $scope.validateMemeText = function() {
    $scope.memeTopLineText = $scope.memeTopLineText.slice(0, $scope.memeInputMaxLength);
    $scope.memeBottomLineText = $scope.memeBottomLineText.slice(0, $scope.memeInputMaxLength);
  };
  $scope.memeInputMaxLength = 100;
  $scope.memeApi = new MemeAPI();
  $scope.openRawImageInNewWindow = function(cutFromCanvas) {
    window.open($scope.memeApi.getMemeImageData($scope.memeImageWidth, $scope.memeImageHeight, cutFromCanvas, true));
  }
  $scope.getRawImageData = function() {
    alert("" + $scope.memeApi.getMemeImageData($scope.memeImageWidth, $scope.memeImageHeight, true));
  }
  $scope.updateMemeCanvas();
});

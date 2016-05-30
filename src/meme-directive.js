angular.module('memeDirective', [])
.directive("meme", function($timeout, $parse, MemeAPI) {
	return {
		scope: {
        	apiInstance: '='
    	},
    	link: function(scope, element, attrs){
    		api = scope.apiInstance;
			api.setCanvas(element[0]);
			if (attrs.memeLoadedCallback) {
				var parentGet = $parse(attrs['memeLoadedCallback']);
				api.setLoadCallback(parentGet(scope.$parent));
			};
			if (attrs.memeLoadedErrback) {
				var parentGet = $parse(attrs['memeLoadedErrback']);
				api.setLoadErrback(parentGet(scope.$parent));
			};
			attrs.$observe('topLine', function(event) {
				api.setMemeText(attrs.topLine, null);
				api.drawMeme();
			});
			attrs.$observe('bottomLine', function(event) {
				api.setMemeText(null, attrs.bottomLine);
				api.drawMeme();
			});
			attrs.$observe('width', function(event) {
				api.resizeMeme(attrs.width, attrs.height);
			});
			attrs.$observe('height', function(event) {
				api.resizeMeme(attrs.width, attrs.height);
			});
			attrs.$observe('image', function(event) {
				api.loadImage(attrs.image);
			});
		}
	};
});

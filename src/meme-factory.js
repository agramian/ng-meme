angular.module('memeFactory', [])
.factory("MemeAPI", function($timeout, $http) {
	var MemeAPI = function() {
		this.canvas = null;
		this.loadCallback = null;
		this.loadErrback = null;
		this.ratio = null;
		this.availableCanvas = {
			'width': null,
			'height': null
		};
		this.drawnImage = {
			'width': null,
			'height': null
		};
		this.drawnText = {
			'yTop': null,
			'yBottom': null
		};
    this.context = null;
    this.fontSize = null;
		this.image = null;
		this.rawImageData = null;
		this.imageExtension = null;
		this.imageMimeType = null;
		this.resizePromise = null;
		this.topLine = "";
		this.bottomLine = "";
		this.topTextBaseline = 'hanging';
		this.bottomTextBaseline = 'alphabetic';
		this.textVerticalOffsetFactor = 0.4;
	};
	MemeAPI.prototype.pixelRatio = function(ctx) {
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;
        console.log('pixel ratio:' + dpr / bsr);
    	return dpr / bsr;
	};
    MemeAPI.prototype.setCanvas = function (canvas) {
    	this.canvas = canvas;
    	this.context = canvas.getContext('2d');
    	this.ratio = this.pixelRatio(this.context);
    };
    MemeAPI.prototype.setLoadCallback = function (callback) {
    	this.loadCallback = callback;
    };
    MemeAPI.prototype.setLoadErrback = function (errback) {
    	this.loadErrback = errback;
    };
    MemeAPI.prototype.setMemeText = function (topLine, bottomLine) {
    	this.topLine = topLine === null ? this.topLine : topLine;
    	this.bottomLine = bottomLine === null ? this.bottomLine : bottomLine;
    };
    MemeAPI.prototype.drawImageFromRawData = function(rawImageData) {
    	if (rawImageData) {
		    var blob = new Blob( [ rawImageData ], { type: this.imageMimeType } );
		    var urlCreator = window.URL || window.webkitURL;
			this.image.src = (window.URL || window.webkitURL).createObjectURL( blob );
			var self = this;
			this.image.onload = function() {
				self.drawMeme();
				self.loadCallback();
			};
		}
    };
	MemeAPI.prototype.loadImage = function(image) {
		console.log("LOADING IMAGE");
		if (image.indexOf(".jpg") > -1
			|| image.indexOf(".png") > -1
			|| image.indexOf(".gif") > -1
			|| image.indexOf(".svg") > -1
			|| image.indexOf('http') == 0) {
			this.image = new Image();
			//this.image.crossOrigin = "Anonymous";
			// get extension and set meme type
		    this.imageExtension = image.match(/\.[^/.]+$/);
		    console.log(this.imageExtension);
		    if (this.imageExtension) {
				if (this.imageExtension[0] == ".jpg"
					|| this.imageExtension[0] == ".jpeg") {
					this.imageMimeType = "image/jpeg";
				}
				else if (this.imageExtension[0] == ".png") {
					this.imageMimeType = "image/png";
				}
				else if (this.imageExtension[0] == ".gif") {
					// TODO
					//if animated
					//return this.canvas.toDataURL("image/png");
				}
			}
			// default to png
			else {
				this.imageMimeType = "image/png";
			}
			this.image.src = image;
			self = this;
			this.image.onload = function() {
				self.drawMeme();
				self.loadCallback();
			};
		}
	};
	MemeAPI.prototype.resizeMeme = function(width, height) {
		this.canvas.width = width * this.ratio;
		this.canvas.height = height * this.ratio;
		this.availableCanvas.width = width * this.ratio;
		this.availableCanvas.height = height * this.ratio;
    	this.context.scale(this.ratio, this.ratio);
		if (this.resizePromise != null ) {
			$timeout.cancel( this.resizePromise );
		}
		var self = this;
		this.resizePromise = $timeout(function() {self.drawMeme();}, 250);
		this.resizePromise.then(
            function() {
                this.resizePromise = null;
            },
            function() {
                this.resizePromise = null;
            }
    	);
	};
	MemeAPI.prototype.drawMeme = function(cutFromCanvas) {
		if (this.image == null) return;
		if (this.canvas.width == 0 || this.canvas.height == 0) return;
		if (this.image.width == 0 || this.image.height == 0) return;
		// clear this.canvas
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		// draw image
		this.drawImage(typeof cutFromCanvas !== 'undefined' ? cutFromCanvas : true);
		// set text style and options
		this.context.fillStyle = 'white';
		this.context.strokeStyle = 'black';
		this.context.lineWidth = 2;
		this.context.textAlign = 'center';
		// draw top and bottom text
		this.drawText(this.topLine, this.bottomLine);
	};
	MemeAPI.prototype.getMemeImageData = function(width, height, cutFromCanvas, returnUrl) {
		// to pass raw url-encoded binary
		// the url-encoding increases the size so base64 seems better
  	//return escape(atob(this.canvas.toDataURL(this.imageMimeType).split(',')[1]).replace(/\0+$/, ''));
		// to pass base64 encoded
		var currentCanvasWidth = this.canvas.width;
		var currentCanvasHeight = this.canvas.height;
		this.canvas.width = (typeof width !== 'undefined' && width !== null) ? width : this.image.width;
		this.canvas.height = (typeof height !== 'undefined' && height !== null) ? height : this.image.height;
		this.availableCanvas.width = this.canvas.width;
		this.availableCanvas.height = this.canvas.height;
		this.drawMeme(cutFromCanvas);
		// always using png so don't need this.imageMimeType anymore
		var imageData;
		if (typeof returnUrl !== 'undefined' || returnUrl == true) {
			imageData = this.canvas.toDataURL("image/png");
		} else {
			imageData = this.canvas.toDataURL("image/png").split(',')[1];
		}
		this.canvas.width = currentCanvasWidth;
		this.canvas.height = currentCanvasHeight;
		this.availableCanvas.width = currentCanvasWidth;
		this.availableCanvas.height = currentCanvasHeight;
		this.drawMeme();
		return imageData;
	};
	// draw image and scale this.canvas based on size
	MemeAPI.prototype.drawImage = function(cutFromCanvas) {
		var scaledHeight = null;
		var scaledWidth = null;
		// landscape image
		if (this.image.width > this.image.height) {
			console.log('landscape');
			scaledHeight = Math.ceil(this.canvas.width * (this.image.height/this.image.width));
			scaledWidth = this.canvas.width;
			while (scaledHeight > this.canvas.height) {
				scaledHeight--;
				scaledWidth = scaledHeight * (this.image.width/this.image.height);
			}
		}
		// portrait image
		else {
			console.log('portrait');
			scaledWidth = this.canvas.height * (this.image.width/this.image.height);
		}
		console.log('scaled w,h:' + scaledWidth+ "," + scaledHeight);
		// drawn image dimensions
		this.drawnImage.width = scaledWidth === null ? this.canvas.width : scaledWidth;
		this.drawnImage.height = scaledHeight === null ? this.canvas.height : scaledHeight;
		console.log('drawn w,h:' + this.drawnImage.width+ "," + this.drawnImage.height);
		// set text y location
		this.drawnText.yTop = this.fontSize * this.textVerticalOffsetFactor;
		this.drawnText.yBottom = this.drawnImage.height - (this.fontSize * this.textVerticalOffsetFactor);
		// draw the image scaled to fit the canvas,
		// don't include empty space left in canvas
		if (cutFromCanvas) {
			console.log("Cut from canvas");
			// set canvas to scaled dimensions
			this.canvas.width = this.drawnImage.width;
			this.canvas.height = this.drawnImage.height;
			this.availableCanvas.width = this.canvas.width;
			this.availableCanvas.height = this.canvas.height;
			this.context.drawImage(
				this.image,
				0, 0,
				this.canvas.width, this.canvas.height);
		}
		// draw the image scaled to fit the canvas,
		// include the empty space left in the canvas
		else {
			console.log("Not cut from canvas");
			this.context.drawImage(
				this.image,
				0, 0,
				this.image.width, this.image.height,
				(this.availableCanvas.width - this.drawnImage.width)/2,
				(this.availableCanvas.height - this.drawnImage.height)/2,
				this.drawnImage.width, this.drawnImage.height);
			this.drawnText.yTop += (this.availableCanvas.height - this.drawnImage.height)/2;
			this.drawnText.yBottom += (this.availableCanvas.height - this.drawnImage.height)/2;
		}
		// counter hdpi scale
    	this.canvas.style.width = this.availableCanvas.width / this.ratio + "px";
    	this.canvas.style.height = this.availableCanvas.height / this.ratio + "px";
    	console.log('canvas w,h:' + this.canvas.width + "," + this.canvas.height);
    	console.log('available w,h:' + this.availableCanvas.width + "," + this.availableCanvas.height);
    	console.log('css w,h:' + this.canvas.style.width + "," + this.canvas.style.height);
		// set font size based on the scaled image height
		this.fontSize = (this.drawnImage.height / 8);
		this.context.font = this.fontSize + 'px Impact';
	};
	MemeAPI.prototype.drawText = function(textTop, textBottom) {
		var x = this.availableCanvas.width / 2;
		var yTop = this.drawnText.yTop;
		var yBottom = this.drawnText.yBottom;
		// text top
		if (textTop && textTop.length > 0) {
			this.context.textBaseline = this.topTextBaseline;
			if (this.context.measureText(textTop).width > (this.drawnImage.width * 1.1)) {
				// Split word by word
				var words = textTop.split(' ');
				var line = words.shift();
				var nextWord = words.shift();
				while (line != null) {
					while (this.context.measureText(line).width < (this.drawnImage.width * 1.0)) {
						if (nextWord != null && this.context.measureText(line + " " + nextWord).width < (this.drawnImage.width * 1.0)) {
							line += " " + nextWord;
							nextWord = words.shift();
						}
						else {
							break;
						}
					}
					this.context.fillText(line, x, yTop, this.drawnImage.width * .9);
					this.context.strokeText(line, x, yTop, this.drawnImage.width * .9);
					line = nextWord;
					nextWord = words.shift();
					yTop += this.fontSize;
				}
			}
			else {
				this.context.fillText(textTop, x, yTop, this.drawnImage.width * .9);
				this.context.strokeText(textTop, x, yTop, this.drawnImage.width * .9);
			}
		}
		// text bottom
		if (textBottom && textBottom.length > 0) {
			this.context.textBaseline = this.bottomTextBaseline;
			if (this.context.measureText(textBottom).width > (this.drawnImage.width * 1.1)) {
				// Split word by word
				var words = textBottom.split(' ');
				var line = words.pop();
				var nextWord = words.pop();
				while (line != null) {
					while (this.context.measureText(line).width < (this.drawnImage.width * 1.0)) {
						if (nextWord != null && this.context.measureText(nextWord + " " + line).width < (this.drawnImage.width * 1.0)) {
							line = nextWord + " " + line;
							nextWord = words.pop();
						}
						else {
							break;
						}
					}
					this.context.fillText(line, x, yBottom, this.drawnImage.width * .9);
					this.context.strokeText(line, x, yBottom, this.drawnImage.width * .9);
					line = nextWord;
					nextWord = words.pop();
					yBottom -= this.fontSize;
				}
			}
			else {
				this.context.fillText(textBottom, x, yBottom, this.drawnImage.width * .9);
				this.context.strokeText(textBottom, x, yBottom, this.drawnImage.width * .9);
			}
		}
	};
	return MemeAPI;
});

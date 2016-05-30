# ng-meme

AngularJS directive for creating basic memes from local or remote files.

### Running the Demo

Clone the repo then open the `demo/index.html` file in a web browser.

*Note:* Due to CORS and security restrictions for the most straightforward demo experience use **Firefox**.  If you would like to use **Chrome** you will have to start it with the `--allow-file-access-from-files` flag.

Assuming the default install locations, for **Windows** use `C:\Users\XXX_USER\AppData\Local\Google\Chrome\Application\chrome.exe --allow-file-access-from-files` and for **OSX** `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files &`

For a production app you will have to make sure all images being used meet the necessary CORS and security requirements most likely by serving the images from your own server.

### Installation

`bower install agramian/ng-meme`

Include the meme factory and directive scripts in your app.
```
<script src="bower_components/ng-meme/src/meme-factory.js"></script>
<script src="bower_components/ng-meme/src/meme-directive.js"></script>
```

### Usage

Add a canvas element with the **meme** directive identifier along with values or bindings to the various attributes.

`<canvas meme id='memeCanvas' height='{{memeImageHeight}}' width='{{memeImageWidth}}' top-line='{{memeTopLineText}}' bottom-line='{{memeBottomLineText}}' image='{{memeImage}}' api-instance='memeApi' meme-loaded-callback='memeLoadedCallback' meme-loaded-errback='memeLoadedErrback'> </canvas>`

Include the **memeFactory** and **memeDirective** dependencies.

Inject the **MemeAPI** dependency into the controller where the directive will be altered.

Minimally instantiate the **MemeApi**, set a source image either directly in the canvas element or set the associated variable in your controller, then call set the directive's height and width if not already set.

```
$scope.memeApi = new MemeAPI();
$scope.memeImage = "one-does-not-simply.jpg";
$scope.memeImageHeight = 500;
$scope.memeImageWidth = 500;
```

For more details see the demo app source.

### TODO
- GIF handling
- re-implement use of ImageFromUrlApi to demonstrate use of served images to avoid CORS issues

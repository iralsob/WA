var context;
var bufferLoader;
function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}

window.addEventListener('load', init, false);
function init() {
	try {
		window.AudioContext = window.AudioContext||window.webkitAudioContext;
		context = new AudioContext();

		bufferLoader = new BufferLoader(
			context,
			[
				'sounds/myau.ogg',
				'sounds/gav.ogg',
        'sounds/car.ogg',
        'sounds/moo.ogg',
        'sounds/kukareku.wav'
			],
			finishedLoading
			);

		bufferLoader.load();
	}
	catch(e) {
		alert('Web Audio API is not supported in this browser');
		alert(e);
	}
}
function finishedLoading(bufferList) {
  // Create two sources and play them both together.
  var source;
  for (var i=0; i < bufferList.length; i++) {
    var tmp = i+1;
    var next = context.createBufferSource();
    next.buffer = bufferList[tmp];

    source = context.createBufferSource();
    source.buffer = bufferList[i];
    source.connect(next);
    source.start(0);
  }
}

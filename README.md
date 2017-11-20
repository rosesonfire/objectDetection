Detect single objects in small, background-blurred and close-focused images
# Installation
`npm install`
# Usage
```

var detectObject = require('object-detection')

var config = {
  imageName: 'path-to-image', // preferrably less than 100 kB
  fileExt: 'jpg', // preferrably jpg
  sensitivity: 50, // ranges from 1 to 100
  tolerance: 50, // ranges from 1 to 100
}

detectObject(config).then(function(response) {
  var base64Img = response.base64Img
  // use base64Img ...
})

```
# Caution
- Use small images, preferably less than 100 kB
- Currently works for single object.
- Behaviour is not strongly defined for multi-objects.
- Contiguous objects are considered as single object.
- Optimizer is not well tuned yet.
# Examples
Start examples: `npm start`
Name|Image|Object
-|-|-
Baseball|<img src="./examples/images/baseball.jpg" width="200" />|<img src="./examples/objects/baseball.jpg" width="200">
Birb|<img src="./examples/images/birb.jpg" width="200" />|<img src="./examples/objects/birb.jpg" width="200">
Cherry|<img src="./examples/images/cherry.jpg" width="200" />|<img src="./examples/objects/cherry.jpg" width="200">
Mic|<img src="./examples/images/mic.jpg" width="200" />|<img src="./examples/objects/mic.jpg" width="200">
Sunflower|<img src="./examples/images/sunflower.jpg" width="200" />|<img src="./examples/objects/sunflower.jpg" width="200">
Flower|<img src="./examples/images/flower.jpg" width="200" />|<img src="./examples/objects/flower.jpg" width="200">
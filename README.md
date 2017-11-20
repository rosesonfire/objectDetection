Detect objects in small, background-blurred and close-focused images
# Installation
`npm install`
# Caution
- Use small images, preferably less than 100 kB
- Currently works for single object.
- Behaviour is not strongly defined for multi-objects.
- Contiguous objects are considered as single object.
- Optimizer is not well tuned yet.
# Start
`npm start`
# Examples


Name|Image|Object
-|-|-
Baseball|<img src="./examples/images/baseball.jpg" width="200" />|<img src="./examples/objects/baseball.jpg" width="200">
Birb|<img src="./examples/images/birb.jpg" width="200" />|<img src="./examples/objects/birb.jpg" width="200">
Cherry|<img src="./examples/images/cherry.jpg" width="200" />|<img src="./examples/objects/cherry.jpg" width="200">
Mic|<img src="./examples/images/mic.jpg" width="200" />|<img src="./examples/objects/mic.jpg" width="200">
Sunflower|<img src="./examples/images/sunflower.jpg" width="200" />|<img src="./examples/objects/sunflower.jpg" width="200">
Flower|<img src="./examples/images/flower.jpg" width="200" />|<img src="./examples/objects/flower.jpg" width="200">
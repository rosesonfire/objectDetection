var getPixels = require("get-pixels");
var savePixels = require("save-pixels");
var ndarray = require("ndarray");
var toString = require("stream-to-string");
var base64 = require("base64-stream");
var clustering = require("density-clustering");

function createRGBPixels(name) {

    var rgbPixels = new Promise(function(success, failure) {

        try {
            if (typeof name === "string") {
                getPixels(name, function(err, pixels) {

                    if(err) {
                        failure(err);
                    } else {
                        success(pixels);
                    }
                    
                });
            } else {

                var options = name;
                var pixels = ndarray(new Uint32Array(options.pixelArray), [options.l, options.w, 4]);

                pixels.optimal = options.optimal;
                pixels.optimalClusterSize = options.optimalClusterSize;

                success(pixels);
                
            }
        } catch(e) {
            failure(e);
        }     

    }).then(function(p) {

        p.save = function(fileExt) {

            var stream = savePixels(this, fileExt).pipe(base64.encode());
            var base64Img = toString(stream).then(function(base64Img) {

                base64ImgResponse = {
                    base64Img,
                    optimal: this.optimal,
                    optimalClusterSize: this.optimalClusterSize
                };

                return base64ImgResponse;

            }.bind(this));

            return base64Img;

        }

        p.getRGB = function(i, j) {

            var val = {
                r: this.get(i, j, 0),
                g: this.get(i, j, 1),
                b: this.get(i, j, 2)
            };

            return val;

        };

        var foldLeftPixels = function(pixelSeed){
            
            return function(f) {

                for (var i = 0, len_i = this.length, cumul = pixelSeed; i < len_i; i++) {
                    
                    var curPixel = this[i];

                    cumul = f(cumul, curPixel);
                }

                return cumul;

            }.bind(this);

        };

        var foldRightPixels = function(pixelSeed){
            
            return function(f) {

                for (var i = this.length - 1, cumul = pixelSeed; i > -1; i--) {
                    
                    var curPixel = this[i];

                    cumul = f(cumul, curPixel);
                }

                return cumul;

            }.bind(this);

        };

        p.foldLeftPixelRows = function(rowSeed){

            return function(f) {

                for (var i = 0, len_i = this.shape[0], cumul = rowSeed; i < len_i; i++) {
                    
                    var curRow = [];

                    for (var j = 0; j < this.shape[1]; j++) {

                        var pixel = this.getRGB(i, j);

                        curRow.push(pixel);
                    }
                    curRow.foldLeftPixels = foldLeftPixels;
                    curRow.foldRightPixels = foldRightPixels;
                    cumul = f(cumul, curRow);
                }

                return cumul;

            }.bind(this);

        };

        p.foldLeftPixelCols = function(colSeed){
            
            return function(f) {

                for (var i = 0, len_i = this.shape[1], cumul = colSeed; i < len_i; i++) {
                    
                    var curCol = [];

                    for (var j = 0; j < this.shape[0]; j++) {

                        var pixel = this.getRGB(j, i);

                        curCol.push(pixel);
                    }
                    curCol.foldLeftPixels = foldLeftPixels;
                    curCol.foldRightPixels = foldRightPixels;
                    cumul = f(cumul, curCol);
                }

                return cumul;

            }.bind(this);

        };

        p.diff = function(pixel1, pixel2) {

            var diff_r = (pixel1.r - pixel2.r),
                diff_g = (pixel1.g - pixel2.g),
                diff_b = (pixel1.b - pixel2.b);

            var diff = Math.sqrt(diff_r*diff_r + diff_g*diff_g + diff_b*diff_b);

            return diff;

        };

        p.detectObjectOutline = function(sensitivity) {

            var minDiff = (100 - sensitivity) * 221 / 100;

            return function(result, curPixel) {
                
                var done = result[0],
                    detectionArray = result[1];

                if (!done) {

                    var prevPixel = result[2],
                        diff = this.diff(prevPixel, curPixel);

                }

                if (diff && diff >= minDiff) {
                    detectionArray.push(true);
                    done = true;
                } else {
                    detectionArray.push(false);
                }            

                return [done, detectionArray, curPixel];

            }.bind(this);

        };

        p.detectObjectRowWise = function(sensitivity) {

            var detection2DArray = this.foldLeftPixelRows([])(function(detection2DArray, curRow) {
                
                var outlineDetectionFunc = this.detectObjectOutline(sensitivity),
                    rowDetectionArray = [];
                var reducedRowResultTop = curRow.foldLeftPixels([false, [], curRow[0]])(outlineDetectionFunc);
                var rowDetectionArrayTop = reducedRowResultTop[1];

                for (var i = 0, len_i = rowDetectionArrayTop.length; i < len_i; i++) {
                    rowDetectionArray.push(rowDetectionArrayTop[i]);
                }

                var reducedRowResultBottom = curRow.foldRightPixels([false, [], curRow[curRow.length-1]])(outlineDetectionFunc);
                var rowDetectionArrayBottom = reducedRowResultBottom[1];

                for (var i=0, j=rowDetectionArray.length-1, len_i=rowDetectionArrayBottom.length; i<len_i; i++, j--) {
                    if (rowDetectionArrayBottom[i]) {
                        rowDetectionArray[j] = true;
                    }
                }
                detection2DArray.push(rowDetectionArray);

                return detection2DArray;

            }.bind(this));

            return detection2DArray;
            
        };

        p.detectObjectColWise = function(sensitivity, detection2DArray) {

            this.foldLeftPixelCols([detection2DArray, 0])(function(result, curCol) {
                
                var detection2DArray = result[0],
                    col = result[1];
                var outlineDetectionFunc = this.detectObjectOutline(sensitivity),
                    colDetectionArray = [];
                var reducedColResultLeft = curCol.foldLeftPixels([false, [], curCol[0]])(outlineDetectionFunc);
                var colDetectionArrayLeft = reducedColResultLeft[1];

                for (var i=0, len_i=colDetectionArrayLeft.length; i<len_i; i++) {
                    colDetectionArray.push(colDetectionArrayLeft[i]);
                }

                var reducedColResultRight = curCol.foldRightPixels([false, [], curCol[curCol.length-1]])(outlineDetectionFunc);
                var colDetectionArrayRight = reducedColResultRight[1];

                for (var i=0, j=colDetectionArray.length-1, len_i=colDetectionArrayRight.length; i<len_i; i++, j--) {
                    if (colDetectionArray[j] || colDetectionArrayRight[i]) {
                        // colDetectionArray[j] = true;
                        detection2DArray[j][col] = true;
                    }
                }

                return [detection2DArray, col+1];

            }.bind(this));

        };

        p.removeNoise = function(detection2DArray, tolerance) {
            
            var imgSpread = Math.max(this.shape[0], this.shape[1]);
            var scanRadius = (tolerance / 2) * imgSpread / 100,
                dbScanInput = [];

            for (var i=0, len_i=detection2DArray.length; i<len_i; i++) {
                for (var j=0, len_j=detection2DArray[i].length; j<len_j; j++) {
                    if (detection2DArray[i][j]) {
                        dbScanInput.push([i, j]);
                    }
                }
            }

            var dbscan = new clustering.DBSCAN();
            var clusters = dbscan.run(dbScanInput, scanRadius, 100);
            var optimal = clusters.length === 1;
            var optimalClusterSize = optimal ? clusters[0].length : null;
            
            for (var i=0, len_i=dbScanInput.length; i<len_i; i++) {
                
                var point = dbScanInput[i];
                detection2DArray[point[0]][point[1]] = false;
            }

            if (clusters.length > 0) {

                var mainCluster = clusters.reduce(function(cluster1, cluster2) {
                    
                    var biggerCluster;

                    if (cluster1.length > cluster2.length) {
                        biggerCluster = cluster1;
                    } else {
                        biggerCluster = cluster2;
                    }

                    return biggerCluster;

                });                

                for (var i=0, len_i=mainCluster.length; i<len_i; i++) {

                    var point = dbScanInput[mainCluster[i]];
                    detection2DArray[point[0]][point[1]] = true;

                }
            }

            return { optimal, optimalClusterSize };

        };

        p.getDetectionArrayPixels = function(detection2DArray, backPixel, frontPixel) {
            
            var detectionArrayPixels = [];
            
            for (var i=0, len_i=detection2DArray.length; i<len_i; i++) {
                
                var rowDetectionArray = detection2DArray[i];
                
                for (var j=0, len_j=rowDetectionArray.length; j<len_j; j++) {
                    if (rowDetectionArray[j]) {
                        detectionArrayPixels.push(frontPixel.r);
                        detectionArrayPixels.push(frontPixel.g);
                        detectionArrayPixels.push(frontPixel.b);
                    } else {
                        detectionArrayPixels.push(backPixel.r);
                        detectionArrayPixels.push(backPixel.g);
                        detectionArrayPixels.push(backPixel.b);
                    }
                    detectionArrayPixels.push(255);
                }
            }

            return detectionArrayPixels;

        }

        p.detectObject = function(sensitivity, tolerance, backPixel, frontPixel) {

            var detection2DArray = this.detectObjectRowWise(sensitivity);
            
            this.detectObjectColWise(sensitivity, detection2DArray);            
            
            var { optimal, optimalClusterSize } = this.removeNoise(detection2DArray, tolerance);
                detectionArrayPixels = this.getDetectionArrayPixels(detection2DArray, backPixel, frontPixel);
            var detectedObject = createRGBPixels({
                l: this.shape[0],
                w: this.shape[1],
                pixelArray: detectionArrayPixels,
                optimal,
                optimalClusterSize
            });

            return detectedObject;

        };

        return p;

    });

    return rgbPixels;

}

window.work = function (imageName, fileExt, sensitivity, tolerance) {
    
    var white = {
        r: 255,
        g: 255,
        b: 255
    };
    
    var black = {
        r: 0,
        g: 0,
        b: 0
    };
    
    var base64Img = createRGBPixels(imageName)
        .then(function(img) {
    
            var detectedObject = img.detectObject(sensitivity, tolerance, white, black);
            
            return detectedObject;
    
        })
        .then(function(detectedObject) {
    
            var base64ImgResponse = detectedObject.save(fileExt);
            
            return base64ImgResponse;
    
        });

    return base64Img;
}



/**
 * "PhotoMosaic" returns a new object that allows you to use the library.
 * It is possible to use the PhotoMosaic with multiple canvasses and render multiple images at the same time by calling this function with different canvas elements.
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {function} startCallback 
 * @param {function} progressCallback 
 * @param {function} completeCallback 
 * @param {function} errorCallback 
 */
var PhotoMosaic = function(canvas,startCallback,progressCallback,completeCallback,errorCallback){
    
    var width = 0, height = 0, progress = 0;
    
    /**
     * Start rendering.
     * "start" function takes the image to be rendered as an argument and start rendering.
     * During the rendering process, calls the proper callback functions to inform UI. 
     * 
     * @param {Image} image 
     */
    async function start(image){  
        progress = 0;

        //Calculate the photomosaic's width and height, row and column numbers
        var rowCount = Math.ceil(image.height / TILE_HEIGHT);
        var colCount = Math.ceil(image.width / TILE_WIDTH);
    
        width = colCount*TILE_WIDTH;
        height = rowCount*TILE_HEIGHT;

        //Get the canvas context, clear it and initialize another canvas to find each tile's color 
        var canvasContext = canvas.getContext("2d");
        canvasContext.clearRect(0,0,canvas.width,canvas.height);

        var colorRecognizerCanvas = document.createElement('CANVAS');
        colorRecognizerCanvas.width = TILE_WIDTH;
        colorRecognizerCanvas.height = TILE_HEIGHT;

        var colorRecognizerContext = colorRecognizerCanvas.getContext("2d");
        
        //Start rendering
        startCallback(this);

        for(let row = 0; row < rowCount; row++){
    
            var rowColors = [];
            
            //# Find the each tile's color on this row
            for(var col = 0; col < colCount; col++){
                colorRecognizerContext.drawImage(image, col*TILE_WIDTH, row*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, 0, 0, TILE_WIDTH, TILE_HEIGHT)
                var color = getAverageColor(colorRecognizerContext.getImageData(0,0,TILE_WIDTH,TILE_HEIGHT));
                rowColors.push(color);
            }
            
            //# Fetch the each tile's SVG on this row
            try{
                var rowImages = await parseRow(rowColors) //## The function will wait until all tiles have completely been fetched on this row
                
                //## Draw each tile on this row
                for(let col = 0; col < rowImages.length; col++){
                    canvasContext.drawImage(rowImages[col],col*TILE_WIDTH,row*TILE_HEIGHT,TILE_WIDTH,TILE_HEIGHT);
                }
                
                progress = Math.floor(((row+1) * 100)/rowCount);

            }catch(e){
                errorCallback(this);
                return;
            }

            progressCallback(this);
        }

        completeCallback(this);
    }

    /**
     * Fetch the SVGs of an array of colors
     * "parseRow" takes an array of colors as an argument and returns a Promise.
     * Fetches each color's SVG and resolves the promise with fetched images. 
     * 
     * @param {Array} colors 
     * @return {Promise}
     */
    function parseRow(colors){
        return new Promise((resolve, reject) => {
             
            let totalFetched = 0; //how many colors have been successfully fetched
            var fetchedImages = new Array(colors.length);
            
            for(let col = 0; col < colors.length; col++){
                
                let retry = 0;
                let img = new Image();

                //A color has successfully been fetched.
                img.onload = function(e) {
                    fetchedImages[col] = e.target;
                    totalFetched++;
                        
                    if(totalFetched === colors.length) //# Resolve the promise if all given colors are fetched
                        resolve(fetchedImages);
                }

                //Something went wrong
                img.onerror = function(e){
                    if(retry > 2){ 
                        //# Two tries failed. Reject the promise. You can increase this number if you want to try to fetch a color more than 2 times.
                        reject(new Error('SVG fetch error'));
                    }
                    else{ 
                        //# Re-try to fetch the color
                        img.src = "#";
                        img.src = "color/"+colors[col];
                        retry++;
                    }
                }

                img.src = "color/"+colors[col];
            }
        });
    }

    /**
     * Find the average color of the given data
     * 
     * @param {ImageData} tileData 
     * @return {String}
     */
    function getAverageColor(tileData){
        var length = tileData.data.length, size = 5, i = -4,count = 0;
        var rgb = {r:0, g:0, b:0};

        while((i += size * 4) < length) {
            rgb.r += tileData.data[i];
            rgb.g += tileData.data[i+1];
            rgb.b += tileData.data[i+2];
            count++;
        }
    
        rgb.r = Math.floor(rgb.r/count);
        rgb.g = Math.floor(rgb.g/count);
        rgb.b = Math.floor(rgb.b/count);
    
        return ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
    }

    /**
     * Return the photomosaic's width
     * 
     * @return {int}
     */
    function getWidth(){
        return width;
    }

    /**
     * Return the photomosaic's height
     * 
     * @return {int}
     */
    function getHeight(){
        return height;
    }

    /**
     * Return the current progress
     * 
     * @return {int}
     */
    function getProgress(){
        return progress;
    }

    return {
        start,
        getWidth,
        getHeight,
        getProgress
    }
};
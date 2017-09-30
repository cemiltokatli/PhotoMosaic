window.onload = app;
var mosaicCreator;

/**
 * Initialize the application.
 * The "app" function is called when the document has been completely loaded.
 * Adds event listeners, sets up the dropzone for uploading a file by dragging and creates an instance of the PhotoMosaic library.
 */
function app(){
    //Set up the dropzone
    var dropZone = document.querySelector('#dropzone input');
    
    dropZone.addEventListener('dragenter',function(e){
        e.target.parentNode.classList.add('active');
        e.preventDefault();
    });
    
    dropZone.addEventListener('dragover',function(e){
        e.preventDefault();
    });
    
    dropZone.addEventListener('dragleave',function(e){
        e.target.parentNode.classList.remove('active');
        e.preventDefault();
    });

    dropZone.addEventListener('drop',function(e){
        e.target.parentNode.classList.remove('active');

        //# A file has been dropped, load the file
        loadFile(e.dataTransfer.files[0]);

        e.preventDefault();
    })

    //Listen to the change event of the file selector
    dropZone.addEventListener('change',function(e){

        //# A file has been chosen, load the file
        loadFile(e.target.files[0]);

        e.target.value = "";
    });

    //Listen to the click events of the close buttons on the result window
    var closeButtons = document.querySelectorAll(".message .close");
    for(var i = 0; i < closeButtons.length; i++){
        closeButtons[i].addEventListener('click',hideResult);
    }

    //Initialize the PhotoMosaic creator
    var drawArea = document.getElementById('drawArea');
    mosaicCreator = PhotoMosaic(drawArea,mosaicStarted,mosaicProgressChanged,mosaicCompleted,mosaicFailed);
}

/**
 * Load an image file.
 * The "load" function is called when a user chooses or drops a file.
 * Loads the image file, shows the result window (the window that shows the composited photomosaic) and starts rendering. Shows an error message with an alert if something goes wrong.
 * 
 * @param {File} file 
 */
function loadFile(file){

    if(!file.type.match('image.*')){
        alert('This is not an image');
        return;
    }
    
    showResult();
    changeResultStatus('LOADING');

    //Read the file
    var reader = new FileReader();
    reader.addEventListener('load',function(e){

        var image = new Image();
        image.src = e.target.result;
        image.onload = function(){

            changeResultStatus('PROCESSING');
            changeProgress(0);

            //# Start rendering
            mosaicCreator.start(image);
        }
        image.onerror = function(){
            hideResult();
            alert('The image could not be loaded');
        }
    });
    reader.readAsDataURL(file);
}

/**
 * Show the result window.
 */
function showResult(){
    document.querySelector('#result .content').style.width = "500px";
    document.querySelector('#result .content').style.height = "500px";
    document.querySelector('#result .content canvas').style.display = 'none';
    document.getElementById('result').style.display = 'flex';
}

/**
 * Close the result window
 */
function hideResult(){
    document.getElementById('result').style.display = 'none';
}

/**
 * Change the status message on the result window.
 * 
 * @param {String} status 
 */
function changeResultStatus(status){

    var messages =  document.querySelectorAll("#result .message");
    for(var i = 0; i < messages.length; i++){
        messages[i].style.display = 'none';
    }

    switch(status){
        case 'LOADING':
            document.querySelector("#result .loading").style.display = 'flex';
            break;
        case 'PROCESSING':
            document.querySelector("#result .processing").style.display = 'flex';
            break;
        case 'SUCCESS':
            document.querySelector("#result .success").style.display = 'flex';
            break;   
        case 'ERROR':
            document.querySelector("#result .error").style.display = 'flex';
            break;
    }
}

/**
 * Update the progress on the result window
 * 
 * @param {int} value 
 */
function changeProgress(value){
    document.querySelector("#result .processing .progress").innerText = value + '%';   
}

//PhotoMosaic callbacks

/**
 * Rendering started.
 * "mosaicStarted" is called when the rendering is first started.
 * Resizes the canvas to fit the rendering photomosaic.
 * 
 * @param {Object} data 
 */
function mosaicStarted(data){
    var width = data.getWidth();
    var height = data.getHeight();

    document.querySelector('#result .content').style.width = width+"px";
    document.querySelector('#result .content').style.height = "unset";
    document.querySelector('#result .content canvas').width = width;
    document.querySelector('#result .content canvas').height = height;
    document.querySelector('#result .content canvas').style.display = 'block';
}

/**
 * Progress changed.
 * 
 * @param {Object} data 
 */
function mosaicProgressChanged(data){
    changeProgress(data.getProgress());
    document.title = document.title.replace(/\d+\%/,'')+" "+data.getProgress()+"%";
}

/**
 * Rendering successfully completed.
 * 
 * @param {Object} data 
 */
function mosaicCompleted(data){
    changeResultStatus('SUCCESS');
    document.title = document.title.replace(/\d+\%/,'');
}

/**
 * Rendering failed.
 * 
 * @param {Object} data 
 */
function mosaicFailed(data){
    changeResultStatus('ERROR');
    document.title = document.title.replace(/\d+\%/,'');
}
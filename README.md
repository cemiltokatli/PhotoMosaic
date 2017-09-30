## Photo Mosaic Generator
A JavaScript app that generates a photomosaic of an image.

## How does it work?
1. A user selects a local image file.

2. The app loads that image, divides the image into tiles, computes the average color of each tile, fetches each tile from the server, and composites the results into a photomosaic of the original image.

3. The composited photomosaic is rendered a complete row at a time from the top row to the bottom row. (a user never sees a row with some completed tiles and some incomplete).

4. The library uses Promises so it is asynchronous and can render multiple images at the same time.

 
## Usage
The library files are `PhotoMosaic.js` and `PhotoMosaic5.js`. They both produce the exactly same results. The only difference between them is that `PhotoMosaic.js` is based on old module pattern while `PhotoMosaic5` uses new `class` structure coming with EcmaScript 2015.

`server.js` is the server file that creates an SVG for each given color. It responses to each GET request in the form of `color/4286f4`. Composited photomosaic consists of those SVGs.


## Demo
Due to hosting limitations, rendering is so slow. I'd recommend you to try it on your local or on a server.

[cemiltokatli.com/photomosaic](https://cemiltokatli.com/photomosaic)


## Running the Application
### Download the project
Download or clone the project using following command:

```
$ git clone https://github.com/cemiltokatli/PhotoMosaic.git
```


### Start the server
Start the server using following command:

```
$ npm start
```

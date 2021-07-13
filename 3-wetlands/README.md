## 01_generate_AOI.js
Compute an area of interest (AOI) based on height to the nearest drainage (HAND).
```javascript
var aoi = ee.Image('projects/mapbiomas-workspace/AUXILIAR/CERRADO/c6-wetlands/input_masks/aoi_wetlands_c6');
Map.addLayer(aoi, {palette: ['white', 'blue', 'green'], min:0, max:2}, 'aoi');
```
[Link to script](https://code.earthengine.google.com/a5e1780d5f431ec8cb09a4b8bb8a4a96)

## 02_generate_waterFreq.js
Compute monthly water frequency (from 1985 to 2019).
```javascript
// plot water frequency from GT Água
var wFreq= ee.Image('projects/mapbiomas-workspace/AUXILIAR/CERRADO/c6-wetlands/input_masks/waterFreq_CERRADO_1985_2019');
Map.addLayer(wFreq, {palette: ['blue', 'green', 'yellow', 'orange', 'red'], min:1, max:300}, 'water freq.');
```
[Link to script](https://code.earthengine.google.com/3521035a5b4f4e7f1b7b4c54e89bd5bc)

## 03_generate_stablePixels.js
Compute stable pixels over all the time-series (1985-2019) from collection 5 and filter them using reference data.
```javascript
// plot stable pixels
var stable = ee.Image('projects/mapbiomas-workspace/AUXILIAR/CERRADO/c6-wetlands/input_masks/stablePixels_C5');

var palettes = require('users/mapbiomas/modules:Palettes.js');
var vis = {
    'min': 0,
    'max': 45,
    'palette': palettes.get('classification5')
    };
        
Map.addLayer(stable, vis, 'stable pixels');
```
[Link to script](https://code.earthengine.google.com/4f4f5fb572256caddeae76194a3de6bc)

## 04_generate_trainingMask.js
Perform a selection of pixels with a high probability to be wetlands in Cerrado and blend with stable samples from collection 5. For this, we applied the following spatio-temporal filters:
1. Monthly frequency of water among 3 and 100 from 1985 to 2019.
2. HAND equal or less than 15 meters.
3. SLOPE equal or less than 10.
4. Potential wetlands needs to be classified as grassland or savanna into collection 5.
5. Filter potential wetlands by using reference data.
```javascript
// plot trainingMask
var trainingMask = ee.Image('projects/mapbiomas-workspace/AUXILIAR/CERRADO/c6-wetlands/input_masks/trainingMask_wetlands_c6');

var palettes = require('users/mapbiomas/modules:Palettes.js');
var vis = {
    'min': 0,
    'max': 45,
    'palette': palettes.get('classification5')
    };
    
Map.addLayer(trainingMask, vis, 'trainingMask');
```
[Link to script](https://code.earthengine.google.com/f290a31a660ace81ed656994dbee7757)

## 05_computeArea_byRegion.js
Compute area *(squared-kilometer)* for each class in each classification region. These calculations are used as input in next steps to balance training samples.

## 06_samplePoints.js
Sort 5,000 sample points over stable pixels distributed proportionally to each class area for each region (x38). From this, reserve 10% for potential wetlands and 10% for unstable class.
```javascript
// plot sample points
var samplePoints = ee.FeatureCollection('projects/mapbiomas-workspace/AMOSTRAS/Cerrado/col6/wetlands/samples_v1/samples_wetland_col6_v1');
Map.addLayer(samplePoints, {}, 'samplePoints');
```
[Link to script](https://code.earthengine.google.com/3581103c13bfee14310b66930e23e32a)




## Classification schema:
![alt text](https://github.com/musx/mapbiomas-cerrado-col6/blob/main/3-wetlands/www/wetlands%20-%20c6%20-%20color.png?raw=true)

## Step01_stableMask.js
Compute stable pixels over all the time-series (1985-2019) from collection 5 and filter them using reference data.
```javascript
// plot stable pixels
var stableSamples = ee.Image('projects/mapbiomas-workspace/AUXILIAR/CERRADO/CE_amostras_estaveis85a19_col5_v2');

var palettes = require('users/mapbiomas/modules:Palettes.js');
var vis = {
    'min': 0,
    'max': 45,
    'palette': palettes.get('classification5')
    };
    
Map.addLayer(stableSamples, vis, 'stableSamples'); 
```
[Link to script](https://code.earthengine.google.com/8f113e6c88c20fa7cf10025a61010354)

## Step02_calcArea.js
Compute area (*squared-kilometer*) for each class in each classification region. These calculations are used as input in next steps to balance training samples.

## Step03_samplePoints.js
Sort 7,000 sample points over stable pixels distributed proportionally to each class area for each region (x38).
```javascript
// plot sample points
var samplePoints = ee.FeatureCollection('projects/mapbiomas-workspace/AMOSTRAS/Cerrado/col6/samples_v4/samples_col6_CERRADO_v4');
Map.addLayer(samplePoints, {}, 'samplePoints');
```
[Link to script](https://code.earthengine.google.com/c14e10f0531238429014ab0fb21fcb7d)

## Step04b_trainingSamples.py
Extract spectral signatures for each year from Landsat mosaics and build training dataset. 
```javascript
// plot a sample of training dataset (one region and one year)
var trainingPoints = ee.FeatureCollection('projects/mapbiomas-workspace/AMOSTRAS/Cerrado/col6/training_v4/train_col_6_CERRADO_reg26_ano_2020_4');
Map.addLayer(trainingPoints, {}, 'trainingSamples');
```
[Link to script](https://code.earthengine.google.com/a93519bea0d3c0ceefd7b7bff27935b5)

## Classification schema:
![alt text](https://github.com/musx/mapbiomas-cerrado-col6/blob/main/2-general-map/www/Collection%206.png?raw=true)

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
```

## Step02_calcArea.js
Compute area (*squared-kilometer*) for each class in each classification region. These calculations are used as input in next steps to balance training samples.

## Step02_calcArea.js
Compute area (*squared-kilometer*) for each class in each classification region. These calculations are used as input in next steps to balance training samples.

## Step03_samplePoints.js
Sort 344,800 sample points over stable pixels. Sample points were stratified by region  

## Classification schema:
![alt text](https://github.com/musx/mapbiomas-cerrado-col6/blob/main/2-general-map/www/Collection%206.png?raw=true)

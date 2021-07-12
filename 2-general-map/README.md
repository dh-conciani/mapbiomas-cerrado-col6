## Step 1
Compute stable pixels over all the time-series (1985-2019) from collection 5 and filter them using reference data.
```javascript
// plot stable samples
var stableSamples = ee.Image('projects/mapbiomas-workspace/AUXILIAR/CERRADO/CE_amostras_estaveis85a19_col5_v2');

var palettes = require('users/mapbiomas/modules:Palettes.js');
var vis = {
    'min': 0,
    'max': 45,
    'palette': palettes.get('classification5')
};


```


## Classification schema:
![alt text](https://github.com/musx/mapbiomas-cerrado-col6/blob/main/2-general-map/www/Collection%206.png?raw=true)

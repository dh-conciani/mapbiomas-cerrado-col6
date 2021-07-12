// integrate wetlands with collection 6 
// write to: dhemerson.costa@ipam.org.br

// read regions
var regions = ee.Image('projects/mapbiomas-workspace/AUXILIAR/CERRADO/cerrado_regioes_c6_raster');

// select regions to be updated
var region16 = regions.updateMask(regions.eq(16));
var region35 = regions.updateMask(regions.eq(35));
var region36 = regions.updateMask(regions.eq(36));
var reg = region16.blend(region35).blend(region36);

// define directories
var dir = 'projects/mapbiomas-workspace/COLECAO6/classificacao-test/';
var v52 = 'CERRADO_col6_wetlands_gapfill_incid_temporal_spatial_freq_v52';
var v55 = 'CERRADO_col6_wetlands_gapfill_incid_temporal_spatial_freq_v55';
var file_out = 'CERRADO_col6_wetlands_gapfill_incid_temporal_spatial_freq_v56';

// import mapbiomas palette
var palettes = require('users/mapbiomas/modules:Palettes.js');
var vis = {
    'min': 0,
    'max': 45,
    'palette': palettes.get('classification5')
};

// list years to be integrated
var yearsList = ['1985', '1986', '1987', '1988', '1989',
                 '1990', '1991', '1992', '1993', '1994',
                 '1995', '1996', '1997', '1998', '1999',
                 '2000', '2001', '2002', '2003', '2004',
                 '2005', '2006', '2007', '2008', '2009',
                 '2010', '2011', '2012', '2013', '2014',
                 '2015', '2016', '2017', '2018', '2019',
                 '2020'];

// create empty recipe 
var recipe = ee.Image([]);

// perform integration 
yearsList.forEach(function(process_year) {
  // read collection 6 for the year i
  var v52_i = ee.Image(dir + v52).select('classificationWet_' + process_year);
  Map.addLayer(v52_i.select('classificationWet_2020'), vis, 'old');


  // read wetlands for the year i
  var v55_i = ee.Image(dir + v55).select('classificationWet_' + process_year);
  
  // clip v55 to regions of interest
  var temp = v55_i.updateMask(reg);
  
  // blend upper v52
  var integration_i = v52_i.blend(temp);

  // add band
  recipe = recipe.addBands(integration_i);
});

// print result
print (recipe);
Map.addLayer(recipe.select('classificationWet_2020'), vis, 'preview');

// export data
Export.image.toAsset({
    'image': recipe,
    'description': file_out,
    'assetId': dir + file_out,
    'pyramidingPolicy': {
        '.default': 'mode'
    },
    'region': recipe.geometry(),
    'scale': 30,
    'maxPixels': 1e13
});

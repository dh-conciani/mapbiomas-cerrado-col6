// corrigir florestas no sul de são paulo 
// transforma tudo que for savana e estiver dentro das geometrias para floresta

// import mapbiomas palette
var palettes = require('users/mapbiomas/modules:Palettes.js');
var vis = {
    'min': 0,
    'max': 45,
    'palette': palettes.get('classification5')
};

// input
var data = ee.Image('projects/mapbiomas-workspace/COLECAO6/classificacao-test/CERRADO_col6_final_v8');

// anos
var yearsList = ['1985', '1986', '1987', '1988', '1989',
                 '1990', '1991', '1992', '1993', '1994',
                 '1995', '1996', '1997', '1998', '1999',
                 '2000', '2001', '2002', '2003', '2004',
                 '2005', '2006', '2007', '2008', '2009',
                 '2010', '2011', '2012', '2013', '2014',
                 '2015', '2016', '2017', '2018', '2019',
                 '2020'];
                 
// create an empty recipe
var remmaped_collection = ee.Image([]);

// função para corrigir por geometria
yearsList.forEach(function(process_year) {
  var image_i = data.select(['classification_' + process_year]);
  image_i = image_i.remap([3, 4, 11, 12, 15, 19, 21, 25, 33],
                          [3, 4, 11, 12, 21, 21, 21, 25, 33]);
  
  var image_i_geo;
  image_i_geo = image_i.remap([3, 4, 11, 12, 15, 19, 25, 33],
                              [3, 3, 11, 12, 21, 21, 25, 33]);
                              
  image_i_geo = image_i_geo.clip(geometry);
  image_i_geo = image_i_geo.updateMask(image_i_geo.eq(3));

  // blend into data
  image_i = ee.ImageCollection([image_i, image_i_geo]).mosaic();

  // add band
  remmaped_collection = remmaped_collection
                          .addBands(image_i.select(['remapped'],
                          ['classification_' + process_year]));
});

  Map.addLayer(remmaped_collection.select(['classification_2020']), vis, 'corrected' , true);
  Map.addLayer(data.select(['classification_2020']), vis, 'original' , true);
  Map.addLayer(remmaped_collection.geometry(), {}, 'geo', false);

  Export.image.toAsset({
    'image': remmaped_collection,
    'description': 'CERRADO_col6_final_v9',
    'assetId': 'projects/mapbiomas-workspace/COLECAO6/classificacao-test/CERRADO_col6_final_v9',
     'pyramidingPolicy': {
        '.default': 'mode'
    },
    'region': remmaped_collection.geometry(),
    'scale': 30,
    'maxPixels': 1e13
});

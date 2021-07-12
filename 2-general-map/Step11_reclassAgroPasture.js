// final step of general map 
// dissolve pasture (15) and agriculture (19) to the mosaic of agriculture and pasture (21)

var version = 8;

// imports
var dir = 'projects/mapbiomas-workspace/COLECAO6/classificacao-test/';
//var dir = 'users/dhconciani/test/';
var prefixo = 'CERRADO_col6_';
var version_in = 'wetlandsv6_generalv8_rect';
var version_out = 'final_v' + version;

// read collection 6 
var collection = ee.Image(dir + prefixo + version_in);

// list years
var yearsList = ['1985', '1986', '1987', '1988', '1989',
                 '1990', '1991', '1992', '1993', '1994',
                 '1995', '1996', '1997', '1998', '1999',
                 '2000', '2001', '2002', '2003', '2004',
                 '2005', '2006', '2007', '2008', '2009',
                 '2010', '2011', '2012', '2013', '2014',
                 '2015', '2016', '2017', '2018', '2019',
                 '2020'];
                 
// import mapbiomas palette
var palettes = require('users/mapbiomas/modules:Palettes.js');
var vis = {
    'min': 0,
    'max': 45,
    'palette': palettes.get('classification5')
};

// create an empty recipe
var remmaped_collection = ee.Image([]);

// remap classes
yearsList.forEach(function(process_year){
  // read image for the year i
  var image_i = collection.select(['classification_' + process_year]);
  // remap image i
  image_i = image_i.remap([3, 4, 11, 12, 15, 19, 25, 33],
                          [3, 4, 11, 12, 21, 21, 25, 33]);
                          
  // correct by geometry [wet to grassland]
  // convert 
  var image_i_geo;
  image_i_geo = image_i.remap([3, 4, 11, 12, 15, 19, 25, 33],
                              [3, 4, 12, 12, 21, 21, 25, 33]);
      
      image_i_geo = image_i_geo.clip(geometry);
      image_i_geo = image_i_geo.updateMask(image_i_geo.eq(12));

  // blend into data
  image_i = ee.ImageCollection([image_i, image_i_geo]).mosaic();

  // correct by geometry [wet to savanna]
    var image_i_geo2;
    image_i_geo2 = image_i.remap([3, 4, 11, 12, 15, 19, 25, 33],
                                  [3, 4, 4, 12, 21, 21, 25, 33]);
                                  
    image_i_geo2 = image_i_geo2.clip(geometry2);
    image_i_geo2 = image_i_geo2.updateMask(image_i_geo2.eq(4));

  // blend into data
  image_i = ee.ImageCollection([image_i, image_i_geo2]).mosaic();
  
  // add band
  remmaped_collection = remmaped_collection
                          .addBands(image_i.select(['remapped'],
                          ['classification_' + process_year]));
  });
  
  print ('adjusted collection', remmaped_collection);
  Map.addLayer(remmaped_collection.select(['classification_1985']), vis, 'remap' , true);

  remmaped_collection = remmaped_collection
            .set('collection', '6')
            .set('version', version)
            .set('biome', 'CERRADO');
            
  // clip to geometry
  remmaped_collection = remmaped_collection.clip(geometry3);
  //Map.addLayer(remmaped_collection.geometry(), vis, 'remap geo' , true);

  // export to mapbiomas-worskpace asset
  Export.image.toAsset({
    'image': remmaped_collection,
    'description': prefixo + version_out,
    'assetId': dir + prefixo + version_out,
     'pyramidingPolicy': {
        '.default': 'mode'
    },
    'region': remmaped_collection.geometry(),
    'scale': 30,
    'maxPixels': 1e13
});

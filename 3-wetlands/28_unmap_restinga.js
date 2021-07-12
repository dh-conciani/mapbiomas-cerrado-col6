// convert wetlands from maranhão to 'restinga' 
// dhemerson.costa@ipam.org.br

// define input parameters
var dir = 'projects/mapbiomas-workspace/COLECAO6/classificacao-test/';
var col6_pre = 'CERRADO_col6_gapfill_incid_temporal_spatial_freq_v8';
var col6_post = 'CERRADO_col6_wetlandsv6_generalv8';
var file_out = 'CERRADO_col6_wetlandsv6_generalv8_rect';

// import SRTM 
var srtm30 = ee.Image('USGS/SRTMGL1_003').select('elevation');

// import regions and select only region 1
var regions = ee.Image('projects/mapbiomas-workspace/AUXILIAR/CERRADO/cerrado_regioes_c6_raster');
    regions = regions.updateMask(regions.eq(1));
    
// import IBGE's coastlines 
var coastline = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/CERRADO/c6-wetlands/input_masks/coastline_ibge2017');

// import pallete
var palettes = require('users/mapbiomas/modules:Palettes.js');
var vis = {
    'min': 0,
    'max': 45,
    'palette': palettes.get('classification5')
};

// define rule
var elevation = srtm30.updateMask(regions.eq(1).and(srtm30.lt(100)));

// compute coastline distance image
var distance = coastline.distance({searchRadius: 80000, maxError: 30})
               .updateMask(regions);

// create empty recipe
var recipe = ee.Image([]);

// list of years to be processed
var years_list = ['1985', '1986', '1987', '1988', '1989', '1990',
                  '1991', '1992', '1993', '1994', '1995', '1996',
                  '1997', '1998', '1999', '2000', '2001', '2002',
                  '2003', '2004', '2005', '2006', '2007', '2008',
                  '2009', '2010', '2011', '2012', '2013', '2014',
                  '2015', '2016', '2017', '2018', '2019', '2020'];

// for each year
years_list.forEach(function(process_year){
  // import MapBiomas 6 - all + wetlands
  var post = ee.Image(dir + col6_post)
                  .select('classification_' + process_year);
                  
  // import collection 6 - without wetlands
   var pre = ee.Image(dir + col6_pre)
                  .select('classification_' + process_year);
  
               
  // extract wetlands wrong classified 
  var extracted = post.updateMask(elevation);
      extracted = extracted.updateMask(distance);
      extracted = extracted.updateMask(extracted.eq(11));
    
  // remap extracted to original classification data
  var original = pre.updateMask(extracted);
                                
  // blend corrections to map
     post = post.blend(original);
    
  // insert into recipe
     recipe = recipe.addBands(post);
});

Map.addLayer(recipe.select(['classification_2020']), vis, 'output');

// export as asset 
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

print (recipe)
// plot map
//Map.addLayer(elevation.updateMask(wetlands), {palette:['blue', 'yellow', 'red'], min:0, max: 100}, 'srtm30');
//Map.addLayer(wetlands, vis, 'wetlands');
//Map.addLayer(distance, {palette:['green','yellow', 'orange', 'red', 'purple'], min:0, max:80000}, 'distance');
//Map.addLayer(coastline, {}, 'coastline');
//Map.addLayer(extracted, vis, 'extracted');

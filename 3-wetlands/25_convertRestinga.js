// convert wetlands from maranhão to 'restinga' 
// dhemerson.costa@ipam.org.br

// define input parameters
var dir = 'projects/mapbiomas-workspace/COLECAO6/classificacao-test/';
var file_in = 'CERRADO_col6_wetlands_gapfill_incid_temporal_spatial_freq_v54';
var file_out = 'CERRADO_col6_wetlands_gapfill_incid_temporal_spatial_freq_restinga_v54';

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
    'max': 34,
    'palette': palettes.get('classification2')
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
  // import MapBiomas 6 - wetlands collection
  var wetlands = ee.Image(dir + file_in)
                .select('classificationWet_' + process_year);
               
  // extract wetlands that satisfies kernel distance and elevation criteria
  var extracted = wetlands.updateMask(elevation);
      extracted = extracted.updateMask(distance);
      extracted = extracted.updateMask(extracted.eq(11));
    
  // remap wetlands to restinga (temporary byte 99)
     extracted = extracted.remap([11], 
                                 [99]);
                                
  // blend restinga upper wetlands 
     wetlands = wetlands.blend(extracted);
    
  // insert into recipe
     recipe = recipe.addBands(wetlands);
});

Map.addLayer(recipe.geometry())
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

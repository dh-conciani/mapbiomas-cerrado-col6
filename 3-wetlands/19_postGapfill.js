// GAPFILL 
// define geometry (raw extent of cerrado)
var geometry = /* color: #98ff00 */ee.Geometry.Polygon(
        [[[-42.306314047317365, -1.7207103925816054],
          [-44.415689047317365, -1.4571401339250152],
          [-54.259439047317365, -10.451581892159153],
          [-61.202798422317365, -10.624398320896237],
          [-61.202798422317365, -14.739254413487872],
          [-57.775064047317365, -18.027281070807337],
          [-59.005532797317365, -23.85214541157912],
          [-48.370767172317365, -25.84584109333063],
          [-40.548501547317365, -17.52511660076233],
          [-40.636392172317365, -2.774571568871124]]]);

// version 
var version = 54;
var vesion_out = '54';
var VeightConnected = true;
var prefixo_out = 'CERRADO_col6_wetlands_gapfill_v';
var dircol6 = 'projects/mapbiomas-workspace/COLECAO6/classificacao-test';
var dirout = 'projects/mapbiomas-workspace/COLECAO6/classificacao-test/';

var ano = 2020;
var bioma = "CERRADO";

var visParMedian2 = {'bands':['median_swir1','median_nir','median_red'], 'gain':[0.08, 0.06,0.2],'gamma':0.5 };
var dirasset = 'projects/nexgenmap/MapBiomas2/LANDSAT/mosaics';
var dirasset7 = 'projects/nexgenmap/MapBiomas2/LANDSAT/mosaics-landsat-7';
var visParMedian2 = {bands: ['swir1_median', 'nir_median', 'red_median'],gain: [0.08, 0.06, 0.2],gamma: 0.85};


    var mosaicoTotal = ee.ImageCollection(dirasset)
                        .filterMetadata('biome', 'equals', bioma)
                        .filterMetadata('year', 'equals', ano)
                        .mosaic();
    Map.addLayer(mosaicoTotal, visParMedian2, 'Img_Year_' +ano, false);


////*************************************************************
// Do not Change from these lines
////*************************************************************

var palettes = require('users/mapbiomas/modules:Palettes.js');
var vis = {
    'min': 0,
    'max': 34,
    'palette': palettes.get('classification2')
};

var image = ee.ImageCollection(dircol6)
            .filterMetadata('version', 'equals', version)
            .filterMetadata('collection', 'equals', '6')
            .filterMetadata('biome', 'equals', bioma)
            .min();
            
image = image.mask(image.neq(0));
print(image);

var years = [
    1985, 1986, 1987, 1988,
    1989, 1990, 1991, 1992,
    1993, 1994, 1995, 1996,
    1997, 1998, 1999, 2000,
    2001, 2002, 2003, 2004,
    2005, 2006, 2007, 2008,
    2009, 2010, 2011, 2012,
    2013, 2014, 2015, 2016,
    2017, 2018, 2019, 2020];

/**
 * User defined functions
 */
var applyGapFill = function (image) {

    // apply the gap fill form t0 until tn
    var imageFilledt0tn = bandNames.slice(1)
        .iterate(
            function (bandName, previousImage) {

                var currentImage = image.select(ee.String(bandName));

                previousImage = ee.Image(previousImage);

                currentImage = currentImage.unmask(
                    previousImage.select([0]));

                return currentImage.addBands(previousImage);

            }, ee.Image(imageAllBands.select([bandNames.get(0)]))
        );

    imageFilledt0tn = ee.Image(imageFilledt0tn);

    // apply the gap fill form tn until t0
    var bandNamesReversed = bandNames.reverse();

    var imageFilledtnt0 = bandNamesReversed.slice(1)
        .iterate(
            function (bandName, previousImage) {

                var currentImage = imageFilledt0tn.select(ee.String(bandName));

                previousImage = ee.Image(previousImage);

                currentImage = currentImage.unmask(
                    previousImage.select(previousImage.bandNames().length().subtract(1)));

                return previousImage.addBands(currentImage);

            }, ee.Image(imageFilledt0tn.select([bandNamesReversed.get(0)]))
        );


    imageFilledtnt0 = ee.Image(imageFilledtnt0).select(bandNames);

    return imageFilledtnt0;
};

// get band names list 
var bandNames = ee.List(
    years.map(
        function (year) {
            return 'classificationWet_' + String(year);
        }
    )
);

// generate a histogram dictionary of [bandNames, image.bandNames()]
var bandsOccurrence = ee.Dictionary(
    bandNames.cat(image.bandNames()).reduce(ee.Reducer.frequencyHistogram())
);

print(bandsOccurrence);

// insert a masked band 
var bandsDictionary = bandsOccurrence.map(
    function (key, value) {
        return ee.Image(
            ee.Algorithms.If(
                ee.Number(value).eq(2),
                image.select([key]).byte(),
                ee.Image().rename([key]).byte().updateMask(image.select(0))
            )
        );
    }
);

// convert dictionary to image
var imageAllBands = ee.Image(
    bandNames.iterate(
        function (band, image) {
            return ee.Image(image).addBands(bandsDictionary.get(ee.String(band)));
        },
        ee.Image().select()
    )
);

// generate image pixel years
var imagePixelYear = ee.Image.constant(years)
    .updateMask(imageAllBands)
    .rename(bandNames);

// apply the gap fill
var imageFilledtnt0 = applyGapFill(imageAllBands);
var imageFilledYear = applyGapFill(imagePixelYear);

print (image);
Map.addLayer(image.select('classificationWet_'+ ano), vis, 'image',false);


Map.addLayer(imageFilledtnt0.select('classificationWet_' + ano), vis, 'filtered');

// write metadata
imageFilledtnt0 = imageFilledtnt0.set('vesion', '1');
print(imageFilledtnt0);

print(dirout+prefixo_out+vesion_out);

// export asset
Export.image.toAsset({
    'image': imageFilledtnt0,
    'description': prefixo_out+vesion_out,
    'assetId': dirout+prefixo_out+vesion_out,
    'pyramidingPolicy': {
        '.default': 'mode'
    },
    'region': geometry,
    'scale': 30,
    'maxPixels': 1e13
});

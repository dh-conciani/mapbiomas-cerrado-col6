// Extrair assinaturas espectrais dos pontos LAPIG usando o novos mosaicos (SR)
// Dhemerson Conciani - IPAM (dhemerson.costa@ipam.org.br)

// definir parametros
var biomeName = 'CERRADO';
var year = 2019;

// definir caminhos
var assetMosaics = 'projects/nexgenmap/MapBiomas2/LANDSAT/mosaics';
var assetScenes = 'projects/mapbiomas-workspace/AUXILIAR/landsat-mask';
var assetBiomes = 'projects/mapbiomas-workspace/AUXILIAR/biomas-raster-41';

// importar assets
// biomas
var biomes = ee.Image(assetBiomes);
// mosaicos
var collectionMosaics = ee.ImageCollection(assetMosaics);
// cenas
var collectionScenes = ee.ImageCollection(assetScenes)
    .filterMetadata('version', 'equals', '2');
// filtrar mosaicos para o Cerrado
var biomeCollection = collectionMosaics
    .filterMetadata('biome', 'equals', biomeName);
// filtrar mosaicos para o ano
biomeCollection = biomeCollection
    .filterMetadata('year', 'equals', year);
    
// pontos de validação LAPIG
// import Cerrado
var cerrado = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/biomas-2019')
                            .filterMetadata("Bioma", "equals", "Cerrado");

// import points
var points = ee.FeatureCollection('projects/mapbiomas-workspace/VALIDACAO/MAPBIOMAS_100K_POINTS_utf8')
            .filterBounds(cerrado);

// criar imagem unica (juntar cartas)
var medianImage = biomeCollection.median();
print (medianImage);

// Plotar imagem
Map.addLayer(medianImage,
    {
        bands: ['swir1_median', 'nir_median', 'red_median'],
        gain: [0.08, 0.06, 0.2],
        gamma: 0.85
    },
    biomeName + ' ' + String(year)
);

// extrair valores 
var featureCollectionMedian = medianImage
  .reduceRegions({
    collection:points,
    reducer:ee.Reducer.median(),
    scale:30,
    // crs,
    // crsTransform,
    tileScale:2
    });

// exportar
 Export.table.toDrive({
   collection:featureCollectionMedian,
   description:'extract_points' + '_' + year,
   folder: 'TEMP',
   //fileFormat: '',
});


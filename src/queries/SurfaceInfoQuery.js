//note; each query here represents an attempt an efficient single request for related information
//each query therefore could be tranformed into a restful api


 export function getSurfaceInfo(surfaceid){
   const query = [
     "CONSTRUCT",
     "{",
     "?expression <http://scta.info/property/hasManifestation> ?manifestation2 .",
     "?manifestation2 <http://scta.info/property/isOnSurface> ?surface2 .",
     "}",
     "WHERE",
     "{",
     "?manifestation <http://scta.info/property/isOnSurface> <" + surfaceid + "> .",
     "?manifestation <http://scta.info/property/structureType> <http://scta.info/resource/structureBlock> .",
     "?manifestation <http://scta.info/property/isManifestationOf> ?expression .",
     "?expression <http://scta.info/property/hasManifestation> ?manifestation2 .",
     "?manifestation2 <http://scta.info/property/isOnSurface> ?surface2 .",
     "?codex <http://scta.info/property/hasSurface> ?surface2 .",
     "}"
   ].join('');
   return query
 }
 export function getSurfaceInfoFromCanvasId(canvasid){
   const query = [
     "SELECT DISTINCT ?manifestation",
     "WHERE { ",
     "{",
     "?isurface <http://scta.info/property/hasCanvas> <" + canvasid + "> .",
     "?surface <http://scta.info/property/hasISurface> ?surface .",
     "?manifestation <http://scta.info/property/isOnSurface ?surface .",
     "?manifestation <http://scta.info/property/structureType> <http:///scta.info/resource/structureBlock> .",
     "}"
   ].join('');
   return query
 }

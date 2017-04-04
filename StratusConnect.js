/**
 * os-leaflet ; A [Leafletjs](http://leafletjs.com/) TileLayer to display Ordnance Survey
 *       data in your Leaflet map via the OS OpenSpace web map service.
 *
 * https://github.com/rob-murray/os-leaflet
 */
(function(root, factory) {
  // UMD for  Node, AMD or browser globals
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['leaflet', 'proj4leaflet'], factory);
  } else if (typeof exports === 'object') {
    // Node & CommonJS-like environments.
    var L = require('leaflet'); // eslint-disable-line vars-on-top
    require('proj4leaflet');

    module.exports = factory(L);
  } else {
    // Browser globals
    if (typeof window.L === 'undefined') {
      throw new Error('Leaflet missing');
    }
    root.returnExports = factory(root.L);
  }
})(this, function(L) {
  /* This is our namespace for StratusConnect on Leaflet js */
  L.StratusConnect = L.StratusConnect || {};
  L.StratusConnect.VERSION = '1.0.0';
  L.StratusConnect.CRS = L.extend(
    new L.Proj.CRS(
      'EPSG:27700',
      '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs',
      {
        // resolutions: [10000, 5000, 2500, 1000, 500, 200, 100, 50, 25, 10, 5, 2.5]
        // resolutions: [10, 5, 2.5, 1.25, 0.625, 0.3125, 0.15625]
        resolutions: [
          11.44,
          5.72,
          2.86,
          1.43,
          0.715,
          0.3575,
          0.17875,
          0.089375,
          0.0446875,
        ],
      }
    ),
    {
      distance: function(a, b) {
        return L.CRS.Earth.distance(a, b);
      },
    }
  );

  L.StratusConnect.LogoControl = L.Control.extend({
    options: {
      position: 'bottomleft',
    },

    onAdd: function() {
      var container = L.DomUtil.create('div', 'os-logo-control');
      var logoImage = L.DomUtil.create('img', '', container);
      logoImage.title = 'Powered by OS OpenSpace';
      logoImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAA7CAMAAAD4p6zTAAAAdVBMVEUAAABDPYxDPY1AQI9EPY5EPoxEPY3///9EPY3z8/iWkr+KhrhzbqrEB1FnYaJbVZtQSZR+erGinsb00d7Fwtv78PTwwdTQz+PTRX3IF1zc2+ro5/Gtqs25ttTig6jaZJLtssn44OnLJmfpor7lk7PPNnLWVYfBOrQkAAAAB3RSTlMAUJ8Qv8+vnqzJJAAAAmNJREFUeAHl14Vi2zAUheHyuVds5nD6/o84211YcsHj/aVA85lBd0P3T/S1nu7vxh5fiIyIP58wRA+PA/FApsHXagw9DEtBhvHV2FC/LM/U4Os19Hx3RwZzMtQTAnMSAxFjTvE5QaRkg4lUARRqkgDLaC6BVHWOhBToeo9qS4adU4JIsCJrB8I5Em0EmM5HxMIJV7ORFhGlXWRaRDHVtWN2MkJNI9GwjYlrBx9RFE2sgFjZwrUy6kgpJQit6/+6DjDfFySOZStFYEFQWEbUCisb59imYKbxtVrKw1wwVFtY14QISGcN15TCSHSkXEdAZI1t+h83EtYaholwSxxqahzj4uy1gk9P2BYe4jOxFZhJ9P0vRN1K1RenjIvWu2WJbblIME1wa+mYbM6Ape7DbqP1ZjtFpJYuEoc5WVV6aLB6pcyChKDrTP0m6LcwttBVEiAk3eYGY11dEMir0k9I8uUYWOpLAknuJVLypwB9aHqjsqNAHZYfI2IKZbH+GGEpWIrXA5HkSZCoKZzE7kCUWleLzE/EFM4hPyN6ZOslJE3EOCf6tj5C0UTFNaFX84kqm03oxS0R0USM/TWx+ewWQVZeETq7IQoKF6Fvu78k8hsCjoJ1GFvnizAxvSSOceiMSD5zpMbwEbgl0JI/Ax/x6iFC29XVWCW3RO4l2JCnAiir/JoInDvBkf/sm1R6cUlUWYAAWkcXqQZD673ebLMTsUmmblGkOwMKHNpV/cwvF9lILLPpayqnQlkiFbUNzlst91onZVXu1n/mzcH8kcD88cj8UdGPGJvNHyH2PT7MHKfOHy1/Axgmj2KBwwXnAAAAAElFTkSuQmCC';

      return container;
    },
  });

  /**
   * A custom Layer for Ordnance Survey OpenSpace service.
   * Note: An API key is needed, see OS website for details
   *
   */
  L.StratusConnect.TileLayer = L.TileLayer.WMS.extend({
    initialize: function(mapname, crs, options) {
      // (String, String, Object)

      L.TileLayer.WMS.prototype.initialize.call(
        this,
        'http://maps.southwark.gov.uk/connect/controller/mapping/getmap',
        {
          crs: L.StratusConnect.CRS,
          maxZoom: 14,
          minZoom: 0,
          opacity: 0.8,
          tileSize: 286, //286
        },
        options
      );

      this.wmsParams = {
        width: this.options.tileSize,
        height: this.options.tileSize,
        srs: 'epsg:27700',
        output: 'image/png',
        mapname: mapname,
      };
    },

    getAttribution: function() {
      return '&copy; ' +
        new Date().getFullYear() +
        " <a href='http://maps.southwark.gov.uk/connect/index.jsp?tooltip=yes'>Southwark Council</a>";
    },

    onAdd: function(map) {
      // if (map.options.attributionControl) {
      //   map.addControl(new L.StratusConnect.LogoControl());
      // }
      L.TileLayer.prototype.onAdd.call(this, map);
    },

    /**
   * Return a url for this tile.
   * Calculate the bbox for the tilePoint and format the wms request
   */
    getTileUrl: function(tilePoint) {
      // (Point, Number) -> String
      var resolutionMpp = this.options.crs.options.resolutions[tilePoint.z],
        tileSizeMetres = this.options.tileSize * resolutionMpp,
        tileBboxX0 = tileSizeMetres * (0.5 + tilePoint.x),
        tileBboxY0 = tileSizeMetres * (-0.5 - tilePoint.y); // TODO: Is there a missing transformation ? tilePoint appears to be topLeft in this config

      // service is a tile based wms format and only requires x0, y0 - ignore other points
      // this.wmsParams.BBOX = [tileBboxX0, tileBboxY0, 0, 0].join(',');
      this.wmsParams.x = tileBboxX0;
      this.wmsParams.y = tileBboxY0;
      // this.wmsParams.LAYERS = resolutionMpp;
      this.wmsParams.zoom = resolutionMpp * 286;

      return this._url + L.Util.getParamString(this.wmsParams); // eslint-disable-line no-underscore-dangle
    },
  });

  /*
   * Factory method to create a new StratusConnect tilelayer.
   *
   * @public
   * @param {string} apiKey Your API key for StratusConnect.
   * @param {string} apiUrl The URL of your site as provided to StratusConnect.
   * @param {object} options Any options to pass to the tilelayer.
   * @return {L.TileLayer} TileLayer for Ordnance Survey OpenSpace service.
   */
  L.StratusConnect.tilelayer = function(apiKey, apiUrl, options) {
    return new L.StratusConnect.TileLayer(apiKey, apiUrl, options);
  };

  return L.StratusConnect;
});

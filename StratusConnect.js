require("babel-polyfill");

(function(root, factory) {
  // UMD for  Node, AMD or browser globals
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["leaflet", "proj4leaflet"], factory);
  } else if (typeof exports === "object") {
    // Node & CommonJS-like environments.
    var L = require("leaflet"); // eslint-disable-line vars-on-top
    require("proj4leaflet");

    module.exports = factory(L);
  } else {
    // Browser globals
    if (typeof window.L === "undefined") {
      throw new Error("Leaflet missing");
    }
    root.returnExports = factory(root.L);
  }
})(this, function(L) {
  L.StratusConnect = L.StratusConnect || {};
  L.StratusConnect.VERSION = "0.0.3";
  L.StratusConnect.CRS = L.extend(
    new L.Proj
      .CRS(
      "EPSG:27700",
      "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs",
      {
        // resolutions: [10000, 5000, 2500, 1000, 500, 200, 100, 50, 25, 10, 5, 2.5]
        // resolutions: [10, 5, 2.5, 1.25, 0.625, 0.3125, 0.15625]
        // resolutions: [
        //   11.44,
        //   5.72,
        //   2.86,
        //   1.43,
        //   0.715,
        //   0.3575,
        //   0.17875,
        //   0.089375,
        //   0.0446875
        // ]
        resolutions: Array.from(new Array(12), (x, i) => 320 / Math.pow(2, i))
      }
    ),
    {
      distance: function(a, b) {
        return L.CRS.Earth.distance(a, b);
      }
    }
  );

  L.StratusConnect.TileLayer = L.TileLayer.WMS.extend({
    initialize: function(mapname, crs, options) {
      L.TileLayer.WMS.prototype.initialize.call(
        this,
        "http://maps.southwark.gov.uk/connect/controller/mapping/getmap",
        {
          crs: L.StratusConnect.CRS,
          maxZoom: 12,
          opacity: 0.8,
          tileSize: 286
        },
        options
      );

      this.wmsParams = {
        width: this.options.tileSize,
        height: this.options.tileSize,
        srs: "epsg:27700",
        output: "image/png",
        mapname: mapname
      };
    },

    getAttribution: function() {
      return (
        "&copy; " +
        new Date().getFullYear() +
        " <a href='http://maps.southwark.gov.uk/connect/index.jsp?tooltip=yes'>Southwark Council</a>"
      );
    },

    onAdd: function(map) {
      L.TileLayer.prototype.onAdd.call(this, map);
    },

    getTileUrl: function(tilePoint) {
      var resolutionMpp = this.options.crs.options.resolutions[tilePoint.z],
        tileSizeMetres = this.options.tileSize * resolutionMpp,
        tileBboxX0 = tileSizeMetres * (0.5 + tilePoint.x),
        tileBboxY0 = tileSizeMetres * (-0.5 - tilePoint.y);

      this.wmsParams.x = tileBboxX0;
      this.wmsParams.y = tileBboxY0;
      this.wmsParams.zoom = resolutionMpp * 286;

      return this._url + L.Util.getParamString(this.wmsParams);
    }
  });

  L.StratusConnect.tilelayer = function(apiKey, apiUrl, options) {
    return new L.StratusConnect.TileLayer(apiKey, apiUrl, options);
  };

  return L.StratusConnect;
});

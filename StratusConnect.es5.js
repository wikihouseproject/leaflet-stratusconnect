"use strict";

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

(function(root, factory) {
  // UMD for  Node, AMD or browser globals
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["leaflet", "proj4leaflet", "babel-polyfill"], factory);
  } else if (
    (typeof exports === "undefined"
      ? "undefined"
      : (0, _typeof3.default)(exports)) === "object"
  ) {
    // Node & CommonJS-like environments.
    var L = require("leaflet"); // eslint-disable-line vars-on-top
    require("proj4leaflet");
    require("babel-polyfill");

    module.exports = factory(L);
  } else {
    // Browser globals
    if (typeof window.L === "undefined") {
      throw new Error("Leaflet missing");
    }
    root.returnExports = factory(root.L);
  }
})(undefined, function(L) {
  L.StratusConnect = L.StratusConnect || {};
  L.StratusConnect.VERSION = "0.0.6";
  L.StratusConnect.CRS = L.extend(
    new L.Proj
      .CRS(
      "EPSG:27700",
      "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs",
      {
        resolutions: (0, _from2.default)(new Array(12), function(x, i) {
          return 320 / Math.pow(2, i);
        })
      }
    ),
    {
      distance: function distance(a, b) {
        return L.CRS.Earth.distance(a, b);
      }
    }
  );

  L.StratusConnect.TileLayer = L.TileLayer.WMS.extend({
    initialize: function initialize(mapname, crs, options) {
      L.TileLayer.WMS.prototype.initialize.call(
        this,
        "https://corsproxy.bitsushi.com/maps.southwark.gov.uk/connect/controller/mapping/getmap",
        {
          crs: L.StratusConnect.CRS,
          maxZoom: 12,
          minZoom: 2,
          opacity: 0.8,
          tileSize: 286,
          bounds: L.latLngBounds(
            L.latLng(51.38885, -0.64932),
            L.latLng(52.06954, 0.48703)
          )
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

    getAttribution: function getAttribution() {
      return (
        "&copy; " +
        new Date().getFullYear() +
        " <a href='http://maps.southwark.gov.uk/connect/index.jsp?tooltip=yes'>Southwark Council</a>"
      );
    },

    onAdd: function onAdd(map) {
      L.TileLayer.prototype.onAdd.call(this, map);
    },

    getTileUrl: function getTileUrl(tilePoint) {
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

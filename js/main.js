/*globals window, document, DatasetFilter, DatasetChart, _, jQuery, d3, ko*/

var DatavizTurismo;

;(function(global, document, $, d3, ko){

  'use strict';

  DatavizTurismo = global.DatavizTurismo = global.DatavizTurismo || {};

  DatavizTurismo.sliderOptions = {
    min:0,
    max:100,
    step:1,
    orientation:'vertical',
    tooltip:'show',
    handle:'round',
    selection:'after',
    formater:function(v){
      return DatavizTurismo.convertSliderValue(v)+'%';
    }
  };

  DatavizTurismo.$options = $('#options-selector label');

  DatavizTurismo.map;

  DatavizTurismo.$fullScreenBtb = $('#full-screen-btn');

  DatavizTurismo.bindings = {};

  var FilterOption = function(name, id, icon) {
    this.name = name;
    this.id = id;
    this.icon = icon;
  };

  DatavizTurismo.init = function () {
    //Init map
    DatavizTurismo.map = d3.datavizTurismo('map-container',$('#map-container').width(),DatavizTurismo.retrieveData);

    DatavizTurismo.$fullScreenBtb.on('click', DatavizTurismo.fullScreen);

    DatavizTurismo.$options.on('click',DatavizTurismo.changeFilter);

  };

  DatavizTurismo.changeFilter = function(e){
    DatavizTurismo.map.filter($(this).find('input').val());
  };

  DatavizTurismo.retrieveData = function(){
    d3.csv("data/entre-rios-turismo.csv", function(data) {
       DatavizTurismo.map.update(data);
    });
  };

  DatavizTurismo.fullScreen = function() {
    var el = document.documentElement,
        rfs =
          el.requestFullScreen ||
          el.webkitRequestFullScreen ||
          el.mozRequestFullScreen
    ;
    rfs.call(el);
  };

  DatavizTurismo.updateMap = function(cities) {
    var $filter = DatavizTurismo.$filter;
    DatavizTurismo.map.update(
      cities, $filter.val(), $filter.find(':selected').text()
    );
  };

})(window, document, jQuery, d3, ko);

window.onload = function() {
  DatavizTurismo.init();
};

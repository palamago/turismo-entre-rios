d3.datavizTurismo = function(containerId,width,cb) {

  //Init vars
  var height=window.innerHeight || document.body.clientHeight,
    centered,
    projection,
    path,
    mapa_svg,
    mainGroup,
    departamentos,
    provincias,
    legend,
    gran_buenos_aires,
    gran_buenos_aires_mesh,
    svg,
    scale,
    tooltip,
    ciudades,
    centered,
    zoom,
    entre_rios,
    ER_IDS = ["D08011",
      "D08014",
      "D08016",
      "D08005",
      "D08012",
      "D08007",
      "D08006",
      "D08008",
      "D08003",
      "D08018",
      "D08010",
      "D08004",
      "D08017",
      "D08009",
      "D08015",
      "D08015",
      "D08013",
      "D08001"];

  function _init() {
    _createMap();
    _createTooltip();
    _createPath();
  };

  function _createTooltip() {
    //Crea el tooltip
    tooltip = d3.select("body").append("div")
                .attr("id", "tooltip")
                .style("opacity", 0);

    svg.on("mousemove", mousemove);

    function mousemove() {
      tooltip.style("left", (d3.event.pageX + 20) + "px").style("top", (d3.event.pageY - 30) + "px");
    }
  }

  function _createMap() {

    svg = d3.select('#'+containerId).append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "poblacion");

  };

  function _getName(e) {
    return e.replace(/\s+/g, "-").toLowerCase()
  };

  function zoomed() {
    svg.selectAll('circle.ciudad')
    .attr('stroke-width',3/Math.round(d3.event.scale))

    svg.selectAll('path')
    .attr('stroke-width',1);

    mapa_svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  };

  function _removeDuplicate() {
    var r = $('.D08015-legend').last().remove(); // Elimino el segundo label de COLON
  };

  function _createPath() {
    scale = d3.geo.mercator().scale(8000).center([-61, -31.5]).translate([width / 2 - 30, height / 2 - 125]);
    projection = scale;
    path = d3.geo.path().projection(scale);

    d3.json(window.location.pathname+"data/argentina.json", function(error, e) {

        zoom = d3.behavior.zoom()
          .translate([0, 0])
          .scale(1)
          .scaleExtent([1, 8])
          .on("zoom", zoomed);

        svg.call(zoom).on("zoom", zoomed);

        //mapa
        mapa_svg = svg.append("g").classed("mapa", !0).attr("transform", "translate(0, 0)");

        departamentos = mapa_svg.append("g").attr("class", "departamentos");
        provincias = mapa_svg.append("g").attr("class", "provincias");
        legend = mapa_svg.append("g").attr("class", "legend");

        ciudades = mapa_svg.append("g").attr("class", "ciudades");

        var featuresProvincias = topojson.feature(e, e.objects.provincias).features,
            featuresDepartamentos = topojson.feature(e, e.objects.departamentos).features;

        provincias.selectAll("path")
          .data(featuresProvincias)
          .enter()
          .append("path")
          .attr("id", function (e) {
              return _getName(e.properties.PROVINCIA)
          })
          .attr("d", path)
          .attr("class", "provincia");

        entre_rios = departamentos.append("g")
            .attr("id", "provincia-entre-rios");

        departamentos.select("g#provincia-entre-rios")
          .append("g")
          .attr("id", "provincia-entre-rios")
          .selectAll("path")
          .data(featuresDepartamentos.filter(function (e) {
              return ER_IDS.indexOf(e.id) !== -1
          }))
          .enter()
          .append("path")
          .attr("id", function (e) {
              return e.id
          })
          .attr("d", path)
          .attr("class", "departamento");

        legend.selectAll("text.legend")
          .data(featuresDepartamentos.filter(function (e) {
              return ER_IDS.indexOf(e.id) !== -1
          }))
          .enter()
          .append("text")
          .attr("class", function (e) {
              return 'legend '+e.id+'-legend'
          })
          .text(function(d) { return d.properties.a; })
          .attr("transform", function(d) { 
            return "translate(" + path.centroid(d) + ")"; 
          })
          .attr("dx", "-2em")
          .call(_removeDuplicate);

        //Tooltip
        var m = mapa_svg.selectAll("path.departamento");

        m.on("mouseover", function(d) {
              $(this)[0].classList.add("hover");
          })
          .on("mouseout", function(d) {
              $(this)[0].classList.remove("hover");
          });

        //callback
        cb();

    });

    function _initTooltip(){
       var c = svg.selectAll('g.ciudades');

          c.on("mouseover", function(d) {
              var innerHTML = d.name + '<br/>';
              tooltip.transition()
                     .duration(100)
                     .style("opacity", .9)

              tooltip.html(innerHTML);
              $(this)[0].classList.add("hover");
          })
          .on("mouseout", function(d) {
              $(this)[0].classList.remove("hover");
              tooltip.transition()
                      .duration(200)
                      .style("opacity", 0);
          });


    };

  };

  _init();

  return {

    filter: function(filter){

      var all = svg.selectAll('circle.ciudad');

      all
      .transition().
      attr("r",0);

      if(filter){
        var selected = svg.selectAll('circle.'+filter);

        selected
        .transition()
        .attr("r",5);
      }
      
    },

    update: function(ciudades){

      if(ciudades.length === 0) {
        return;
      }

      var group = svg.selectAll('g.ciudades');

      var circulos = group
      .selectAll('circle.ciudad')
      .data(ciudades)
      .enter()
      .append("circle")
      .attr("id", function(d){
        return d.name;
      })
      .attr("class", function(d){
        return "ciudad "+ d.type;
      })
      .attr("transform", function(d) {
        return "translate(" + projection([d.lng,d.lat]) + ")";
      })
      .attr('stroke-width',3)
      .on("mouseover", function(d) {
        console.log(d);
          var innerHTML = '<strong>' + d.name + '</strong><br/>';
          switch(d.type){
            case 'TERMAS':
              innerHTML += '<img src="http://www.fotopaises.com/Fotos-Paises/t200/2011/12/25/2472_1324758987.jpg"/>';
            break;
            case 'PLAYAS':
              innerHTML += '<img src="http://image.anywherecostarica.com/hotel/eco-playa-resort-bahia-salinas-costa-rica/200x-eco-playa.jpg"/>';
            break;
            case 'SITIOS':
              innerHTML += '<img src="http://www.losfrancosuizos.com.ar/graficos/fotos-san-jose-entre-rios/10.jpg"/>';
            break;
            case 'HOSPEDAJE':
              innerHTML += '<img src="http://www.infobadmc.com/onlinerates/img_habitaciones/116argentinatango_standard.jpg"/>';
            break;
          }
          tooltip.transition()
                 .duration(100)
                 .style("opacity", .9)

          tooltip.html(innerHTML);
          $(this)[0].classList.add("hover");
      })
      .on("mouseout", function(d) {
          $(this)[0].classList.remove("hover");
          tooltip.transition()
                  .duration(200)
                  .style("opacity", 0);
      });

      this.filter();

    }

  }

}

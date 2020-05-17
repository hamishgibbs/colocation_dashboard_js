/*! colocation_dashboard_js 2020-05-17 */

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

addDropdownElement = function(value, label, cls, dropdown_id){

	d3.select("#" + dropdown_id)
		.append("option")
		.attr("value", value)
		.text(label)
		.attr("class", cls)

};

refreshPanel = function(){

	d3.select("#panel-c").remove()

	d3.select(".main")
		.append("div")
		.attr("class", "main-container")
		.attr("id", "panel-c")

}

d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
};

styleArea = function(area, cls){

	area_polygons = d3.selectAll(".country")._groups[0]

    for(i = 0; i < area_polygons.length; i++){
    	
	    if(area_polygons[i].getAttribute("polygon-name") == area){
	      area_polygons[i].setAttribute("class", cls)
	    }
    }

}

unstyleArea = function(cls){

	selected_area = d3.selectAll("." + cls)

  	country = selected_area.attr("country-name")

  	selected_area.attr("class", "country " + country)
}


figure_captions = function(){
	this.ov_caption_url = "https://raw.githubusercontent.com/hamishgibbs/colocation_dashboard/master/UK/text/ov_fig_caption.html"
	this.ts_caption_url = "https://raw.githubusercontent.com/hamishgibbs/colocation_dashboard/master/UK/text/ts_fig_caption.html"
	this.ac_caption_url = "https://raw.githubusercontent.com/hamishgibbs/colocation_dashboard/master/UK/text/ac_fig_caption.html"

	this.ov_caption = null
	this.ts_caption = null
	this.ac_caption = null


}

fig_captions1 = new figure_captions()

$.ajax({
    url : fig_captions1.ov_caption_url,
    dataType: "text",
    success : function (data) {
    	fig_captions1.ov_caption = data
    	$("#ov-caption").html(fig_captions1.ov_caption)
    }
});

$.ajax({
    url : fig_captions1.ts_caption_url,
    dataType: "text",
    success : function (data) {
    	fig_captions1.ts_caption = data
    }
});

$.ajax({
    url : fig_captions1.ac_caption_url,
    dataType: "text",
    success : function (data) {
    	fig_captions1.ac_caption = data
    }
});

//$(".ov-blurb").html(data);
/* keep all css definitions in the css file */
d3.select("#map-c")
	.append("svg")
	.attr("class", "main-map")
	.attr("id", "main-m");


/* add dropdown selection with scroll and search (from select2) */
d3.select("#map-c")
	.append("div")
	.attr("class", "dropdown-container");

d3.select("#dropdown-c")
	.append("select")
	.attr("class", "area-dropdown")
	.attr("id", "area-d");

$(document).ready(function() {
    $('.area-dropdown').select2();
});

$('select').on('change', function() {

    area_name = this.value

	ts_plot1.removePlotContent()

	ts_plot1.addPlotContent(area_name)

	ts_plot2.addPlotContent(area_name)

	d3.select("#area-title-c")
		.text(area_name)

	ac_panel1.removePlotContent(area_name)

	ac_panel1.addPlotContent(area_name)

});



/* refactor into a module asap */

geodata_url = "https://raw.githubusercontent.com/hamishgibbs/colocation_dashboard/master/geodata/UK_simple.geojson"

map_svg = d3.select("#main-m")

map_svg_dims = document.getElementById('main-m').getBoundingClientRect()

/* add auto scale */
var projection = d3.geoMercator()
					.translate([map_svg_dims.width/2, map_svg_dims.height/2])
					.scale(2200)
					.center([-4.5, 55]);

var path = d3.geoPath().projection(projection);


Promise.all([d3.json(geodata_url)]).then(function(data){
	data = data[0]
	
	country_class = data.features.map(function(d) { return "country " + d.properties.NAME_1; })
    
    map_svg.append("g")
      .attr("class", "areas")
    	.selectAll("path")
    	.data(data.features)
    	.enter().append("path")
	      .attr("d", path)
	      .attr("fill", "lightgray")
      	.attr("stroke", "white")
      	.attr("class", mapCountryClass)
      	.attr("polygon-name", function(d){ return d.properties.NAME_2; })
      	.attr("country-name", function(d){ return d.properties.NAME_1; })
      	.on("click", mainMapClick)
      	.on("mousein", d3.selection.prototype.moveToFront)

    
});


sizeChange = function() {
    d3.select(".areas").attr("transform", "scale(" + $("#map-c").width()/700 + ")");
    $(".areas").height($("#map-c").width()*0.618);
}

d3.select(window)
    .on("resize", sizeChange);


mapCountryClass = function(d){

	if (ts_plot1.area_names.includes(d.properties.NAME_2)){

		return "country " + d.properties.NAME_1;

	}else{

		return "country " + "no-data";

	}
}

mainMapClick = function(){

	area_name = d3.select(this).attr("polygon-name")

	ts_plot1.removePlotContent()

	ts_plot1.addPlotContent(area_name)

	ts_plot2.addPlotContent(area_name)

	d3.select("#area-title-c")
		.text(area_name)

	ac_panel1.removePlotContent(area_name)

	ac_panel1.addPlotContent(area_name)


}
ac_panel = function(){
	this.data_url = "https://raw.githubusercontent.com/hamishgibbs/colocation_dashboard/master/UK/data/top_n_between.csv"

	this.data = null

	this.default_area = "Greater London"

	this.margin = {top: 10, right: 50, bottom: 0, left: 40};

	this.setupAcPanel = function(){
		this.svg = d3.select("#panel-c")
      .append("div")
      .attr("class", "ac-plot-container")
      .attr("id", "ac-plot-c")
			.append("svg")
			.attr("class", "ac-plot")
			.append("g")
			.attr("class", "ac-plot-content")

    this.containerDims = d3.select("#ac-plot-c").node().getBoundingClientRect()
    this.width = this.containerDims.width - this.margin.left - this.margin.right;
    this.height = this.containerDims.height - this.margin.top - this.margin.bottom;

		this.sankey = d3.sankey()
		    .nodeWidth(30)	
		    .nodePadding(50)
		    .size([this.width, this.height]);

		/* this may cause an error */
		this.path = this.sankey.link();

	}

	this.addPlotContent = function(area){

    try {
        unstyleArea('area-active')
    }catch(error) {
        console.log(error)
    };

		plot_data = this.data.filter(function(d){ return d.polygon1_name == area;})

		graph = {"nodes" : [], "links" : []};

		plot_data.forEach(function (d) {
		    graph.nodes.push({ "name": d.polygon1_name });
		    graph.nodes.push({ "name": d.polygon2_name });
		    graph.links.push({ "source": d.polygon1_name,
		                       "target": d.polygon2_name,
		                       "value": +d.mean_colocation });
	   	});

	   	// return only the distinct / unique nodes
		  graph.nodes = d3.keys(d3.nest()
		    .key(function (d) { return d.name; })
		    .object(graph.nodes));

		  // loop through each link replacing the text with its index from node
		  graph.links.forEach(function (d, i) {
		    graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
		    graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
		  });

		  // now loop through each nodes to make nodes an array of objects
		  // rather than an array of strings
		  graph.nodes.forEach(function (d, i) {
		    graph.nodes[i] = { "name": d };
		  });

		  /*deleted layout here */
		  this.sankey
		      .nodes(graph.nodes)
		      .links(graph.links)
		      .layout(32);

			// add in the links
		  var link = this.svg.append("g").selectAll(".link")
		      .data(graph.links)
		    .enter().append("path")
		      .attr("class", "link")
		      .attr("d", this.path)
          .attr("stroke-opacity", 0.1)
		      .attr("value", function(d){return d.target.name; })
          .attr("area-name", function(d){return d.target.name; })
		      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
		      .sort(function(a, b) { return b.dy - a.dy; })
		      .on("mouseover", this.linkMouseOver)
		      .on("mouseout", this.linkMouseOut)
          .on('click', this.sankeyClick);

      link
        .transition()
        .duration(400)
        .ease(d3.easeLinear)
        .style("stroke-opacity", 0.25)
        .attr('stroke-dashoffset', 0)

		// add the link titles
		  link.append("title")
		        .text(function(d) {
		    		return d.source.name + " → " + 
		                d.target.name + "\n" + d.value; });

		// add in the nodes
		  var node = this.svg.append("g").selectAll(".node")
		      .data(graph.nodes)
		    .enter().append("g")
		      .attr("class", "node")
		      .attr("transform", function(d) {
				  return "translate(" + d.x + "," + d.y + ")"; });

		node.append("rect")
	      .attr("height", function(d) { return d.dy; })
	      .attr("width", this.sankey.nodeWidth())
        .attr("area-name", function(d) { return d.name; })
	      .style("fill", "lightgrey")
        .on("click", this.sankeyClick)
	    .append("title")
	      .text(function(d) { 
			  return d.name + "\n" + d.value; });

			// add in the title for the nodes
		  node.append("text")
		      .attr("x", function(d){if(d.name == area){return 36;}else{return -6;}})
		      .attr("y", function(d) { return d.dy / 2; })
		      .attr("dy", ".35em")
		      .attr("text-anchor", function(d){if(d.name == area){return"beginning";}else{return "end";}})
		      .attr("transform", null)
		      .text(function(d) { return d.name + " " + parseFloat(d.value.toFixed(7)).toExponential(); })
		    .filter(function(d) { return d.x < this.width / 2; })
		      .attr("x", 6 + this.sankey.nodeWidth())
		      .attr("text-anchor", "start");

    styleArea(area, 'area-active')

	}

  this.removePlotContent = function(){
  	d3.selectAll('.ac-plot-content').remove()

  	this.svg = d3.selectAll(".ac-plot")
		.append("g")
		.attr("class", "ac-plot-content")
  }

  this.addCaption = function(){

      d3.select('#panel-c')
        .append('div')
        .attr("class", "figure-caption")
      .attr("id", "ac-caption")

    $("#ac-caption").html(fig_captions1.ac_caption)
  }

  this.linkMouseOver = function(){
  	hovered_area = d3.select(this).attr("value")

    styleArea(hovered_area, 'area-selected')

  }

  this.linkMouseOut = function(){
  	
    unstyleArea("area-selected")
  	
  }

  /* not sure what practice is for this. class attrribute is now referenced to a single instance */
  this.sankeyClick = function(){}

}

ac_panel1 = new ac_panel

ac_panel1.sankeyClick = function(){
      area_name = d3.select(this).attr('area-name')

      unstyleArea("area-selected")

      ac_panel1.removePlotContent(area_name)

      ac_panel1.addPlotContent(area_name)
  }

d3.csv(ac_panel1.data_url, d3.autoType).then(function(data){

	ac_panel1.data = data

})

d3.sankey = function() {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [];

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function() {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes,
        nextNodes,
        x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function(link) {
          if (nextNodes.indexOf(link.target) < 0) {
            nextNodes.push(link.target);
          }
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    //
    moveSinksRight(x);
    scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
        .key(function(d) { return d.x; })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) { return d.values; });

    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });

      links.forEach(function(link) {
        link.dy = link.value * ky;
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sankey;
};

ov_panel = function(){
	this.image_url = "https://raw.githubusercontent.com/hamishgibbs/colocation_dashboard/master/UK/images/colocation_plot.png"

	this.setupOvPanel = function(){

		this.container = d3.select("#panel-c")
			.append("div")
			.attr("class", "ov-container")
		
		containerDims = this.container.node().getBoundingClientRect();

		this.container
			.append("div")
			.attr("class", "area-title-container")
			.text("Facebook Colocation Data")

		this.container 
			.append("img")
				.attr("src", this.image_url)
				.attr("class", "ov-image")

		this.container.append("div")
			.attr("class", "figure-caption")
			.attr("id", "ov-caption")

		try {
			$("#ov-caption").html(fig_captions1.ov_caption)
		}catch(error){console.log(error)}

		this.container.append("div")
			.attr("class", "ov-blurb")

		$(".ov-blurb").html(this.blurb_text)
				
	}

	this.blurb_text = null
}

var blurb_url = "https://raw.githubusercontent.com/hamishgibbs/colocation_dashboard/master/UK/text/blurb.html"

$.ajax({
    url : blurb_url,
    dataType: "text",
    success : function (data) {
    	ov_panel1.blurb_text = data
        $(".ov-blurb").html(data);
    }
});
description_panel = function(){
	this.fb_image_url = "https://assets.themuse.com/uploaded/companies/659/small_logo.png?v=e06509d06aae79458f7a2fe65f39bcb4cca56e964dd6d9e0390386ca1829e55a"
	this.cmmid_image_url = "https://www.lshtm.ac.uk/sites/default/files/styles/centre_header_logo/public/cmmid.jpg?itok=DVpjwx1l"
	this.lshtm_image_url = "http://pathogenseq.lshtm.ac.uk/img/lshtm-logo.jpg"

	this.fb_url = "https://dataforgood.fb.com/"
	this.cmmid_url = "https://www.lshtm.ac.uk/research/centres/centre-mathematical-modelling-infectious-diseases"
	this.lshtm_url = "https://www.lshtm.ac.uk/"

	this.description_text = null

	this.setupDdPanel = function(){


		this.container = d3.select("#panel-c")
			.append("div")
			.attr("class", "area-title-container")
			.attr("id", "description-tt")
			.text("Dataset Description")

		
		this.container
			.append("div")
			.attr("class", "description-text")
			.attr("id", "description-t")

		
		this.credits_panel = this.container
			.append("div")
			.attr("class", "credits-container")
			.attr("id", "credits-panel")

		this.credits_panel
			.append("div")
			.attr("class", "image-container")
			.append("a")
			.attr("href", this.fb_url)
			.attr("target", "_blank")
			.append("img")
			.attr("src", this.fb_image_url)
			.attr("class", "credit-image")

		this.credits_panel
			.append("div")
			.attr("class", "image-container")
			.append("a")
			.attr("href", this.lshtm_url)
			.attr("target", "_blank")
			.append("img")
			.attr("src", this.lshtm_image_url)
			.attr("class", "credit-image")

		this.credits_panel
			.append("div")
			.attr("class", "image-container")
			.append("a")
			.attr("href", this.cmmid_url)
			.attr("target", "_blank")
			.append("img")
			.attr("src", this.cmmid_image_url)
			.attr("class", "credit-image")

		this.container
			.append("div")
			.attr("class", "author-container")
			.attr("id", "author-panel")
			.text("Visualisation by Hamish Gibbs. Supported by CMMID Covid-19 Working Group, Rosalind M Eggo, Chris Grundy, and Adam Kucharski.")

		$(".description-text").html(this.description_text)
		
	}
}

var description_url = "https://raw.githubusercontent.com/hamishgibbs/colocation_dashboard/master/UK/text/description.html"

$.ajax({
    url : description_url,
    dataType: "text",
    success : function (data) {
    	description_panel1.description_text = data
        $(".description-text").html(data);
    }
});

/* add panel select buttons */

/*aCompareButtonClick = function(){

	d3.selectAll(".panel-button")
		.attr("id", null)

	d3.select(this)
		.attr("id", "active-button")

	refreshPanel()

	table_panel1.createTable()

}*/

tsButtonClick = function(){
	d3.selectAll(".panel-button")
		.attr("id", null)

	d3.select(this)
		.attr("id", "active-button")

	refreshPanel()

	d3.select("#panel-c")
		.append("div")
		.attr("class", "area-title-container")
		.attr("id", "area-title-c")

	ts_plot1.appendSVG('panel-c', 'ts1-c', 'ts-container', 'ts1', 'ts-plot')

	ts_plot2.appendSVG('panel-c', 'ts2-c', 'ts-container', 'ts2', 'ts-plot')

	ts_plot1.layoutPlot()
	ts_plot2.layoutPlot()

	d3.select("#area-title-c")
		.text(ts_plot1.default_area)

	createTsSummaryButtons("panel-c")

	ts_plot1.addCaption()

	try{unstyleArea('area-active')}catch(error){console.log(error)}
}


ov_panel1 = new ov_panel

ovButtonClick = function(){

	d3.selectAll(".panel-button")
		.attr("id", null)

	d3.select(this)
		.attr("id", "active-button")

	refreshPanel()

	ov_panel1.setupOvPanel()

	try{unstyleArea('area-active')}catch(error){console.log(error)}

}

description_panel1 = new description_panel

ddButtonClick = function(){
	d3.selectAll(".panel-button")
		.attr("id", null)

	d3.select(this)
		.attr("id", "active-button")

	refreshPanel()

	description_panel1.setupDdPanel()

	try{unstyleArea('area-active')}catch(error){console.log(error)}

}

acButtonClick = function(){
	d3.selectAll(".panel-button")
		.attr("id", null)

	d3.select(this)
		.attr("id", "active-button")

	refreshPanel()

	ac_panel1.setupAcPanel()

	ac_panel1.addPlotContent(ac_panel1.default_area)

	ac_panel1.addCaption()

	try{unstyleArea('area-active')}catch(error){console.log(error)}
}

/*in this panel - just give premade pngs */
d3.select("#panel-select-c")
	.append("div")
	.attr("class", "button-spacer")

d3.select("#panel-select-c")
		.append("button")
		.attr("value", "ov")
		.text("Overview")
		.attr("class", "panel-button")
		.attr("id", "active-button")
		.on("click", ovButtonClick);

d3.select("#panel-select-c")
	.append("div")
	.attr("class", "button-spacer")

d3.select("#panel-select-c")
		.append("button")
		.attr("value", "ts")
		.text("Time series")
		.attr("class", "panel-button")
		.on("click", tsButtonClick);

d3.select("#panel-select-c")
	.append("div")
	.attr("class", "button-spacer")

d3.select("#panel-select-c")
		.append("button")
		.attr("value", "ac")
		.text("Area Comparison")
		.attr("class", "panel-button")
		.on("click", acButtonClick);

d3.select("#panel-select-c")
	.append("div")
	.attr("class", "button-spacer")

d3.select("#panel-select-c")
		.append("button")
		.attr("value", "dd")
		.text("Dataset Description")
		.attr("class", "panel-button")
		.on("click", ddButtonClick);

/*d3.select("#panel-select-c")
		.append("button")
		.attr("value", "ac")
		.text("Area comparison")
		.attr("class", "panel-button")
		.on("click", aCompareButtonClick);*/

$("#active-button").click()


/* within each button click - hold the panel setup function */

/*load data from urls and add as a window attribute */
addDropdownElement

ts_data_url = "https://raw.githubusercontent.com/hamishgibbs/colocation_dashboard/master/UK/data/mean_ts.csv"

var parseTime = d3.timeParse("%Y-%m-%d");

ts_plot = function(){
	this.data = null;

	this.area_names = null;

	this.y_label = null;

	this.dataset_type = null;

	this.default_area = "Greater London";

	this.margin = {top: 0, right: 30, bottom: 50, left: 70}

	this.appendSVG = function(panel_id, container_id, container_cls, svg_id, svg_cls){

		this.panel = d3.select("#" + panel_id)
		this.container = d3.select("#" + container_id)

		d3.select("#" + panel_id)
			.append('div')
			.attr("id", container_id)
			.attr("class", container_cls)

		this.svg = d3.select('#' + container_id)
			.append('svg')
			.attr("id", svg_id)
			.attr("class", svg_cls)
			.append("g")
    		.attr("transform",
          "translate(" + this.margin.left + "," + this.margin.top + ")");
			
	};

	this.defineAxes = function(container_id, data){

		var containerDims = d3.select("#" + container_id).node().getBoundingClientRect();
		
		this.width = containerDims.width - this.margin.left - this.margin.right;
		this.height = containerDims.height - this.margin.top - this.margin.bottom;

		this.x = d3.scaleTime().range([0, this.width]);
		this.y = d3.scaleLinear().range([this.height, 0]);

		this.x.domain(d3.extent(data, function(d) { return d.ds; }));
  		this.y.domain([d3.min(data, function(d) { return d.mean_colocation; }), d3.max(data, function(d) { return d.mean_colocation; })]);
  		

  		var x = this.x
  		var y = this.y

  		/*namespace issue - not this */ 
  		this.plotLine = d3.line()
    					.x(function(d) { return x(d.ds); })
    					.y(function(d) { return y(d.mean_colocation); });
	};

	this.layoutPlot = function(){

		this.svg
			.append("g")
			.attr("transform", "translate(0," + this.height + ")")
			.call(d3.axisBottom(this.x));

		this.svg
			.append("g")
      		.call(d3.axisLeft(this.y));

      	this.svg
	    	.append("text")
	        .attr("transform", "rotate(-90)")
	        .attr("y", 0 - this.margin.left)
	        .attr("x",0 - (this.height / 2))
	        .attr("dy", "1em")
	        .style("text-anchor", "middle")
	        .text(this.y_label);

	    this.addPlotContent(this.default_area)

	    this.tooltip_div = this.container.append("div")	
    		.attr("class", "tooltip")				
    		.style("opacity", 0);
	      
	};

    this.addPlotContent = function(area){

    	if (['England', 'Wales', 'Scotland', 'Northern Ireland'].includes(area)){
    		plot_data = this.data.filter(function(d){ return d.NAME_1 == area;})

    		area_names = plot_data.map(function(d){ return d.polygon1_name }).filter( onlyUnique )

    		for(i in area_names){
    			area_data = plot_data.filter(function(d){ return d.polygon1_name == area_names[i];})

    			this.svg
	    		.append("path")
	      		.data([area_data])
	      		.attr("class", "ts-plot-content summary" + " " + this.dataset_type)
	      		.attr("d", this.plotLine)
	      		.attr("value", area_names[i])
	      		.on("mouseover", this.changeTitle)
	      		.on("mouseout", this.resetTitle);

    		}

    	}else{
    		plot_data = this.data.filter(function(d){ return d.polygon1_name == area;})

    		this.svg
	    		.append("path")
	      		.data([plot_data])
	      		.attr("class", "ts-plot-content" + " " + this.dataset_type)
	      		.attr("d", this.plotLine);

    	}
    	
    	/* line not appearing correctly here - style issue?*/ 

    };

    this.addCaption = function(){

    	d3.select('#panel-c')
    		.append('div')
    		.attr("class", "figure-caption")
			.attr("id", "ts-caption")

		$("#ts-caption").html(fig_captions1.ts_caption)
    }

    this.changeTitle = function(){

    	var hovered_area = d3.select(this).attr("value")

    	d3.select("#area-title-c")
			.text(hovered_area)

		styleArea(hovered_area, 'area-selected')
	}

	this.resetTitle = function(){
    	d3.select("#area-title-c")
			.text(d3.select("#summary-button-active").text())

		unstyleArea('area-selected')
	}


    this.removePlotContent = function(){
    	d3.selectAll('.ts-plot-content').remove()
    }

}


/*add div to hold title */
createTsSummaryButtons = function(panel_id){
		
		d3.select("#" + panel_id)
			.append("div")
		    .attr("class", "button-spacer")

		d3.select("#" + panel_id)
			.append("button")
			.attr("value", "England")
			.text("England")
			.attr("class", "summary-button")
			.on("click", summaryButtonClick)

		d3.select("#" + panel_id)
			.append("div")
		    .attr("class", "button-spacer")

		d3.select("#" + panel_id)
			.append("button")
			.attr("value", "Wales")
			.text("Wales")
			.attr("class", "summary-button")
			.on("click", summaryButtonClick)
	
		d3.select("#" + panel_id)
			.append("div")
		    .attr("class", "button-spacer")

		d3.select("#" + panel_id)
			.append("button")
			.attr("value", "Scotland")
			.text("Scotland")
			.attr("class", "summary-button")
			.on("click", summaryButtonClick)

		d3.select("#" + panel_id)
			.append("div")
		    .attr("class", "button-spacer")
		 
		d3.select("#" + panel_id)
			.append("button")
			.attr("value", "Northern Ireland")
			.text("Northern Ireland")
			.attr("class", "summary-button")
			.on("click", summaryButtonClick)
}

summaryButtonClick = function(){

	d3.selectAll(".summary-button")
		.attr("id", null)

	d3.select(this)
		.attr("id", "summary-button-active")

	ts_plot1.removePlotContent()

	ts_plot2.removePlotContent()

	ts_plot1.addPlotContent(this.value)

	ts_plot2.addPlotContent(this.value)

	d3.select("#area-title-c")
		.text(this.value)
}


var ts_plot1 = new ts_plot()

ts_plot1.y_label = "% change of mean colocation probability"

ts_plot1.appendSVG('panel-c', 'ts1-c', 'ts-container', 'ts1', 'ts-plot')

var ts_plot2 = new ts_plot()

ts_plot2.y_label = "Mean probability of colocation"

ts_plot2.appendSVG('panel-c', 'ts2-c', 'ts-container', 'ts2', 'ts-plot')

ts_plot1.dataset_type = 'between'

ts_plot2.dataset_type = 'within'

/* remember to parse up here */
Promise.all([d3.csv(ts_data_url, d3.autoType)]).then(function(data){

	data = data[0]
	/*parsing issue */
	area_names = data.map(function(d){ return d.polygon1_name }).filter( onlyUnique )

	ts_plot1.area_names = area_names

	/* Add default dropdown element */
	d3.select("#area-d")
		.append("option")
		.attr("value", "Select")
		.text("Select")
		.attr("class", "dropdown-element")
		.attr("disabled", true)
		.attr("visibility", "hidden")

	for (i in area_names){
		addDropdownElement(area_names[i], area_names[i], "dropdown-element", "area-d")
	}

	perc_data = data.filter(function(d){ return d.type == 'perc_change';})
	/* threshold within data so that it is < 0.025 (remove outliers) */
	perc_data = perc_data.filter(function(d){ return d.mean_colocation <= 200;})

	abs_data = data.filter(function(d){ return d.type == 'abs_value';})

	/* divide data within and between */
	ts_plot1.data = perc_data
	ts_plot2.data = abs_data

	ts_plot1.defineAxes('ts1-c', perc_data)

	ts_plot2.defineAxes('ts2-c', abs_data)

	d3.select("#area-title-c")
		.text(ts_plot1.default_area)
})

/* add buttons for country summaries */







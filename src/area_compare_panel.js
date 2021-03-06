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

function draw(data){
    
    var data = data.slice(500, 1000).map(function(d){return d*1000})
    
    var height = 600,
        panel_height = 160,
        width = 800,
        margin = {x: 40, y:30};

    var svg = d3.select('section#kde')
        .append('svg')
        .attr("width", 800)
        .attr("height", 600);

    var g = svg.append('g').attr("transform", "translate(" + margin.x/2 + "," + margin.y + ")");

    var g1 =  g.append('g')
    var g2 =  g.append('g')
        .attr("transform", "translate(0, " + (panel_height + margin.y) + ")");
    var g3 =  g.append('g')
        .attr("transform", "translate(0, " + (panel_height+margin.y)*2 + ")");

    var time_extent = [d3.min(data) - 1, d3.max(data) + 1]
    
    var x = d3.scale.linear()
        .domain(time_extent)
        .range([0, width-margin.x]);

    var time_scale = d3.time.scale()
        .domain(time_extent)
        .range([0, width-margin.x]);

    function draw_histogram(g, histogram, data){

        var data = histogram(data)

        var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.y; })])
            .range([panel_height, 0]);

        var bar = g.selectAll(".bar")
            .data(data)
          .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

        bar.append("rect")
            .attr("x", 1)
            .attr("width", x(time_extent[0]+data[1].dx))
            .attr("height", function(d) { return panel_height - y(d.y); });
    }

    function draw_line(g, histogram, data){
        var data = histogram(data)
                
        var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.y; })])
            .range([panel_height, 0]);
    
        var line = d3.svg.line()
            .x(function(d,i) { return x(d.x+(d.dx/2)); })
            .y(function(d) { return y(d.y); })
    
        g.append("svg:path").attr("d", line(data)).attr('class','line');
    }
    
    function draw_kde(g, dist, data){
        
		// xrange is the time values we want to draw
        var xrange = d3.range(time_extent[0], time_extent[1], 1000)
		// ydata is the smoothed rate estiamte
        var ydata = xrange.map(
            function(xi){			
                return d3.sum(data.map(function(di){
					return dist.density(Math.abs(xi-di))
				}))
            }
        )
		        
        var y = d3.scale.linear()
            .domain([0, d3.max(ydata)])
            .range([panel_height, 0]);
        
		data = _.zip(xrange,ydata).map(function(d){return {x:d[0], y:d[1]}})
				
        var line = d3.svg.line()
            .x(function(d,i) { return x(d.x); })
            .y(function(d) { return y(d.y); })
				
		g.append("svg:path").attr("d", line(data)).attr('class','line');
    }
        
    var original_histogram = d3.layout.histogram()
        .bins(x.ticks(d3.round((time_extent[1]-time_extent[0])/1000)));

    var start = time_extent[0] + (60*1000)
    var stop = time_extent[1] - (60*1000)
    var N = 10
    var step = d3.round((stop-start)/N)
        
    var binned_histogram = d3.layout.histogram()
        .bins(d3.range(start,stop,step));
    
    draw_histogram(g3, original_histogram, data)
	
	draw_line(g1, binned_histogram, data)
    
	normal = new NormalDistribution(0,60*1000)
	gamma = new GammaDistribution()
	draw_kde(g2, normal, data)

    var time_axis = d3.svg.axis()
        .scale(time_scale)
        .orient("bottom");

    g1.append("g")
        .attr("class", "x axis") 
        .attr("transform", "translate(0," + panel_height + ")") 
        .call(time_axis);
    g2.append("g")
        .attr("class", "x axis") 
        .attr("transform", "translate(0," + panel_height + ")") 
        .call(time_axis);
    g3.append("g")
        .attr("class", "x axis") 
        .attr("transform", "translate(0," + panel_height + ")") 
        .call(time_axis);
}

d3.json('data/obama.dat', draw)

// var data
//d3.json('data/obama.dat', function(d){data=d})

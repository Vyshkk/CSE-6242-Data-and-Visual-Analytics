// Define plot boundaries
var margin = {top: 5, right: 30, bottom: 15, left: 35, padding: 15},
    width = 460 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Define plot scale outputs
var xScale = d3.scaleTime().range([0, width-10]),
    yScale = d3.scaleLinear().range([height-50, 0+120]),
    xBar = d3.scaleLinear().range([0, width-10]),
    yBar = d3.scaleLinear().range([height-50,100]),
    xScale3 = d3.scaleLinear().range([0,width]),
    yScale3 = d3.scaleLinear().range([height-100,0]);


var state = 'AL';
var model_sel;
var make_sel;
var year_sel;
var selected_car = {year: 1984, make: "Alfa Romeo", model : "GT V6 2.5"}

var st=["Alabama-AL","Alaska-AK","Arizona-AZ","Arkansas-AR","California-CA","Colorado-CO","Connecticut-CT","Delaware-DE","Florida-FL","Georgia-GA",
			"Hawaii-HI","Idaho-ID","Illinois-IL","Indiana-IN","Iowa-IA","Kansas-KS","Kentucky-KY","Louisiana-LA","Maine-ME","Maryland-MD",
			"Massachusetts-MA","Michigan-MI","Minnesota-MN","Mississippi-MS","Missouri-MO","Montana-MT","Nebraska-NE","Nevada-NV","New Hampshire-NH","New Jersey-NJ",
			"New Mexico-NM","New York-NY","North Carolina-NC","North Dakota-ND","Ohio-OH","Oklahoma-OK","Oregon-OR","Pennsylvania-PA","Rhode Island-RI","South Carolina-SC",
			"South Dakota-SD","Tennessee-TN","Texas-TX","Utah-UT","Vermont-VT","Virginia-VA","Washington-WA","West Virginia-WV","Wisconsin-WI","Wyoming-WY", "US Total-USA"];
var state_elec = {};
//Read in state gas price data
var gas_price = {}
d3.csv('eia_api/data/gas_prices.csv').then(function(data){
    Object.entries(data).forEach(entry => {
        key = entry[0]
        data[key] = Object.values(data[key])
    });

    data.forEach(d => {
        gas_price[d[0]] = +d[1].substring(1)
    });
});

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Define plot colors based on generation sources 
var genSources = ['Coal','Natural Gas','Nuclear','Biomass','Wind','All Solar','Geothermal','Petroleum Liquids','Petroleum Coke','Hydro'];
var colorScale=d3.scaleOrdinal(d3.schemeCategory10);
colorScale.domain(genSources);
var emission_calc = 0;


//Select dropdown
var selectp1 =d3.select("#state-dropdown")
				.append("select")
    		    .on('change',changep1);

var optionsp1 = selectp1.selectAll('option')
						.data(st)
						.enter()
						.append('option')
						.text(function (d) { return d; });

function changep1() {
	 	var s=d3.select("select").property('value');
	 	s=s.split("-");
	 	state=s[1];
	 	get_state_elec(state);
		title1.remove();title1b.remove();title3.remove();
		linepath.remove();xaxis1.remove();yaxis1.remove();legend.remove();
		yAxisTitle1.remove();xAxisTitle1.remove();
		d3.selectAll("line").remove();
		plot1.selectAll("path").remove()
		
		pullData(state);
		cluster_plot();
		emission_sum(state);
		
		title1=plot1.append('text')
     				.text('Power Generation Sources: '+state)
    				.attr('class', 'title')
    				.attr('x', 0)
    				.attr('y', 30)

    	title3= plot3.append('text')
             .text('Lifetime Emission and Fuel Cost Living in ' + state)
             .attr('class', 'title')
             .attr("text-anchor", "middle")
             .attr('x', (width/2 + 10))
             .attr('y', 10)

    	title2.remove();
     	title2=plot2.append('text')
     				.text('Total Emissions: '+state)
     				.attr('class', 'title')
     				.attr("text-anchor", "middle")
     				.attr('x', width/2 + margin.left)
     				.attr('y', 50)
		};

// Create electricity plot body
var plot1 = d3.select('#plot-loc1').append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', 'translate('+margin.left+','+margin.top+')');

var plot3 = d3.select('#plot-loc3').append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', 'translate('+margin.left+','+margin.top+')');

//Select dropdown
var yr,mke,uf,em=[0],emissionsData=[0,0,0];emissionsLabel=["","",""];mdl=[""];veh=[''];car=["","",""];h=[],clip=[];
var dby1,dbm1,dmo1,dby2,dbm2,dmo2,dby3,dbm3,dmo3;
var selectyr1,optionsyr1,selectmke1,optionsmke1,selectmdl1,optionsmdl1,selectyr2,optionsyr2,selectmke2,optionsmke2,selectmdl2,optionsmdl2,
	selectyr3,optionsyr3,selectmke3,optionsmke3,selectmdl3,optionsmdl3;

 
d3.csv('eia_api/data/vehicle.csv').then(function(data){

	dby1=d3.nest()
		   .key(function(d){return d.year;})
		   .map(data);
	dbm1=d3.nest()
		   .key(function(d){return d.make.toString();})
		   .map(dby1.get(1984));
	dmo1=d3.nest()
		   .key(function(d){return d.model.toString();})
		   .map(dbm1.get("Alfa Romeo"));
	dbe1=d3.nest()
		   .key(function(d){return d.co2TailpipeGpm;})
		   .map(dmo1.get("GT V6 2.5"));

	selectyr1 =d3.select("#cars-dropdown1")
    		  		 .append("select")
    		  		 .on('change',function(){yr=d3.select(this).property('value');
    		  		                         selected_car.year = +d3.select(this).property('value');
    		  								 changeyr(1);});
    		  								 //cluster_plot();});
    
	optionsyr1 = selectyr1.selectAll('option')
				.data(dby1.keys())
				.enter()
				.append('option')
				.text(function (d) { return d; });
						
	selectmke1 =d3.select("#cars-dropdown1")
    		     	  .append("select")
			  		  .style("max-width", "120px")
    		  	 	  .on('change',function(){mke=d3.select(this).property('value');
    		  	 	                          selected_car.make = d3.select(this).property('value');
    		  	 	 						  changemke(1);});
    		  	 	 						  //cluster_plot();});
    
	optionsmke1 = selectmke1.selectAll('option')
						  	    .data(dbm1.keys())
						  	    .enter()
						  	    .append('option')
						  	    .text(function (d) { return d; });
					
	selectmdl1 =d3.select("#cars-dropdown1")
    		  	 	  .append("select")
				  	  .style("max-width", "120px")
    		  	 	  .on('change',function(){mdl=d3.select(this).property('value');
    		  	 	                          selected_car.model = d3.select(this).property('value');
    		  	 	  						  car[0]=mdl;
    		  	 	 						  changemdl(1);});
    		  	 	 						  //cluster_plot();})
    
	optionsmdl1 = selectmdl1.selectAll('option')
						  	    .data(dmo1.keys())
						  	    .enter()
						  	    .append('option')
						  	    .text(function (d) { return d; });
						  	  
	
	
	dby2=d3.nest()
		   .key(function(d){return d.year;})
		   .map(data);
	dbm2=d3.nest()
		   .key(function(d){return d.make.toString();})
		   .map(dby2.get(1984));
	dmo2=d3.nest()
		   .key(function(d){return d.model.toString();})
		   .map(dbm2.get("Alfa Romeo"));
	dbe2=d3.nest()
		   .key(function(d){return d.co2TailpipeGpm;})
		   .map(dmo2.get("GT V6 2.5"));

	selectyr2 =d3.select("#cars-dropdown2")
    		  		 .append("select")
    		  		 .on('change',function(){yr=d3.select(this).property('value');
    		  								 changeyr(2);});	
    
	optionsyr2 = selectyr2.selectAll('option')
							  .data(dby2.keys())
							  .enter()
							  .append('option')
							  .text(function (d) { return d; });
						
	selectmke2 =d3.select("#cars-dropdown2")
    		     	  .append("select")
			  		  .style("max-width", "120px")
    		  	 	  .on('change',function(){mke=d3.select(this).property('value');
    		  	 	 						  changemke(2);});	
    
	optionsmke2 = selectmke2.selectAll('option')
						  	    .data(dbm2.keys())
						  	    .enter()
						  	    .append('option')
						  	    .text(function (d) { return d; });
					
	selectmdl2 =d3.select("#cars-dropdown2")
    		  	 	  .append("select")
				  	  .style("max-width", "120px")
    		  	 	  .on('change',function(){mdl=d3.select(this).property('value');
    		  	 	  						  car[1]=mdl;
    		  	 	 						  changemdl(2);})
    
	optionsmdl2 = selectmdl2.selectAll('option')
						  	    .data(dmo2.keys())
						  	    .enter()
						  	    .append('option')
						  	    .text(function (d) { return d; });
						  	  
	dby3=d3.nest()
		  .key(function(d){return d.year;})
		  .map(data);
	dbm3=d3.nest()
		  .key(function(d){return d.make.toString();})
		  .map(dby3.get(1984));
	dmo3=d3.nest()
		  .key(function(d){return d.model.toString();})
		  .map(dbm3.get("Alfa Romeo"));
	dbe3=d3.nest()
		  .key(function(d){return d.co2TailpipeGpm;})
		  .map(dmo3.get("GT V6 2.5"));

	selectyr3 =d3.select("#cars-dropdown3")
    		  		.append("select")
    		  		.on('change',function(){yr=d3.select(this).property('value');
    		  								changeyr(3);});
    
	optionsyr3 = selectyr3.selectAll('option')
							.data(dby3.keys())
							.enter()
							.append('option')
							.text(function (d) { return d; });
						
	selectmke3 =d3.select("#cars-dropdown3")
    		     	 .append("select")
			 		 .style("max-width", "120px")
    		  	 	 .on('change',function(){mke=d3.select(this).property('value');
    		  	 	 						changemke(3);});	
    
	optionsmke3 = selectmke3.selectAll('option')
						  	  .data(dbm3.keys())
						  	  .enter()
						  	  .append('option')
						  	  .text(function (d) { return d; });
					
	selectmdl3 =d3.select("#cars-dropdown3")
    		  	 	 .append("select")
				 	 .style("max-width", "120px")
    		  	 	 .on('change',function(){mdl=d3.select(this).property('value');
    		  	 	 						car[2]=mdl;
    		  	 	 						changemdl(3);})
    
	optionsmdl3 = selectmdl3.selectAll('option')
						  	  .data(dmo3.keys())
						  	  .enter()
						  	  .append('option')
						  	  .text(function (d) { return d; });				  	  						  	  

});					  	  

function changeyr(id) {
		if(id==1){
			dbm1=d3.nest()
				   .key(function(d){return d.make.toString();})
			  	   .map(dby1.get(yr));
			selectmke1.remove();
			optionsmke1.remove();
			selectmdl1.remove();
			optionsmdl1.remove();
			selectmke1 = d3.select("#cars-dropdown1")
    			  	  	  .append("select")
					      .style("max-width", "120px")
    		  		  	  .on('change',function(){mke=d3.select(this).property('value');
    		  		  	  						  changemke(1);});	

			optionsmke1 = selectmke1.selectAll('option')
					  	  		  .data(dbm1.keys())
					  	 	 	  .enter()
					  	 	 	  .append('option')
					  		  	  .text(function (d) { return d; });

			mke=dbm1.keys();
			mke=mke[0]
    		changemke(1);
    		//selected_car.make = mke;
		}
					  		  	  
		else if(id==2){
			dbm2=d3.nest()
			 	 .key(function(d){return d.make.toString();})
			 	 .map(dby2.get(yr));
			selectmke2.remove();optionsmke2.remove();
			selectmdl2.remove();optionsmdl2.remove();
			selectmke2 = d3.select("#cars-dropdown2")
    		  	  	 	   .append("select")
					   .style("max-width", "120px")
    		  	  		   .on('change',function(){mke=d3.select(this).property('value');
    		  	  		   						   changemke(2)});	

			optionsmke2 = selectmke2.selectAll('option')
					  	  	 	 	.data(dbm2.keys())
					  	  		  	.enter()
					  	  		  	.append('option')
					  	  		  	.text(function (d) { return d; });
			
			mke=dbm2.keys();
			mke=mke[0]
    		changemke(2);
		}
		
		else{
			dbm3=d3.nest()
			 	 .key(function(d){return d.make.toString();})
			 	 .map(dby3.get(yr));
			selectmke3.remove();optionsmke3.remove();
			selectmdl3.remove();optionsmdl3.remove();
			selectmke3 = d3.select("#cars-dropdown3")
    		  	  	 	   .append("select")
					       .style("max-width", "120px")
    		  	  		   .on('change',function(){mke=d3.select(this).property('value');
    		  	  		   							changemke(3)});	
    
			optionsmke3 = selectmke3.selectAll('option')
					  	  	 	 	.data(dbm3.keys())
					  	  		  	.enter()
					  	  		  	.append('option')
					  	  		  	.text(function (d) { return d; });

			mke=dbm3.keys();
			mke=mke[0]
    		changemke(3);
		}

	};
					
	function changemke(id){
		if(id==1){
			dmo1=d3.nest()
			 	 .key(function(d){return d.model.toString();})
			 	 .map(dbm1.get(mke.toString()));
			selectmdl1.remove();
			optionsmdl1.remove();

			selectmdl1 =d3.select("#cars-dropdown1")
    			  	 	 .append("select")
				         .style("max-width", "120px")
    			  	 	 .on('change',function(){mdl=d3.select(this).property('value');
    			  	 	 						car[0]=mdl;
    			  	 	 						changemdl(1);});

			optionsmdl1 = selectmdl1.selectAll('option')
							  	  .data(dmo1.keys())
							  	  .enter()
							  	  .append('option')
							  	  .text(function (d) { return d; });
							  	  
			mdl=dmo1.keys();
			car[0]=mdl[0];
    		changemdl(1);
            //selected_car.model= car[0];
            //console.log(selected_car)

            //get make after model changes
           /* dbm1.get(mke.toString()).forEach(function (car){
                if (car.model == selected_car.model) {
                    selected_car.make = car.make;
                }
            });*/
            //cluster_plot();
		}
		
		else if(id==2){
			dmo2=d3.nest()
			 	 .key(function(d){return d.model.toString();})
			 	 .map(dbm2.get(mke.toString()));
			selectmdl2.remove();optionsmdl2.remove();

			selectmdl2 =d3.select("#cars-dropdown2")
    			  	 	  .append("select")
					      .style("max-width", "120px")
    			  	 	  .on('change',function(){mdl=d3.select(this).property('value');
    			  	 	 						  car[1]=mdl;
    			  	 	 						  changemdl(2)});

			optionsmdl2 = selectmdl2.selectAll('option')
							  	  .data(dmo2.keys())
							  	  .enter()
							  	  .append('option')
							  	  .text(function (d) { return d; });

			mdl=dmo2.keys();
			car[1]=mdl[0]
    		changemdl(2);
		}
		
		else{
			dmo3=d3.nest()
			 	 .key(function(d){return d.model.toString();})
			 	 .map(dbm3.get(mke.toString()));
			selectmdl3.remove();optionsmdl3.remove();

			selectmdl3 =d3.select("#cars-dropdown3")
    			  	 	  .append("select")
						  .style("max-width", "120px")
    			  	 	  .on('change',function(){mdl=d3.select(this).property('value');
    			  	 	 						  car[2]=mdl;
    			  	 	 						  changemdl(3)});
    
			optionsmdl3 = selectmdl3.selectAll('option')
							  	    .data(dmo3.keys())
							  	    .enter()
							  	    .append('option')
							  	    .text(function (d) { return d; });

			mdl=dmo3.keys();
			car[2]=mdl[0];
    		changemdl(3);
		}

	};
	function changemdl(id){
		em=[];
		if(id==1){
			//console.log(selected_car)
			selected_car.make = mke;
			selected_car.model= car[0];
			cluster_plot();
			
			plot2xlabel.remove();
			plot2ylabel.remove();
			dbe=d3.nest()
			  	   .key(function(d){veh[id-1]='gas';
			  	   					if(parseInt(d.co2TailpipeAGpm)==0){return parseFloat(d.co2TailpipeGpm);}
			  	   					else {return (parseFloat(d.co2TailpipeGpm)+parseFloat(d.co2TailpipeAGpm)/2);}})
			  	   .map(dmo1.get(car[0].toString()));

			dbf=d3.nest()
				  .key(function(d){if(d.fuelType1=='Electricity'){veh[id-1]='electric';return parseFloat(d.combE);}
				  				   else if(d.fuelType2=='Electricity'){veh[id-1]='hybrid';uf=parseFloat(d.combinedUF);return parseFloat(d.combE);}
				  				  })
				  .map(dmo1.get(car[0].toString()));  
			if(veh[id-1]=='electric'){
				em[0]=(d3.mean(dbf.keys(),function(d){return d;}))/100;
				em[0]=em[0]*emission_calc
			}
			else if(veh[id-1]=='hybrid'){
				em[0]=(d3.mean(dbf.keys(),function(d){return d;}))/100;
				em[0]=em[0]*emission_calc*uf;
				em[0]=em[0]+(d3.mean(dbe.keys(),function(d){return d;})*(1-uf));
			}
			else
				{em=dbe.keys();
				 veh[id-1]='gas';
				 }

			//get make after model changes
			dmo1.get(car[0].toString()).forEach(function (car){
                if (car.make == selected_car.make) {
                    selected_car.model = car.model;
                }
            });
			xaxis2.remove();yaxis2.remove();drawbars.remove();clip[id-1].remove();clip[id].remove();clip[id+1].remove();
			emission(id);
		}
		else if(id==2){
			plot2xlabel.remove();
			plot2ylabel.remove();
			dbe=d3.nest()
			  	   .key(function(d){veh[id-1]='gas';
			  	   					if(parseInt(d.co2TailpipeAGpm)==0){return parseFloat(d.co2TailpipeGpm);}
			  	   					else {return (parseFloat(d.co2TailpipeGpm)+parseFloat(d.co2TailpipeAGpm)/2);}})
			  	   .map(dmo2.get(car[1].toString()));

			dbf=d3.nest()
				  .key(function(d){if(d.fuelType1=='Electricity'){veh[id-1]='electric';return parseFloat(d.combE);}
				  				   else if(d.fuelType2=='Electricity'){veh[id-1]='hybrid';uf=parseFloat(d.combinedUF);return parseFloat(d.combE);}
				  				  })
				  .map(dmo2.get(car[1].toString()));  
			if(veh[id-1]=='electric'){
				em[0]=(d3.mean(dbf.keys(),function(d){return d;}))/100;
				em[0]=em[0]*emission_calc
			}
			else if(veh[id-1]=='hybrid'){
				em[0]=(d3.mean(dbf.keys(),function(d){return d;}))/100;
				em[0]=em[0]*emission_calc*uf;
				em[0]=em[0]+(d3.mean(dbe.keys(),function(d){return d;})*(1-uf));
			}																								
			else
				{em=dbe.keys();
				 veh[id-1]='gas';
				 }
			xaxis2.remove();yaxis2.remove();drawbars.remove();clip[id-2].remove();clip[id-1].remove();clip[id].remove();
			emission(id);
            		
		}
		else{
			plot2xlabel.remove();
			plot2ylabel.remove();
			dbe=d3.nest()
			  	   .key(function(d){veh[id-1]='gas';
			  	   					if(parseInt(d.co2TailpipeAGpm)==0){return parseFloat(d.co2TailpipeGpm);}
			  	   					else {return (parseFloat(d.co2TailpipeGpm)+parseFloat(d.co2TailpipeAGpm)/2);}})
			  	   .map(dmo3.get(car[2].toString()));

			dbf=d3.nest()
				  .key(function(d){if(d.fuelType1=='Electricity'){veh[id-1]='electric';return parseFloat(d.combE);}
				  				   else if(d.fuelType2=='Electricity'){veh[id-1]='hybrid';uf=parseFloat(d.combinedUF);return parseFloat(d.combE);}
				  				  })
				  .map(dmo3.get(car[2].toString()));  
			if(veh[id-1]=='electric'){
				em[0]=(d3.mean(dbf.keys(),function(d){return d;}))/100;
				em[0]=em[0]*emission_calc
			}
			else if(veh[id-1]=='hybrid'){
				em[0]=(d3.mean(dbf.keys(),function(d){return d;}))/100;
				em[0]=em[0]*emission_calc*uf;
				em[0]=em[0]+(d3.mean(dbe.keys(),function(d){return d;})*(1-uf));
			}
			else
				{em=dbe.keys();
				 veh[id-1]='gas';
				 }
			xaxis2.remove();yaxis2.remove();drawbars.remove();clip[id-3].remove();clip[id-2].remove();clip[id-1].remove();
			emission(id);

		}

	};

// Create bar plot of emissions
var plot2 = d3.select('#plot-loc2').append('svg')
              .attr('width', width + margin.left + margin.right+90)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', 'translate('+margin.left+','+margin.top+')');


function powerGenColors(dataset) {
	var maxGen = {};
	var top5Source = [];
	var top5Val = [0];
	// Find the max of each power source
	Object.keys(dataset).forEach(function(element) {
		if (element !== 'DateTime' && element !== 'All') {
			maxGen[element] = d3.max(dataset[element], function(d) {return d;})
		}
	});
	
	// Finds the top 5 power sources
	Object.keys(maxGen).forEach(function(element) {
		maxGenSource = d3.max(dataset[element], function(d) {return d;})
		// Check each previous gen val
		for (i = 0; i <= top5Val.length && i < 5; i++) {
			if (top5Val.length === 0) {
				top5Val = [maxGenSource];
				top5Source = [element];
				break;
			} else if (maxGenSource > top5Val[i]) {
				top5Val.splice(i, 0, maxGenSource);
				top5Source.splice(i, 0, element);
				break;
			}
		}
	});
	var colorMap = []
	
	top5Source.slice(0, 5).forEach(function(source) {
		colorMap.push(colorScale(source))
	});
	
	return {'source': top5Source.slice(0, 5), 'color': colorMap};
};

                 
function plotFunc(d, tag) {

    var temp_data = [];

    d.DateTime.forEach(function(dTime) {
        temp_data.push([dTime, d[tag][d.DateTime.indexOf(dTime)]])
    });

    return temp_data;
};

function filter(data) {

    var temp_data = [];
    Object.entries(data).forEach(function(d) {
        if (selected_car.year == +d["1"]["0"] && selected_car.make == d["1"]["1"] && selected_car.model == d["1"]["2"]) {
            selected_car["VClass"] = d["1"]["5"]
        }
       });

    Object.entries(data).forEach(function(d) {
        if (selected_car.VClass == d["1"]["5"] && selected_car.year == +d["1"]["0"]) {

            var price = 0;
            var emission = 0;
            var emission_elec = 0;
            var dol_kw = 0;
            //$ per mile and gCO2 per mile
            uf = d["1"]["10"];

            emission_elec = Math.round((parseFloat(state_elec.total_emissions)*1000000*1000000)/(parseFloat(state_elec.total_power_gen)*1000000));
            dol_kw = parseFloat(state_elec.elec_price)/100.0;

            if (d["1"]["6"] == "Electricity"){ //Electric

                emission = emission_elec*d["1"]["9"]/100;
                price = d["1"]["9"]*dol_kw/100;
            }
            else if (d["1"]["7"] == "Electricity") { //Hybrid

                emission = emission_elec*d["1"]["9"]/100*uf + +d["1"]["3"]*(1-uf);

                price = (d["1"]["9"]/100*dol_kw)*uf + gas_price[state]/d["1"]["8"]*(1-uf)
            }
            else { //"Me Gusta La Gasolina" - Daddy Yankee
                emission = +d["1"]["3"]
                price = gas_price[state]/d["1"]["8"]
            }
            var row = [+d["1"]["0"], emission*8*18750/1000000, d["1"]["1"],d["1"]["2"],d["1"]["5"], "",Math.round(price*8*18750)]
            temp_data.push(row)

        }
    });

    var arrayLength = temp_data.length;
    var unique_data_car = [];
    var unique_data_info = [];

    for (var i = 0; i < arrayLength; i++) {
        var temp_car = [temp_data[i][0],temp_data[i][2],temp_data[i][3]];
        var temp_info = [temp_data[i][1],temp_data[i][4],temp_data[i][5],temp_data[i][6]];
        var is_unique = true;
        for (var j = 0; j < unique_data_car.length; j++) {
            if (unique_data_car[j][0] == temp_car[0] && unique_data_car[j][1] == temp_car[1] && unique_data_car[j][2] == temp_car[2]){
                is_unique = false;
                var idx = j;
            }
        }
        if (!is_unique && i > 0) {
            var orig_info = unique_data_info[idx]
            for (var j = 0; j < 4; j++){
                if (j == 0 || j == 3){
                orig_info[j] = (orig_info[j]+temp_info[j])/2;
                }
            }
            unique_data_info[idx] = orig_info;
        }
        else{
            unique_data_car.push(temp_car)
            unique_data_info.push(temp_info)
        }

    }
    var unique_data = [];
    for (var i = 0; i < unique_data_car.length; i++) {
        unique_data.push([unique_data_car[i][0], unique_data_info[i][0], unique_data_car[i][1], unique_data_car[i][2], unique_data_info[i][1], unique_data_info[i][2],  unique_data_info[i][3]]);
    }
    return unique_data;
};

function kMeans(data, xScale, yScale) {

        var data_c = [...new Set(data)];

        function getRandomSubarray(arr, size) {
            var shuffled = arr.slice(0), i = arr.length, temp, index;
            while (i--) {
                index = Math.floor((i + 1) * Math.random());
                temp = shuffled[index];

                shuffled[index] = shuffled[i];
                shuffled[i] = temp;
            }
            shuffled = shuffled.slice(0, size);
            sorted = shuffled.sort(function(a, b){return a[1]-b[1];});
            return sorted;
        }

        var centroids = getRandomSubarray(data_c,3);
        function getEuclidianDistance(a, b) {
            var dx = xScale(b[0]) - xScale(a[0]),
            dy = yScale(b[1]) - yScale(a[1]);

            return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        }

        function findClosestCentroid(point, centroids) {
            var closest = {color : "blue", distance: 500};

            centroids.forEach(function(d, i) {
                var distance = getEuclidianDistance(d, point);

                // Only update when the centroid is closer
                if (distance < closest.distance) {
                    closest.color = centroids[i][2];
                    closest.distance = distance;
                 }
            });

            point[5] = closest.color
            return point};

        var cents = []
        cents.push([centroids[0][0],centroids[0][1], "green"],[centroids[1][0],centroids[1][1], 'orange'],[centroids[2][0],centroids[2][1], '#CD4A4C'])

        //cluster iteration
        for (i = 0; i < 20; i++) {
            //find closest centroid
            data_c.forEach(function(point) {
                    point = findClosestCentroid(point, cents)

            });

            data_c, cents = computeClusterCenter(data_c)

            function computeClusterCenter(dat) {

                var cents = []
                cents.push([0,0, "orange"],[0,0, '#CD4A4C'],[0,0, 'green'])
                var blue_sum = [0,0,0]
                var red_sum = [0,0,0]
                var green_sum = [0,0,0]

                dat.forEach(function(point) {


                    if (point[5] == "orange") {
                        blue_sum[0] += point[0]
                        blue_sum[1] += point[1]
                        blue_sum[2] += 1

                    }
                    if (point[5] == "#CD4A4C") {
                         red_sum[0] += point[0]
                         red_sum[1] += point[1]
                         red_sum[2] += 1
                     }
                    if (point[5] == "green") {
                         green_sum[0] += point[0]
                         green_sum[1] += point[1]
                         green_sum[2] += 1
                     }

                    })

                blue_sum[0] = blue_sum[0]/blue_sum[2]
                blue_sum[1] = blue_sum[1]/blue_sum[2]

                green_sum[0] = green_sum[0]/green_sum[2]
                green_sum[1] = green_sum[1]/green_sum[2]

                red_sum[0] = red_sum[0]/red_sum[2]
                red_sum[1] = red_sum[1]/red_sum[2]

                cents[0][0] = blue_sum[0]
                cents[0][1] = blue_sum[1]
                cents[1][0] = red_sum[0]
                cents[1][1] = red_sum[1]
                cents[2][0] = green_sum[0]
                cents[2][1] = green_sum[1]

                return dat,cents;
            }
        }

        return data
}function kMeans(data, xScale, yScale) {

        var data_c = [...new Set(data)];

        function getRandomSubarray(arr, size) {
            var shuffled = arr.slice(0), i = arr.length, temp, index;
            while (i--) {
                index = Math.floor((i + 1) * Math.random());
                temp = shuffled[index];

                shuffled[index] = shuffled[i];
                shuffled[i] = temp;
            }
            shuffled = shuffled.slice(0, size);
            sorted = shuffled.sort(function(a, b){return a[1]-b[1];});
            return sorted;
        }

        if (data_c.length >= 3){
            centroid_length = 3;
        }
        else{
            centroid_length = data_c.length;
        }
        //console.log(centroid_length)
        var centroids = getRandomSubarray(data_c,centroid_length);
        function getEuclidianDistance(a, b) {
            var dx = xScale(b[0]) - xScale(a[0]),
            dy = yScale(b[1]) - yScale(a[1]);

            return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        }

        function findClosestCentroid(point, centroids) {
            var closest = {color : "orange", distance: 500};

            centroids.forEach(function(d, i) {
                var distance = getEuclidianDistance(d, point);

                // Only update when the centroid is closer
                if (distance < closest.distance) {
                    closest.color = centroids[i][2];
                    closest.distance = distance;
                 }
            });

            point[5] = closest.color
            return point};

        var cents = []
        var colors = ["green","#CD4A4C", "orange"]
        for (var i = 0; i < centroid_length; i++) {
            cents.push([centroids[i][0],centroids[i][1], colors[i]])
        }

        //cluster iteration
        for (i = 0; i < 20; i++) {
            //find closest centroid
            data_c.forEach(function(point) {
                    point = findClosestCentroid(point, cents)

            });

            data_c, cents = computeClusterCenter(data_c)

            function computeClusterCenter(dat) {

                var cents = []
                colors_inside = ["green","orange", "#CD4A4C"]
                for (var i = 0; i < centroid_length; i++) {
                    cents.push([0,0, colors[i]])
                }

                var blue_sum = [0,0,0]
                var red_sum = [0,0,0]
                var green_sum = [0,0,0]

                dat.forEach(function(point) {


                    if (point[5] == "orange") {
                        blue_sum[0] += point[0]
                        blue_sum[1] += point[1]
                        blue_sum[2] += 1

                    }
                    if (point[5] == "#CD4A4C") {
                         red_sum[0] += point[0]
                         red_sum[1] += point[1]
                         red_sum[2] += 1
                     }
                    if (point[5] == "green") {
                         green_sum[0] += point[0]
                         green_sum[1] += point[1]
                         green_sum[2] += 1
                     }

                    })

                blue_sum[0] = blue_sum[0]/blue_sum[2]
                blue_sum[1] = blue_sum[1]/blue_sum[2]

                green_sum[0] = green_sum[0]/green_sum[2]
                green_sum[1] = green_sum[1]/green_sum[2]

                red_sum[0] = red_sum[0]/red_sum[2]
                red_sum[1] = red_sum[1]/red_sum[2]

                sum_0 = [green_sum[0],blue_sum[0], red_sum[0]]
                sum_1 = [green_sum[1],blue_sum[1], red_sum[1]]

                for (var i = 0; i < centroid_length; i++) {
                    cents[i][0] = sum_0[i]
                    cents[i][1] = sum_1[i]
                }

                return dat,cents;
            }
        }

        return data
}


// API connect and data pull
var linepath,xaxis1,xaxis2,xaxis3,yaxis1,yaxis2,yaxis3,drawbars,legend,drawLine,plot_data,filt_data,clst_data,emissionsData;
function pullData(id) {

    $.getJSON('eia_api/data/'+id+'.json', function(data) {

        //Convert objects to arrays
        Object.entries(data).forEach(entry => {
            key = entry[0]
            data[key] = Object.values(data[key])
        });

		// Collection function to determine the max val for the selected state
		function setYScale(dataset) {
			var maxVal = 0;
			Object.keys(dataset).forEach(function(element) {
				if (element !== 'DateTime' && element !== 'All') {
					var val = d3.max(dataset[element], function(d) {return d;})
					if (val > maxVal) {maxVal = val}
				}
			});
			return maxVal;
		};

        // Adjust scale domain based on max data
        xScale.domain([d3.min(data.DateTime, function(d) { return d;}),
                       d3.max(data.DateTime, function(d) { return d;})]);
        yScale.domain([0, setYScale(data)]);
        
        
        drawLine = d3.line()
                 .x(function(d) {return xScale(d[0]);})
                 .y(function(d) {return yScale(d[1])});
                         
		var j=[];

        Object.entries(data).forEach( src => {
			// Do not plot datetime or total generation
            if (src[0] !== 'DateTime' && src[0] !== 'All') {
            
                plot_data = plotFunc(data, src[0])
                // Draw path
           		linepath=plot1.append('path')
                    		  .attr('d', drawLine(plot_data))
                    	      .attr('stroke',function(d){return colorScale(src[0]);})
                    		  .attr('fill', 'none')
                    		  .attr('stroke-width', 2)
                    		  .attr("transform", "translate("+20+",0)")
                            
            	var curtain = plot1.append('rect')
  									.attr('x', -1 * (width))
  									.attr('y', -1 * height)
  									.attr('height', height-50)
  									.attr('width', (width-10))
  									.attr('class', 'curtain')
  									.attr('transform', 'rotate(180)')
  									.style('fill', '#ffffff')
  									
                curtain.transition()
                       .duration(3000)
                       .ease(d3.easeLinear)
                       .attr('x', -2 *(width+10))
            };
        });


        // Y-axis
	yaxis1=plot1.append('g')
			 .attr("transform", "translate("+20+",0)")
             .call(d3.axisLeft(yScale)
                     .ticks(5))
    yAxisTitle1=plot1.append("text")
					 .attr("transform","translate(" + 0 + " ," +(250) + ")")
					 .attr("dx","-250")
					 .attr("dy","-25")  
					 .style("text-anchor", "middle")          
					 .attr("transform","rotate(-90)")
					 .style("font-size", "14px")
					 .text("Average Annual Power Generation (GWh)")
          

    // X-axis
    xaxis1=plot1.append('g')
                .attr("transform", "translate("+20+"," + (height-50) + ")")
              	.call(d3.axisBottom(xScale))
    xAxisTitle1=plot1.append("text")
					 .attr("transform","translate(" + (width/2) + " ," +(height-20) + ")")
					 .style("font-size", "14px")
					 .text("Year")
 
 	var legData = powerGenColors(data)            
	
    legend = plot1.selectAll(".legend")
      				  .data(legData.source)
      		 		  .enter().append("g")
      				  .attr("class", "legend")
      				  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })

     legend.append("circle")
      	   .attr("cx",width)
     	   .attr("cy",20)
    	   .attr("r", 5)
      	   .style("fill", function(d,i) {
        		return legData.color[i];
      		});

  	 legend.append("text")
      		  .attr("x", width - 20)
      		  .attr("y", 19)
      	  	  .attr("dy", ".40em")
      		  .style("text-anchor", "end")
      		  .style("font-size","12px")
      		  .text(function(d) { return d; });

    })


}

get_state_elec("AL")
pullData(state);
emission_sum(state);

function cluster_plot(){

	xaxis3.remove();yaxis3.remove();
	yAxisTitle3.remove();xAxisTitle3.remove();
	plot3.selectAll('circle').remove()
	plot3.selectAll('path').remove()
	clustering();

}

function clustering(){

    d3.csv('eia_api/data/vehicle.csv').then(function(data){

            //Convert objects to arrays
            Object.entries(data).forEach(entry => {
                key = entry[0]
                data[key] = Object.values(data[key])
            });
            var s=d3.select("select").property('value');
            s=s.split("-");
            state=s[0];
            id = s[1];
            get_state_elec(id)
            filt_data = filter(data)

            // Adjust scale domain based on max data
            xScale3.domain([0,
                           d3.max(filt_data, function(d) { return d[6];})]);
            yScale3.domain([0,
                           d3.max(filt_data, function(d) { return d[1];})]);

            clst_data = kMeans(filt_data,xScale3,yScale3);
            var tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
                            return "Make: " + d[2] + "<br />"
                            + "Model: " + d[3] + "<br />"
                            + "Emissions: " + Math.round(d[1]) + " Tons of CO2<br />"
                            + "Cost: $" + d[6] + "<br />"
                            + "Year: " + d[0] + "<br />"
                            + "Class: " + d[4] + "<br />"; });
            plot3.call(tip)

            // Draw scatter plot
            plot3.selectAll('circle')
                .data(clst_data)
                .enter()
                .append("circle")
                .attr("cx",function(d) { return xScale3(d[6]); })
                .attr("cy",function(d) { return  yScale3(d[1]) + 20; })
                .attr("r", function(d) {
                              if (selected_car.make == d[2] && selected_car.model == d[3]) {
                              return 5;}
                              else {
                              return 3;}})
                .style("fill", function(d) {
                               return d[5];})
                .style("stroke", function(d) {
                              if (selected_car.make == d[2] && selected_car.model == d[3]) {
                              return "black";}
                              else {
                              return "transparent";}})
                .on('mouseover', function(d){
                                       var x = d3.event.pageX,
                                           y = d3.event.pageY;

                                       tip.show(d);

                                       tip.style('top', (y - 50) + "px");
                                       tip.style('left', (x + 20) + "px");
                                     })
                .on('mouseout', tip.hide);

            if (typeof yaxis3 !== 'undefined') {
  				yaxis3.remove();
  				yAxisTitle3.remove();
  				xaxis3.remove();
  				xAxisTitle3.remove();
			}

            yaxis3=plot3.append('g')
                .attr("transform", "translate("+5+","+20+")")
                 .call(d3.axisLeft(yScale3)
                         .ticks(4))
            yAxisTitle3=plot3.append("text")
					 .attr("transform","translate(" + 0 + " ," +(250) + ")")
					 .attr("dx","-220")
					 .attr("dy","-25")
					 .style("text-anchor", "middle")
					 .attr("transform","rotate(-90)")
					 .style("font-size", "14px")
					 .text("Lifetime Carbon Dioxide Emissions (Metric Tons of CO2)")
			
            xaxis3=plot3.append('g')
                 .attr("transform", "translate("+5+"," + (height-80) + ")")
                 .call(d3.axisBottom(xScale3).ticks(5))
			//console.log(xScale3.ticks(5))
            xAxisTitle3=plot3.append("text")
					 .attr("transform","translate(" + (width/2-70) + " ," +(height-40) + ")")
					 .style("font-size", "14px")
					 .text("Lifetime Fuel Cost ($)")
    });



}

clustering();

function emission(id){

	emissionsData.splice(id-1,1,d3.mean(em))
	emissionsLabel.splice(id-1,1,car[id-1].toString())
	xBar.domain([0,4])	
	yBar.domain([0,d3.max(emissionsData)+50]);

	drawbars=plot2.selectAll('bar')
             			 .data(emissionsData)
            		     .enter().append('rect')
             			 .style('fill', 'grey')
             			 .attr('x', function(d,i) {return xBar(i+1);})
    					 .attr('width', 50)
            			 .attr('y', function(d) {return yBar(0)})
        				 .attr('height', 0)
        				 .on("mouseenter", function(actual,i){
        				 			d3.select(this)
        				 			  .style('opacity',1.0)
        				 			  .attr("width",60)
        				 			  .attr('height', function(d) {return height-50-yBar(d);})
        				 			  })
        				 .on("mouseleave",function(actual,i){
        				 			d3.select(this)
            			 			  .style('opacity',.7)
        				 			  .attr("width",50)
        				 			  .attr('height', function(d) {return height-50-yBar(d);});
        				 			  });
    drawbars.transition()
        	.delay(function (d, i) { return i*50; })
	   	    .ease(d3.easeLinear)
			.attr('y', function(d) {return yBar(d)})
            .attr('height', function(d,i){h[i]=height-50-yBar(d);return h[i];})
            .style('fill',function(d,i){if(veh[i]=='gas'){return 'grey';}
            			 				else if(veh[i]=='electric') {return 'green';}
            			 				else{return 'blue';}
            			 				})
        	.style('opacity',0.7)
	
	for(i=0;i<3;i++){
		clip[i]=plot2.append('svg:image')
    	 			 .attr('xlink:href','./images/'+veh[i]+'.png')
    	 			 .attr('x',xBar(i+1))
    	 			 .attr('y',height-120-h[i])
    	 			 .attr("width",50)
    	 			 .attr("height",50);
    }

    yaxis2=plot2.append('g')
    			.attr("transform", "translate("+20+",0)")
                .call(d3.axisLeft(yBar))
                
    xaxis2=plot2.append('g')
             .attr("transform", "translate("+20+"," + (height-50) + ")")
             .call(d3.axisBottom(xBar).ticks(0))


    plot2xlabel=plot2.append('g')
    				.selectAll('text')
					.data(emissionsLabel)
					.enter()
					.append('text')
                    .attr("transform", function(d,i) {return "translate(" + (xBar(i+1)+15) + "," + (yBar(0)+margin.bottom) + ") rotate(10)";})
//					.attr('x', function(d,i){return xBar(i+1)+25;})
//     	 			.attr('y', function(d){return yBar(0)+margin.bottom;})
     	 			.text(function(d){return d;})
     	 			.attr('fill','black')
     	 			.style("font-size", "12px")
     	 			.attr('text-anchor','start');

     plot2ylabel=plot2.append("text")
    	 			  .attr("transform","translate(" + 0 + " ," +(250) + ")")
    	 			  .attr("dx","-250")
    				  .attr("dy","-20")
    	 			  .style("text-anchor", "middle")
    	 			  .attr("transform","rotate(-90)")
    	 			  .style("font-size", "14px")
         			  .text("CO2 Emissions (grams/mile)");
}

emission(1)

function emission_sum(id) {

	d3.csv('eia_api/data/'+id+'_sum.csv').then(function(data){
		emission_calc = Math.round((parseFloat(data[0].total_emissions)*1000000*1000000)/(parseFloat(data[0].total_power_gen)*1000000));
		title1b=plot1.append('text')
            .text('Effective Emissions: '+emission_calc+' gCO2/kwhr')
            .attr('class', 'title')
            .attr('x', 0)
            .attr('y', 60);
		for(var i=0;i<3;i++){
			if(veh[i]=='electric'||veh[i]=='hybrid')
				{changemdl(i+1);}
		}

    })
}

function get_state_elec(id) {
    d3.csv('eia_api/data/'+id+'_sum.csv').then(function(data){
        state_elec = {elec_price: +data[0].elec_price,total_power_gen: +data[0].total_power_gen, total_emissions: data[0].total_emissions}
    })
}

// Add detail to plots
var title1= plot1.append('g')
		 .append('text')
     		 .text('Power Generation Sources: '+state)
     		 .attr('class', 'title')
     		 .attr('x', 0)
     		 .attr('y', 30)

var title2= plot2.append('g')
				.append('text')
     			 .text('Total Emissions: '+state)
     			 .attr('class', 'title')
     			 .attr("text-anchor", "middle")
    			 .attr('x', width/2 + margin.left)
     			 .attr('y', 50)

var title3= plot3.append('g')
             .append('text')
             .text('Lifetime Emission and Fuel Cost Living in ' + state)
             .attr('class', 'title')
             .attr("text-anchor", "middle")
             .attr('x', (width/2 + 10))
             .attr('y', 10)

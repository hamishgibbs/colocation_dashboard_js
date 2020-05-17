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
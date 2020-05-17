
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
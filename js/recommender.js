/*--- GLOBAL VARS ---*/
var username = "";
var apiKey = "";

/*--- INITIAL BINDS ---*/
$(document).ready(function(){
	bindSubmitApiKey();
	bindSubmitUsername();
	bindUserTopArtistsRecommendations();
	bindSpotifySimilarArtists();
});

/*--- API AND USER BINDINGS ---*/
function bindSubmitApiKey(){
	$("#apikey_form").submit(function(event){
		event.preventDefault();
		apiKey = $("#apikey_input").val();
		$(".display_none").removeClass("display_none");
		$("#apikey_form").addClass("display_none");
	});
}
function bindSubmitUsername(){
	$("#username_form").submit(function(event){
		event.preventDefault();
		username = $("#username_input").val();
		if(checkUsername(username)){
			searchUserInfo(username);
			$('html,body').delay(500).animate({'scrollTop' : $("#music_section").offset().top},1000);
		}else{
			alert("Wrong username.")
		}
	});
}

/*--- AUXILIAR FUNCTIONS ---*/
function checkUsername(username){
	return /^[a-z0-9_-]{3,15}$/.test(username);
}

function ajaxCall(url, callback){
	$.ajax({
	    url: url,
	    dataType: "json",
	    success: function (response) {
	        callback(response);
	    }
 	});
}
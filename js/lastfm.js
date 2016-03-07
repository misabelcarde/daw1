/*--- GLOBAL VARS ---*/
var urlLastfm = "http://ws.audioscrobbler.com/2.0/?format=json";
var userInfoMethod = "user.getInfo";
var userTopArtistsMethod = "user.getTopArtists";
var artistSimilarMethod = "artist.getSimilar";
var username = "";
var apiKey = "";

/*--- INITIAL BINDS ---*/
$(document).ready(function(){
	$("#apikey_form").submit(function(event){
		event.preventDefault();
		apiKey = $("#apikey_input").val();
		$(".display_none").removeClass("display_none");
		$("#apikey_form").addClass("display_none");
	});
	$("#username_form").submit(function(event){
		event.preventDefault();
		username = $("#username_input").val();
		if(checkUsername(username)){
			$.when(searchUserInfo(username))
			.then($('html,body').delay(500).animate({'scrollTop' : $("#music_section").offset().top},1000));
		}else{
			alert("Wrong username.")
		}
	});
});

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

function generateApiUrl(method, optionalUrlParam){
	var content = urlLastfm + "&" + "api_key=" + apiKey + "&" + "method=" + method;
	if(optionalUrlParam!=undefined){
		for(i in optionalUrlParam){
			content += "&" + optionalUrlParam[i][0] + "=" + optionalUrlParam[i][1];
		}
	}
	return content;
}

function lastfmApiCall(method, callback, optionalUrlParam){
	ajaxCall(generateApiUrl(method, optionalUrlParam), callback);
}

/*--- SEARCH USER INFO ---*/
function searchUserInfo(username){
	lastfmApiCall(userInfoMethod, function(data){
		$("#header_personal_info").empty();
		var content = userInfoTemplate(data.user.realname, data.user.playcount, data.user.image[2]["#text"]);
		$("#header_personal_info").addClass("header_personal_info_data");
		$("#header_personal_info").append(content);
		searchUserTopArtists(username);
	}, [["user", username]]);
}
function userInfoTemplate(realname, count, photo){
	return "<span class='header_info header_info_title'>" + realname + "</span>" +
	"<span class='header_info'>" + count + " scrobblings</span>" +
	"<img src='" + photo + "' class='header_info'>";
}

/*--- SEARCH USER TOP ARTISTS ---*/
function searchUserTopArtists(username){
	$.when(userTopArtistCall(username))
	.then(userTopArtistsBindRecommendations());
}
function userTopArtistCall(username){
	lastfmApiCall(userTopArtistsMethod, function(data){
		$("#music_section_container").empty();
		var content = topArtistsTemplate(data.topartists.artist);
		$("#music_section_container").append(content);
	}, [["user", username], ["period", "6month"], ["limit", "20"]]);
}
function userTopArtistsBindRecommendations(){
	$(document).on("click",".artist_container", function(){
		if($(this).hasClass("selected_recommendation")){
			$(this).removeClass("selected_recommendation selected_artist");
			$(this).find("img").removeClass("gray_image");
			$("#current_recommendation").remove();
			$("#music_section_container").addClass("text_align_center");
		}else{
			if($(".selected_recommendation").length > 0){
				$(".selected_recommendation").find("img").removeClass("gray_image");
				$(".selected_recommendation").removeClass("selected_recommendation selected_artist");
				$("#current_recommendation").remove();	
				$("#music_section_container").addClass("text_align_center");
			}			
			$(this).addClass("selected_recommendation selected_artist");
			$(this).find("img").addClass("gray_image");
			$("#music_section_container").removeClass("text_align_center");
			$.when(searchSimilarArtists($(this).attr("id")))
			.then($('html,body').animate({'scrollTop' : $(this).offset().top},1000));
		}	
	});
}
function topArtistsTemplate(topArtists){
	var artistContent = "";
	for(i in topArtists){
		artistContent += artistTemplate(topArtists[i].name, topArtists[i].image[3]["#text"]);
	}
	return artistContent;
}
function artistTemplate(name, photo){
	return "<div id='" + name.replace(" ","--") + "' class='artist_container'>" + "<img src='" + photo + "'>" + "<span>" + name + "</span>" + "</div>";
}

/*--- SEARCH SIMILAR ARTISTS ---*/
function searchSimilarArtists(artist){
	lastfmApiCall(artistSimilarMethod, function(data){
		$("#"+artist).after(similarArtistsTemplate(data.similarartists.artist));
	}, [["artist", artist.replace("--","+")], ["limit", "12"]]);
}
function similarArtistsTemplate(similarArtists){
	console.log(similarArtists);
	var artistsContent = "<div id='current_recommendation'>";
	for(i in similarArtists){
		artistsContent += similarArtistTemplate(similarArtists[i].name, similarArtists[i].image[3]["#text"]);
	}
	artistsContent += "</div>";
	return artistsContent;
}
function similarArtistTemplate(name, photo){
	return "<div id='similar_" + name.replace(" ","--") + "' class='similar_artist_container'>" + "<img src='" + photo + "'>" + "<span>" + name + "</span>" + "</div>";
}
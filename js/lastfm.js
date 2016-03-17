/*--- GLOBAL VARS ---*/
var urlLastfm = "http://ws.audioscrobbler.com/2.0/?format=json";
var userInfoMethod = "user.getInfo";
var userTopArtistsMethod = "user.getTopArtists";
var artistSimilarMethod = "artist.getSimilar";
var currentTrack = null;
var playingClass = "playing_preview";

/*--- AUXILIAR FUNCTIONS ---*/
function generateLastfmApiUrl(method, optionalUrlParam){
	var content = urlLastfm + "&" + "api_key=" + apiKey + "&" + "method=" + method;
	if(optionalUrlParam!=undefined){
		for(i in optionalUrlParam){
			content += "&" + optionalUrlParam[i][0] + "=" + optionalUrlParam[i][1];
		}
	}
	return content;
}

function lastfmApiCall(method, callback, optionalUrlParam){
	ajaxCall(generateLastfmApiUrl(method, optionalUrlParam), callback);
}

/*--- BINDINGS ---*/
function bindUserTopArtistsRecommendations(){
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
			searchSimilarArtists($(this));
		}	
	});
}
function bindSpotifySimilarArtists(){
	$(document).on("click",".similar_artist_container", function(){
		var targetArtist = $(this);
		console.log(targetArtist);
		if(currentTrack !== null && targetArtist.hasClass(playingClass)){
			$("."+playingClass).removeClass(playingClass);
			currentTrack.pause();
		}else{
			$("."+playingClass).removeClass(playingClass);
			if(currentTrack !== null){
				currentTrack.pause();
			}
			searchSpotifyArtistSong($(this).attr("id").replace("similar_", "").replace(/--/g, " "), function(){
				if(currentTrack !== null){
					targetArtist.addClass(playingClass);	
					currentTrack.play();

					currentTrack.addEventListener('ended', function() {
						targetArtist.removeClass(playingClass);
						currentTrack = null;
			        });
			        currentTrack.addEventListener('pause', function() {
			            targetArtist.removeClass(playingClass);
			            currentTrack = null;
			        });
				}
			});
		}
		
	});
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
	lastfmApiCall(userTopArtistsMethod, function(data){
		$("#music_section_container").empty();
		var content = topArtistsTemplate(data.topartists.artist);
		$("#music_section_container").append(content);
		//bindUserTopArtistsRecommendations();
		//bindSpotifySimilarArtists();
	}, [["user", username], ["period", "6month"], ["limit", "20"]]);
}
function topArtistsTemplate(topArtists){
	var artistContent = "";
	for(i in topArtists){
		artistContent += artistTemplate(topArtists[i].name, topArtists[i].image[3]["#text"]);
	}
	return artistContent;
}
function artistTemplate(name, photo){
	return "<div id='" + name.replace(/\s/g,"--") + "' class='artist_container'>" + "<img src='" + (photo != null && photo != "" ? photo : "img/listen.jpg") + "'>" + "<span>" + name + "</span>" + "</div>";
}

/*--- SEARCH SIMILAR ARTISTS ---*/
function searchSimilarArtists(artistContainer){
	lastfmApiCall(artistSimilarMethod, function(data){
		$("#"+artistContainer.attr("id")).after(similarArtistsTemplate(data.similarartists.artist));
		$('html,body').animate({'scrollTop' : artistContainer.offset().top},1000);
	}, [["artist", artistContainer.attr("id").replace(/--/g,"+")], ["limit", "12"]]);
}
function similarArtistsTemplate(similarArtists){
	var artistsContent = "<div id='current_recommendation'>";
	for(i in similarArtists){
		artistsContent += similarArtistTemplate(similarArtists[i].name, similarArtists[i].image[3]["#text"]);
	}
	artistsContent += "</div>";
	return artistsContent;
}
function similarArtistTemplate(name, photo){
	return "<div id='similar_" + name.replace(/\s/g,"--") + "' class='similar_artist_container'>" + "<img src='" + (photo != null && photo != "" ? photo : "img/listen.jpg") + "'>" + "<span>" + name + "</span>" + "</div>";
}
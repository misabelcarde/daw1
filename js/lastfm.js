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
/*
* Search similar artists as the selected one. Add a new section for it.
* Pause any song which could be playing.
*/
function bindUserTopArtistsRecommendations(){
	$(document).on("click",".artist_container", function(){
		jPlayerPause();
		/*if(currentTrack !== null ){
			currentTrack.pause();
		}*/	

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
/*
* Once similar artists as the selected one are displayed, when one of them
* is selected its song starts playing (its song's URL is searched with the
* Spotify API).
*/
function bindSpotifySimilarArtists(){
	$(document).on("click",".similar_artist_container", function(){
		var targetArtist = $(this);
		var jPlayerConfigured = jPlayerConfigArtistContainer(targetArtist);

		if(jPlayerConfigured){
			searchSpotifyArtistSong(targetArtist.attr("id").replace("similar_", "").replace(/--/g, " "), function(){
				//This callback will be executed when currentTrack contains the URL of the song (see spotify.js).
				jPlayerSong();
				targetArtist.addClass(playingClass);
			});	
		}else{
			targetArtist.removeClass(playingClass);
		}

		/*if(currentTrack !== null && targetArtist.hasClass(playingClass)){
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
		}*/
	});
}

/*---JPLAYER---*/
var jPlayerInitDiv ="<div id='jp_container_1' class='jp-audio' role='application' aria-label='media player'> <div id='jp_container_1_action' class='jp-play' role='button' tabindex='0'>";
var jPlayerEndDiv = "</div></div>";

/*
* When an artist is selected (its song is playing or we want to play it),
* this method configure the appropiate jPlayer HTML (remove it if we want)
* to stop the song, or add it if we want to play the song).
*/
function jPlayerConfigArtistContainer(selectedArtist){
	if(selectedArtist.find("div").attr("id") == "jp_container_1"){
		//Delete jPlayer HTML for selectedArtist
		selectedArtist.html(selectedArtist.find("div").find("div").html());
		selectedArtist.removeClass(playingClass);
		return false;
	}else{
		//Delete jPlayer HTML for current jPlayers if exixsts
		var currentJplayers = $(".jp-audio");
		if(currentJplayers.length > 0){
			for(i = 0; i < currentJplayers.length; i++){
				var newhtml = $(currentJplayers[i]).find("div").html();
				$(currentJplayers[i]).parent().html(newhtml).removeClass(playingClass);;
			
			}
		}

		//Add jPlayer HTML for selectedArtist
		selectedArtist.html(jPlayerInitDiv + selectedArtist.html() + jPlayerEndDiv);
		selectedArtist.addClass(playingClass);
		return true;
	}
}
/*
* jPlayer functions to play/stop the song. The song is provided as a URL
* throw the global variable "currentTrack".
*/
function jPlayerSong(){
	if($("#jp_container_1").hasClass("jp-state-playing")){
		$("#jquery_jplayer_1").jPlayer("pause");
	}else{
		$("#jquery_jplayer_1").jPlayer("destroy");
        $("#jquery_jplayer_1").jPlayer({
            ready: function(event) {
                $(this).jPlayer("setMedia", {
        		    mp3: currentTrack
                }).jPlayer("play");
            },
            supplied: "mp3",
          	useStateClassSkin: true,
          	autoBlur: false
        });
	}
}
function jPlayerPause(){
	if($("#jp_container_1").hasClass("jp-state-playing")){
		$("#jquery_jplayer_1").jPlayer("pause");
	}
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
	return "<div class='header_info_div'><span class='header_info header_info_title'>" + realname + "</span>" +
	"<span class='header_info'>" + count + " scrobblings</span></div>" +
	"<div class='header_info_img_div'><img src='" + photo + "'></div>";
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
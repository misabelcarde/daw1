var urlLastfm = "http://ws.audioscrobbler.com/2.0/?format=json";
var userInfoMethod = "user.getInfo";
var userTopArtists = "user.getTopArtists";
var username = "";
var apiKey = "";

$(document).ready(function(){
	$("#apikey-form").submit(function(event){
		event.preventDefault();
		apiKey = $("#apikey-input").val();
		$(".display_none").removeClass("display_none");
		$("#apikey-form").addClass("display_none");
	});
	$("#username-form").submit(function(event){
		event.preventDefault();
		username = $("#username-input").val();
		if(checkUsername(username)){
			searchUserInfo(username);
		}else{
			alert("Wrong username.")
		}
	});
});

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

function generateApiUrl(method, username, optionalUrlParam){
	var content = urlLastfm + "&" + "api_key=" + apiKey + "&" + "method=" + method;
	if(username!=undefined){
		content += "&" + "user=" + username;
	}
	if(optionalUrlParam!=undefined){
		for(i in optionalUrlParam){
			content += "&" + optionalUrlParam[i][0] + "=" + optionalUrlParam[i][1];
		}
	}
	return content;
}

function lastfmApiCall(method, username, callback, optionalUrlParam){
	ajaxCall(generateApiUrl(method, username, optionalUrlParam), callback);
}

function searchUserInfo(username){
	lastfmApiCall(userInfoMethod, username, function(data){
		$("#header_personal_info").empty();
		var content = userInfoTemplate(data.user.realname, data.user.playcount, data.user.image[2]["#text"]);
		$("#header_personal_info").addClass("header_personal_info_data");
		$("#header_personal_info").append(content);
		searchUserTopArtists(username);
	});
}
function userInfoTemplate(realname, count, photo){
	return "<span class='header_info header_info_title'>" + realname + "</span>" +
	"<span class='header_info'>" + count + " scrobblings</span>" +
	"<img src='" + photo + "' class='header_info'>";
}

function searchUserTopArtists(username){
	lastfmApiCall(userTopArtists, username, function(data){
		$("#music_section_container").empty();
		var content = recommendationTemplate(data.topartists.artist);
		$("#music_section_container").append(content);
	}, [["period", "6month"], ["limit", "20"]]);
}
function recommendationTemplate(topArtists){
	var artistContent = "";
	for(i in topArtists){
		artistContent += artistTemplate(topArtists[i].name, topArtists[i].image[3]["#text"]);
	}
	return artistContent;
}
function artistTemplate(name, photo){
	return "<div class='artist_container'>" + "<img src='" + photo + "'>" + "<span>" + name + "</span>" + "</div>";
}
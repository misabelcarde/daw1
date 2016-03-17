//http://jsfiddle.net/UT7bQ/10/
/*--- GLOBAL VARS ---*/
var urlSpotifySearch = "https://api.spotify.com/v1/search?";
var urlSpotifyArtistTopTracks = "https://api.spotify.com/v1/artists/{id}/top-tracks?country=ES";

/*--- AUXILIAR FUNCTIONS ---*/
function generateSpotifyApiUrl(url, urlParam){
	var content = url;
	if(urlParam!=undefined){
		for(i in urlParam){
			content += "&" + urlParam[i][0] + "=" + urlParam[i][1];
		}
	}
	return content;
}

function spotifyApiCall(url, callback, urlParam){
	ajaxCall(generateSpotifyApiUrl(url, urlParam), callback);
}

/*--- ARTIST SEARCH ---*/
function searchSpotifyArtistSong(artist, callback){
	spotifyApiCall(urlSpotifySearch, function(data){
		if(data.artists.items[0] != undefined){
			searchSpotifyArtistTopTracks(data.artists.items[0].id, callback);
		}else{
			currentTrack = null;
		}
	},[["q", artist.replace(/\s/g, "%20")], ["type", "artist"]]);
}

function searchSpotifyArtistTopTracks(idArtist, callback){
	spotifyApiCall(urlSpotifyArtistTopTracks.replace("{id}",idArtist), function(data){
		currentTrack = null;
		if(data.tracks.length > 0){
			currentTrack = new Audio(data.tracks[0].preview_url);
			callback();
		}
		//currentTracks = [];
		//for(i in data.tracks){
		//	currentTracks.push(new Audio(data.tracks[i].preview_url));
		//}
	});
}
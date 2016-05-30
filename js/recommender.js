/*--- GLOBAL VARS ---*/
var username = "";
var apiKey = "";
var apiKeyStorage = "apiKeyLastfm";

/*--- INITIAL BINDS AND CONFIG---*/
$(document).ready(function(){
	bindSubmitApiKey();
	bindConfigButton();
	bindSubmitUsername();
	bindUserTopArtistsRecommendations();
	bindSpotifySimilarArtists();

	configLastfmApiKeyFromStorage();
});

/*--- API AND USER BINDINGS ---*/
function bindSubmitApiKey(){
	$("#apikey_form").submit(function(event){
		event.preventDefault();
		apiKey = $("#apikey_input").val();
		saveLastfmApiKeyToStorage();
		//$(".display_none").removeClass("display_none");
		$("#username_form").removeClass("display_none");
		$("#apikey_form").addClass("display_none");
	});
}
function bindConfigButton(){
	$("#api_config").click(function(){
		removeLastfmApiKeyFromStorage();
		$("#apikey_form").removeClass("display_none");
		$("#username_form").addClass("display_none");
		$("#music_section").addClass("display_none");
		$("#header_personal_info").empty();
		$("#header_personal_info").removeClass();
	});
}
function bindSubmitUsername(){
	$("#username_form").submit(function(event){
		event.preventDefault();
		username = $("#username_input").val();
		if(checkUsername(username)){
			$("#music_section").removeClass("display_none");
			$("#header_personal_info").removeClass("display_none");
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

function configLastfmApiKeyFromStorage(){
	if (typeof(Storage) !== "undefined") {
		apiStorageVal = localStorage.getItem(apiKeyStorage);
		if(apiStorageVal !== null && apiStorageVal !== ""){
			apiKey = apiStorageVal;
			$(".display_none").removeClass("display_none");
			$("#apikey_form").addClass("display_none");
		}
	}
}

function saveLastfmApiKeyToStorage(){
	if (typeof(Storage) !== "undefined") {
		localStorage.setItem(apiKeyStorage, apiKey);
	}
}

function removeLastfmApiKeyFromStorage(){
	if (typeof(Storage) !== "undefined") {
		localStorage.setItem(apiKeyStorage, "");
	}
}
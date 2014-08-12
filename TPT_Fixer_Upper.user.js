// ==UserScript==
// @name        TPT Fixer Upper
// @namespace   https://github.com/wolfy1339/UserScripts
// @description This Script fixes some bugs/errors on The Powder Toy's website (http://powdertoy.co.uk)
// @author      wolfy1339
// @copyright   2014+, wolfy1339
// @license     GNU GPLv3
// @downloadURL https://openuserjs.org/install/wolfy1339/TPT_Fixer_Upper.user.js
// @version     1.32
// @grant       none
// @include     http*://powdertoy.co.uk/*
// ==/UserScript==
var $ = jQuery.noConflict();

//Fix GitHub watch button
$(".social-github iframe").attr('src', "http://ghbtns.com/github-btn.html?user=simtr&repo=The-Powder-Toy&type=watch&count=true");
//Fixes for the rebuilt search feature
$(".search-avatar").css({"margin-right":"10px"});
$(".search-thumbnail img").css({"border-radius":"3px", "border":"2px solid #DDD"});
$(".search-result .details").css({"margin-left":"70px", "margin-right":"20px"});
$(".posts .search-thumbnail").css({"width":"63px"});
$(".threads .search-thumbnail").css({"width":"63px"});
//Fix, if number is big it won't overflow as much
$(".TopicList li .Meta span").css({"max-height":"14px", "font-size":"10px"});
//Make Groups system better
if (window.location.toString().indexOf("/Groups/")!=-1){
  $(".Pageheader").addClass("breadcrumb").css({"margin":"0","border-top":"none", "border-right":"none", "border-left":"none"}).removeClass("Pageheader");
  $(".Meta .Author img").css({"z-index":"-1", "border-radius":"3px", "box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)", "-moz-box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)", "-webkit-box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)", "-o-box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)", "-ms-box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)", "background":"-webkit-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%)", "background":"-o-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%)", "background":"-ms-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%)"});
}
if (window.location.toString().indexOf("/Groups/Page/Index.html")!=-1){
	$(".breadcrumb").addClass("Pageheader").removeClass("breadcrumb");
}
//Upgrade bootstrap version because why not?
$("head").prepend('<link rel="stylesheet" href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap.min.css">');

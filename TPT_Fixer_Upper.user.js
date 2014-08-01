// ==UserScript==
// @name        TPT Fixer Upper
// @namespace   https://github.com/wolfy1339/UserScripts
// @description This Script fixes some bugs/errors on The Powder Toy's website (http://powdertoy.co.uk)
// @author      wolfy1339
// @copyright   2014+, wolfy1339
// @license     GNU GPLv3
// @downloadURL https://openuserjs.org/install/wolfy1339/TPT_Fixer_Upper.user.js
// @version     1.11
// @grant       none
// @include     http*://powdertoy.co.uk/*
// ==/UserScript==
//Fix GitHub watch button
$(".social-github iframe").attr('src', "http://ghbtns.com/github-btn.html?user=simtr&repo=The-Powder-Toy&type=watch&count=true");
//Make Groups system better
$(".Meta .author img").css({"z-index":"-1", "border-radius":"3px", "position":"relative", "box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)", "-moz-box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)", "-webkit-box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)", "-o-box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)", "-ms-box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)", "background":"-webkit-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%)", "background":"-o-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%)", "background":"-ms-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%)"});
$(".Pageheader").removeClass("Pageheader").addClass("breadcrumb");

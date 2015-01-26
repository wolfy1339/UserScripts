// ==UserScript==
// @name        TPT Fixer Upper
// @namespace   https://github.com/wolfy1339/UserScripts
// @description This Script fixes some bugs/errors on The Powder Toy's website (http://powdertoy.co.uk)
// @author      wolfy1339
// @copyright   2014-2015, wolfy1339
// @license     MIT License
// @downloadURL https://openuserjs.org/install/wolfy1339/TPT_Fixer_Upper.user.js
// @version     1.48
// @grant       none
// @match     *://powdertoy.co.uk/*
// ==/UserScript==

//Fixes for the rebuilt search feature
if (window.location.pathname.indexOf("/Search.html")!=-1){
    jQuery(".search-avatar").css({"margin-right":"10px"});
    jQuery(".search-thumbnail img").css({"border-radius":"3px", "border":"2px solid #DDD"});
    jQuery(".search-result .details").css({"margin-left":"70px", "margin-right":"20px"});
    jQuery(".posts .search-thumbnail").css({"width":"63px"});
    jQuery(".threads .search-thumbnail").css({"width":"63px"});
}
if (window.location.pathname.indexOf("/Discussions/Categories/Index.html")!=-1){
    //Fix, if number is big it won't overflow as much
    jQuery(".TopicList li .Meta span").css({"max-height":"14px", "font-size":"10px"});
}
if (window.location.pathname.indexOf("/Download.html")!=-1 || window.location.pathname.indexOf("/")!=-1){
    //Fix GitHub watch button
    jQuery(".social-github iframe").attr('src', "http://ghbtns.com/github-btn.html?user=simtr&repo=The-Powder-Toy&type=watch&count=true");
}
//Make Groups system better
if (window.location.pathname.indexOf("/Groups/Thread/")!=-1){
    jQuery("head").append("<style>.Meta .Author img{background: linear-gradient(to top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%); background: -webkit-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%); background: -o-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%);background: -ms-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%);}");
    jQuery(".Meta .Author img").css({"z-index":"-1", "border-radius":"3px", "box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)", "-moz-box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)", "-webkit-box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)", "-o-box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)", "-ms-box-shadow":"0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)"});
    jQuery('.Message span[style="color: white;"]').removeAttr("style");
    jQuery(".Pageheader").css({"margin":"0","border-top":"none", "border-right":"none", "border-left":"none"}).addClass("breadcrumb").removeClass("Pageheader");
    jQuery(".Mine.Owner").addClass("Administrator");
    jQuery(".Mine.Manager").addClass("Moderator");
    jQuery(".Meta .Author a:contains('jacob1')").closest(".Post").removeClass("Moderator").addClass("Developer");
    jQuery(".Developer .Comment .Meta .Author").css({"background-image":"url(/Themes/Next/Design/Images/Developer.png)"});
    jQuery(".Developer .Comment .Meta .UserTitle").text("Developer");
}
if (window.location.pathname.indexOf("/Groups/Page/View.html")!=-1 || window.location.pathname.indexOf("/Groups/Page/Register.html")!=-1 || window.location.pathname.indexOf("/Groups/Admin/")!=-1){
    jQuery(".Pageheader").css({"margin":"0","border-top":"none", "border-right":"none", "border-left":"none"}).addClass("breadcrumb").removeClass("Pageheader");
}
if (window.location.pathname.indexOf("/Groups/Admin/")!=-1){
    jQuery(".Pagination").remove();
    jQuery(".MemberRow .ButtonLink").css({"display":"inline-block"});
}
if (window.location.pathname.indexOf("/Groups/Page/Index.html")!=-1){
    jQuery(".Pageheader").css({"background":"#fff","border-bottom":"0px","font-weight":"normal","padding":"0"});
    jQuery(".Page").css({"border":"none"});
    jQuery(".contents").css({"padding":"10px","background":"white", "border":"1px solid #DDD"});
    jQuery(".GroupItem:last-child").css({"border-bottom":"none"});
}
if (window.location.pathname.indexOf("/Groups/Page/Groups.html")!=-1){
    jQuery(".GroupItem:last-child").css({"border-bottom":"none"});
    jQuery(".PageFooter").css({"margin":0,"padding":0}).addClass("breadcrumb").removeClass("PageFooter");
}

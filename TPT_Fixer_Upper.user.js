// ==UserScript==
// @name        TPT Fixer Upper
// @namespace   https://github.com/wolfy1339/UserScripts
// @description This Script fixes some bugs/errors on The Powder Toy's website (http://powdertoy.co.uk)
// @icon        http://brilliant-minds.tk/img/powder.png
// @author      wolfy1339
// @copyright   2014-2015, wolfy1339
// @license     MIT License
// @downloadURL https://openuserjs.org/install/wolfy1339/TPT_Fixer_Upper.user.js
// @version     1.50
// @grant       none
// @match       *://powdertoy.co.uk/*
// ==/UserScript==

//Fixes for the rebuilt search feature
if (window.location.pathname == "/Search.html"){
    jQuery(".search-avatar").css({"margin-right":"10px"});
    jQuery(".search-thumbnail img").css({"border-radius":"3px", "border":"2px solid #DDD"});
    jQuery(".search-result .details").css({"margin-left":"70px", "margin-right":"20px"});
    jQuery(".posts .search-thumbnail").css({"width":"63px"});
    jQuery(".threads .search-thumbnail").css({"width":"63px"});
}
if (window.location.pathname == "/Discussions/Categories/Index.html"){
    //Fix, if number is big it won't overflow as much
    jQuery(".TopicList li .Meta span").css({"max-height":"14px", "font-size":"10px"});
}
if (window.location.pathname == "/Download.html" || window.location.pathname == "/"){
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

    //Set timeout to wait for all page content (embedded saves) to load
    setTimeout(function(){
        jQuery(".fSaveRating").each(function(){
            $(this).remove();
        });
        jQuery(".fSaveGameThumb").contents().unwrap();
        jQuery(".fAuthor").addClass("author").removeClass("fAuthor");
        jQuery(".fComments").addClass("comments").removeClass("fComments");
        jQuery(".fSaveDetails").addClass("caption").removeClass("fSaveDetails");

        jQuery(".fSaveGame").each(function(){
            var overlay = jQuery("<div class=\"overlay\"></div>");
            var title = jQuery(this).find(".fTitle").attr("title").replace(/[,.\s]+/g, "_");
            var href = jQuery(this).find(".fTitle a").attr("href");
            var pthref = href.substring(21, 28);

            overlay.append("<a class=\"btn btn-primary\" href=\""+ href +"\">View</a>");
            overlay.append("<a class=\"btn btn-inverse\" href=\"ptsave:"+ pthref +"#"+ title +"\">Open</a>");
            overlay.css({"opacity":0});
            overlay.appendTo(this);
        });

        jQuery(".fTitle").each(function(){
            title = $(this).attr("title");
            var text = $(this).find("a").text();
            href = $(this).find("a").attr("href");
            $(this).replaceWith("<h5 title=\""+ title +"\"><a href=\""+ href +"\">"+ text +"</a></h5>");
        });
        jQuery(".fTitle").addClass("title").removeClass("fTitle");
        jQuery(".SaveDownloadDo").each(function(){
            jQuery(this).remove();
        });
        jQuery(".fSaveGame").addClass("savegame").removeClass("fSaveGame");
        jQuery(".savegame").on("mouseover", function () {
            jQuery(this).find(".overlay").animate({ opacity: 1, top: "3px" }, 150);
        });
        jQuery(".savegame").on("mouseleave", function () {
            jQuery(this).find(".overlay").animate({ opacity: 0, top: "-23px" }, 150);
        });
    }, 10000);
}
if (window.location.pathname == "/Groups/Page/View.html" || window.location.pathname == "/Groups/Page/Register.html" || window.location.pathname.indexOf("/Groups/Admin/")!=-1){
    jQuery(".Pageheader").css({"margin":"0","border-top":"none", "border-right":"none", "border-left":"none"}).addClass("breadcrumb").removeClass("Pageheader");
}
if (window.location.pathname.indexOf("/Groups/Admin/")!=-1){
    jQuery(".Pagination").remove();
    jQuery(".MemberRow .ButtonLink").css({"display":"inline-block"});
    jQuery(".contents").css({"width":"900px"});
    jQuery(".MemberColumn").css({"width":"417.5px"});
    jQuery(".MemberName").css({"width":"120px"});
}
if (window.location.pathname == "/Groups/Admin/MemberElevation.html"){
    jQuery("input[type=\"submit\"]").addClass("btn");
}
if (window.location.pathname == "/Groups/Page/Index.html"){
    jQuery(".Pageheader").css({"background":"#fff","border-bottom":"0px","font-weight":"normal","padding":"0"});
    jQuery(".Page").css({"border":"none"});
    jQuery(".contents").css({"padding":"10px","background":"white", "border":"1px solid #DDD"});
    jQuery(".GroupItem:last-child").css({"border-bottom":"none"});
}
if (window.location.pathname == "/Groups/Page/Groups.html"){
    jQuery(".GroupItem:last-child").css({"border-bottom":"none"});
    jQuery(".PageFooter").css({"border-left":"none","border-right":"none","border-bottom":"none","margin":0,"padding":0}).addClass("breadcrumb").removeClass("PageFooter");
}

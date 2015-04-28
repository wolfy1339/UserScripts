// ==UserScript==
// @name        TPT Fixer Upper
// @namespace   https://github.com/wolfy1339/UserScripts
// @description This Script fixes some bugs/errors on The Powder Toy's website (http://powdertoy.co.uk)
// @icon        http://brilliant-minds.tk/img/powder.png
// @author      wolfy1339
// @oujs:author wolfy1339
// @copyright   2014-2015, wolfy1339
// @license     MIT License
// @downloadURL https://openuserjs.org/install/wolfy1339/TPT_Fixer_Upper.user.js
// @version     1.52
// @grant       none
// @match       *://powdertoy.co.uk/*
// ==/UserScript==
if (typeof tptenhance == "undefined") {
    var script = "<script src=\"https://openuserjs.org/install/jacksonmj/Powder_Toy_enhancements.user.js\"></script>";
    jQuery("head").append(script);
} else {
    var currentURL = window.location.pathname;

    function addCss(cssString) {
        var style = jQuery("<style type=\"text/css\"></style>");
        style.append(cssString);
        style.appendTo("head");
    }

    function replacePageHeader() {
        jQuery(".Pageheader").addClass("breadcrumb").removeClass("Pageheader");
        var container = jQuery("<div class=\"container\"></div>");
        var currentGroupID;
        if (currentURL == "/Groups/Thread/View.html") {
            currentGroupID = jQuery(".breadcrumb").children(":first-child").next().attr("href").substring(29);
        } else {
            currentGroupID = jQuery(".breadcrumb").find("a").attr("href").substring(29);
        }
        var currentThreadName, currentGroupName, breadcrumb;
        if (currentURL == "/Groups/Thread/View.html") {
            currentThreadName = jQuery(".TopicTitle").text();
        } else if (currentURL == "/Groups/Thread/EditPost.html") {
            currentThreadName = "Edit Post";
        } else if (currentURL == "/Groups/Admin/Members.html") {
            currentThreadName = "Members";
        } else if (currentURL == "/Groups/Admin/Edit.html") {
            currentThreadName = "Edit";
            currentGroupName = jQuery(".breadcrumb").find("a").text();
        } else if (currentURL == "/Groups/Admin/MemberElevation.html") {
            currentThreadName = "Edit";
            var currentUserName = jQuery(".OtherF a").text();
        }

        if (currentURL == "/Groups/Admin/MemberElevation.html") {
            currentGroupName = jQuery(".breadcrumb").find("a").text();
            breadcrumb = (["<ul class=\"breadcrumb\">",
                "<li><a href=\"/Groups/Page/Groups.html\">Groups</a><span class=\"divider\">/</span></li>",
                "<li><a href=\"/Groups/Page/View.html?Group=" + currentGroupID + "\">" + currentGroupName + "</a><span class=\"divider\">/</span></li>",
                "<li class=\"active\"><a>" + currentUserName + "</a><span class=\"divider\">/</span></li>",
                "<li class=\"active\"><a>" + currentThreadName + "</a></li>",
                "</ul>"
            ].join(""));
        } else {
            if (currentURL.indexOf("/Groups/Thread/") != -1) {
                currentGroupName = jQuery(".breadcrumb").children(":first-child").next().text();
            }
            breadcrumb = (["<ul class=\"breadcrumb\">",
                "<li><a href=\"/Groups/Page/Groups.html\">Groups</a><span class=\"divider\">/</span></li>",
                "<li><a href=\"/Groups/Page/View.html?Group=" + currentGroupID + "\">" + currentGroupName + "</a><span class=\"divider\">/</span></li>",
                "<li class=\"active\"><a>" + currentThreadName + "</a></li>",
                "</ul>"
            ].join(""));
        }

        jQuery(".breadcrumb").remove();
        container.append(breadcrumb);
        container.insertBefore(".contents");
    }

    //Fixes for the rebuilt search feature
    if (currentURL == "/Search.html") {
        jQuery(".search-avatar").css({
            "margin-right": "10px"
        });
        addCss([".search-thumbnail img {",
            "    border-radius:3px;",
            "    border:2px solid #DDD;",
            "}",
            ".search-result .details {",
            "    margin-left: 70px;",
            "    margin-right:20px;",
            "}"
        ].join("\n"));
        jQuery(".posts .search-thumbnail").css({
            "width": "63px"
        });
        jQuery(".threads .search-thumbnail").css({
            "width": "63px"
        });
    }
    if (currentURL == "/Discussions/Categories/Index.html") {
        //Fix, if number is big it won't overflow as much
        addCss([".TopicList li .Meta span {",
            "    max-height: 14px;",
            "    font-size: 10px;",
            "}"
        ].join("\n"));
    }
    if (currentURL == "/Download.html" || currentURL == "/") {
        //Fix GitHub watch button
        jQuery(".social-github iframe").attr("src", "http://ghbtns.com/github-btn.html?user=simtr&repo=The-Powder-Toy&type=watch&count=true");
        jQuery(".platforms").each(function () {
            if ($(this).find(".Platform").text() == "Ubuntu/Debian .Deb (External: GetDeb)") {
                $(this).find(".Version").text("90.2");
            }
        });
    }
    //Make Groups system better
    if (currentURL.indexOf("/Groups/Thread/") != -1) {
        addCss([".Meta .Author img {",
            "    background: linear-gradient(to top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%);",
            "    background: -webkit-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%);",
            "    background: -o-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%);",
            "    background: -ms-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%);",
            "    z-index: -1;",
            "    border-radius: 3px;",
            "    box-shadow: 0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4);",
            "    -moz-box-shadow: 0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4);",
            "    -webkit-box-shadow: 0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4);",
            "    -o-box-shadow: 0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4);",
            "    -ms-box-shadow: 0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4);",
            "}",
            ".Developer .Comment .Meta .Author {",
            "    background-image: url(/Themes/Next/Design/Images/Developer.png);",
            "}"
        ].join("\n"));

        jQuery(".Message span[style=\"color: white;\"]").removeAttr("style");
        jQuery(".Mine.Owner").addClass("Administrator");
        jQuery(".Mine.Manager").addClass("Moderator");
        jQuery(".Moderator").each(function () {
            var findDev = jQuery(this).find(".Meta .Author a").text();
            if (findDev == "jacob1" || findDev == "cracker64" || findDev == "jacksonmj") {
                jQuery(this).removeClass("Moderator").addClass("Developer");
                jQuery(this).find(".UserTitle").text("Developer");
            }
        });

        setTimeout(function () {
            replacePageHeader();
        }, 1000);

        //Set timeout to wait for all page content (embedded saves) to load
        setTimeout(function () {
            jQuery(".fSaveRating").remove();
            jQuery(".fSaveGameThumb").contents().unwrap();
            jQuery(".fAuthor").addClass("author").removeClass("fAuthor");
            jQuery(".fComments").addClass("comments").removeClass("fComments");
            jQuery(".fSaveDetails").addClass("caption").removeClass("fSaveDetails");

            var title, href;
            jQuery(".fSaveGame").each(function () {
                var overlay = jQuery("<div class=\"overlay\"></div>");
                title = jQuery(this).find(".fTitle").attr("title").replace(/[,.\s]+/g, "_");
                href = jQuery(this).find(".fTitle a").attr("href");
                var pthref = href.substring(21, 28);

                overlay.append("<a class=\"btn btn-primary\" href=\"" + href + "\">View</a>");
                overlay.append("<a class=\"btn btn-inverse\" href=\"ptsave:" + pthref + "#" + title + "\">Open</a>");
                overlay.css({
                    "opacity": 0
                });
                overlay.appendTo(this);
            });

            jQuery(".fTitle").each(function () {
                title = $(this).attr("title");
                var text = $(this).find("a").text();
                href = $(this).find("a").attr("href");
                $(this).replaceWith("<h5 title=\"" + title + "\"><a href=\"" + href + "\">" + text + "</a></h5>");
            });
            jQuery(".SaveDownloadDo").remove();
            jQuery(".fSaveGame").addClass("savegame").removeClass("fSaveGame");
            jQuery(".savegame").on("mouseover", function () {
                jQuery(this).find(".overlay").animate({
                    opacity: 1,
                    top: "3px"
                }, 150);
            });
            jQuery(".savegame").on("mouseleave", function () {
                jQuery(this).find(".overlay").animate({
                    opacity: 0,
                    top: "-23px"
                }, 150);
            });
        }, 10000);
    }
    if (currentURL == "/Groups/Page/View.html" || currentURL == "/Groups/Page/Register.html") {
        addCss([".breadcrumb {",
            "    margin: 0;",
            "    border-top: none;",
            "    border-right: none;",
            "    border-left: none;",
            "}"
        ].join("\n"));
        jQuery(".Pageheader").addClass("breadcrumb").removeClass("Pageheader");
    }
    if (currentURL.indexOf("/Groups/Admin/") != -1) {
        replacePageHeader();
    }
    if (currentURL == "/Groups/Admin/Members.html") {
        jQuery(".Pagination").remove();
        jQuery(".MemberRow .ButtonLink").css({
            "display": "inline-block"
        });
        jQuery(".contents").css({
            "width": "900px"
        });
        jQuery(".MemberColumn").css({
            "width": "417.5px"
        });
        jQuery(".MemberName").css({
            "width": "120px"
        });
    }
    if (currentURL == "/Groups/Admin/MemberElevation.html") {
        jQuery("input[type=\"submit\"]").addClass("btn");
    }
    if (currentURL == "/Groups/Page/Index.html") {
        jQuery(".Pageheader").css({
            "background": "#fff",
            "border-bottom": "0px",
            "font-weight": "normal",
            "padding": "0"
        });
        jQuery(".Page").css({
            "border": "none"
        });
        jQuery(".contents").css({
            "padding": "10px",
            "background": "white",
            "border": "1px solid #DDD"
        });
        jQuery(".GroupItem:last-child").css({
            "border-bottom": "none"
        });
    }
    if (currentURL == "/Groups/Page/Groups.html") {
        jQuery(".GroupItem:last-child").css({
            "border-bottom": "none"
        });
        addCss([".breadcrumb {",
            "    border-left: none;",
            "    border-right: none;",
            "    border-bottom: none;",
            "    margin: 0;",
            "    padding: 0;",
            "}"
        ].join("\n"));
        jQuery(".PageFooter").addClass("breadcrumb").removeClass("PageFooter");
    }
}

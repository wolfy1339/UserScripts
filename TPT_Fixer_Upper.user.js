// ==UserScript==
// @name        TPT Fixer Upper
// @namespace   https://github.com/wolfy1339/UserScripts
// @description This script fixes some bugs/errors on The Powder Toy's website (http://powdertoy.co.uk)
// @icon        http://brilliant-minds.tk/img/powder.png
// @author      wolfy1339
// @oujs:author wolfy1339
// @copyright   2014-2015, wolfy1339
// @license     MIT License
// @downloadURL https://openuserjs.org/install/wolfy1339/TPT_Fixer_Upper.user.js
// @version     2.10
// @grant       none
// @match       *://powdertoy.co.uk/*
// ==/UserScript==
/* global tptenhance, tinymce */
var TPTFixerUpper = function() {
    var currentURL = window.location.pathname;

    function addCss(cssString) {
        // Helper function to add CSS
        var style = jQuery("<style type=\"text/css\"></style>");
        style.append(cssString);
        style.appendTo("head");
    }

    function replacePageHeader() {
        // Helper function to replace the old page headers with breadcrumbs as used everywhere else.
        var container = jQuery("<div class=\"container\"></div>");
        var currentThreadName, currentGroupID, currentGroupName, currentUserName, breadcrumb;

        if (currentURL.indexOf("/Admin/") !== -1 || currentURL == "/Groups/Page/Resign.html" || currentURL == "/Groups/Page/Register.html") {
            currentGroupName = jQuery(".Pageheader").find("a").text();
            currentGroupID = jQuery(".Pageheader").find("a").attr("href").substring(29);
            if (currentURL.indexOf("/Admin/") !== -1) {
                currentUserName = jQuery(".OtherF a").text();
            }
        } else {
            currentGroupID = tptenhance.groups.currentGroupId();
            currentGroupName = jQuery(".Pageheader a:eq(1)").text();
        }

        // Set the page name or thread name depending on the current URL
        if (currentURL == "/Groups/Thread/View.html") {
            currentThreadName = jQuery(".TopicTitle").text();
        } else if (currentURL == "/Groups/Thread/EditPost.html") {
            currentThreadName = "Edit Post";
        } else if (currentURL == "/Groups/Thread/Create.html") {
            currentThreadName = "New Thread";
        } else if (currentURL == "/Groups/Thread/Moderation.html") {
            currentThreadName = "Delete";
        } else if (currentURL == "/Groups/Admin/Members.html") {
            currentThreadName = "Members";
            container.css({"width": "900px"});
        } else if (currentURL == "/Groups/Admin/Edit.html" || currentURL == "/Groups/Admin/MemberElevation.html") {
            currentThreadName = "Edit";
        } else if (currentURL == "/Groups/Admin/MemberRemove.html") {
            currentThreadName = "Remove";
        } else if (currentURL == "/Groups/Page/Resign.html")  {
            currentThreadName = "Resign";
        } else if (currentURL == "/Groups/Page/Register.html") {
            currentThreadName = "Register";
        }

        // Use different formats depending on the curent URL
        if (currentURL == "/Groups/Admin/MemberElevation.html" || currentURL == "/Groups/Admin/MemberRemove.html") {
            breadcrumb = jQuery(["<ul class=\"breadcrumb\">",
                "<li><a href=\"/Groups/Page/Groups.html\">Groups</a><span class=\"divider\">/</span></li>",
                "<li><a href=\"/Groups/Page/View.html?Group=" + currentGroupID + "\">" + currentGroupName + "</a><span class=\"divider\">/</span></li>",
                "<li class=\"active\"><a>" + currentUserName + "</a><span class=\"divider\">/</span></li>",
                "<li class=\"active\"><a>" + currentThreadName + "</a></li>",
                "</ul>"].join(""));
        } else {
            breadcrumb = jQuery(["<ul class=\"breadcrumb\">",
                "<li><a href=\"/Groups/Page/Groups.html\">Groups</a><span class=\"divider\">/</span></li>",
                "<li><a href=\"/Groups/Page/View.html?Group=" + currentGroupID + "\">" + currentGroupName + "</a><span class=\"divider\">/</span></li>",
                "<li class=\"active\"><a>" + currentThreadName + "</a></li>",
                "</ul>"].join(""));
        }

        container.append(breadcrumb);
        jQuery(".Pageheader").remove();
        container.insertBefore(".contents");
        if (currentURL == "/Groups/Page/Register.html") {
            jQuery(".contents").css({padding:"10px"});
        }
    }

    if (currentURL == "/Search.html") {
        // Enhancements for the rebuilt search feature
        jQuery(".search-avatar").css({"margin-right": "10px"});
        addCss([".search-thumbnail img {",
            "    border-radius:3px;",
            "    border:2px solid #DDD;",
            "}",
            ".search-result .details {",
            "    margin-left: 70px;",
            "    margin-right:20px;",
            "}"].join("\n"));
        jQuery(".posts .search-thumbnail").css({"width": "63px"});
        jQuery(".threads .search-thumbnail").css({"width": "63px"});
    }
    if (currentURL == "/Discussions/Categories/Index.html") {
        // Fix thread view and post count, if the number is big it won't overflow as much
        addCss([".TopicList li .Meta span {",
            "    max-height: 14px;",
            "    font-size: 10px;",
            "}"].join("\n"));
    }
    if (currentURL == "/Download.html" || currentURL == "/") {
        // Fix GitHub watch button
        jQuery(".social-github iframe").attr("src", "http://ghbtns.com/github-btn.html?user=simtr&repo=The-Powder-Toy&type=watch&count=true&v=2");
        // Change the 'GetDeb' vesion to the latest version
        jQuery(".modal .modal-body ul.platforms li").eq(-2).each(function() {
            jQuery(this).find(".Version").text("90.2");
        });
    }
    if (currentURL == "/Profile/Password.html") {
        // Stylize submit input
        jQuery(".Subpage input:eq(3)").addClass("btn").addClass("btn-primary");
    }
    if (currentURL == "/Profile/Avatar.html") {
        addCss([".btn-file {",
            "    position: relative;",
            "    overflow: hidden;",
            "    margin-right: -4px!important;",
            "}",
            ".btn-file input[type=file] {",
            "     position: absolute;",
            "     top: 0;",
            "     right: 0;",
            "     min-width: 100%;",
            "     min-height: 100%;",
            "     font-size: 100px;",
            "     text-align: right;",
            "     filter: alpha(opacity=0);",
            "     opacity: 0;",
            "     outline: none;",
            "     background: white;",
            "     cursor: inherit;",
            "     display: block;",
            "}",
            "input[type=text]:focus {",
            "    box-shadow: inset 0 1px 1px rgba(0,0,0,0.075);",
            "    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,0.075);",
            "    border-color: #ddd;",
            "}"].join("\n"));

        // Stylize file input
        jQuery(".OtherF").removeClass("OtherF");
        jQuery("form div input").css({"width":"255px"});
        jQuery("form div input").replaceWith(["<div class=\"input-prepend\">",
            "  <span class=\"btn btn-file\">Browse...<input type=\"file\" name=\"Avatar\"></span>",
            "  <input class=\"span8\" id=\"path\" type=\"text\" readonly=\"\">",
            "</div>"].join("\n"));

        jQuery(document).on("change", ".btn-file :file", function() {
            var input = jQuery(this);
            var label = input.val().replace(/\\/g, "/").replace(/.*\//, "");
            input.trigger("fileselect", label);
        });

        jQuery(".btn-file :file").on("fileselect", function(event, label) {
            var input = jQuery(this).parents(".input-prepend").find(":text");
            var log = label;

            if (input.length) {
                input.val(log);
            }
        });
    }
    // Make Groups system better
    if (currentURL.indexOf("/Groups") !== -1) {
        // Overide the currentGroupId function to work with the breadcrumbs and the old page header
        tptenhance.groups.currentGroupId = function() {
            if (jQuery(".breadcrumb").length > 0) {
                return +(jQuery(".breadcrumb a:eq(1)").attr("href").substring(29));
            } else {
                return +(jQuery(".Pageheader a:eq(1)").attr("href").substring(29));
            }
        };
    }
    if (currentURL == "/Groups/Thread/View.html") {
        addCss([".MessageList .Post .Meta .Author .Gravatar {",
            "    border: 0 none;",
            "    float: left;",
            "    height: 40px;",
            "    margin: 0 10px 0 0;",
            "    overflow: hidden;",
            "    width: 40px;",
            "    background: linear-gradient(to top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%);",
            "    background: -webkit-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%);",
            "    background: -o-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%);",
            "    background: -ms-linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%);",
            "    border-radius: 3px;",
            "    box-shadow: 0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4);",
            "    -moz-box-shadow: 0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4);",
            "    -webkit-box-shadow: 0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4);",
            "    -o-box-shadow: 0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4);",
            "    -ms-box-shadow: 0 0 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4);",
            "}",
            ".MessageList .Post .Meta .Author .Gravatar img {",
            "    border-radius: 3px;",
            "    position: relative;",
            "    height: 40px;",
            "    width: 40px;",
            "}",
            ".UserInformation {",
            "    border: 1px solid #CCC;",
            "    box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.2);",
            "    background: white;",
            "    width: 300px;",
            "    padding: 7px;",
            "    border-radius: 3px;",
            "    position: absolute;",
            "    z-index: 99;",
            "}",
            ".UserInformation .UserInfoRow label {",
            "    display: inline;",
            "    margin-right: 4px;",
            "}",
            ".UserInformation span.Author {",
            "    font-size: 17px;",
            "    padding-left: 0;",
            "    font-weight: bold;",
            "    line-height: 3.5;",
            "    padding-left: 10px;",
            "}",
            ".UserInformation span.Author .Gravatar {",
            "    border: 0 none;",
            "    float: left;",
            "    height: 64px;",
            "    margin: 0 10px 0 0;",
            "    overflow: hidden;",
            "    width: 64px;",
            "    box-shadow: 0 0 5px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4);",
            "    border-radius: 3px;",
            "    background: -webkit-linear-gradient(top, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%);",
            "    background: linear-gradient(top, rgba(255,255,255,0.1) 0%,rgba(0,0,0,0.1) 100%);",
            "}",
            ".UserInformation span.Author .Gravatar img {",
            "    border-radius: 3px;",
            "    position: relative;",
            "    z-index: -1;",
            "    height: 64px;",
            "    width: 64px;",
            "}",
            ".Developer .Comment .Meta .Author {",
            "    background-image: url(/Themes/Next/Design/Images/Developer.png);",
            "}",
            ".savegame {",
            "    vertical-align: top;",
            "    display: inline-block;",
            "}",
            "p code {",
            "    display: inline;",
            "}"].join("\n"));

        // Add the Op class to all of a users posts if they are the author of the topic
        var pagination = jQuery(".pagination .active").text();
        var post = jQuery(".MessageList").children(":first-child");
        if (pagination == "11" && !post.hasClass("Mine")) {
            var posteeData = jQuery(".MessageList").children(":first-child").find(".Author a").text();
            localStorage.setItem("postee", posteeData);
        } else if (pagination == "11" && post.hasClass("Mine")) {
            localStorage.clear("postee");
        }
        jQuery(".Post").each(function() {
            var Postee = $(this).find(".Author a").text();
            var postee = localStorage.getItem("postee");
            if (Postee == postee) {
                $(this).addClass("Op");
            }
        });

        // Fixes to add the overlay when you click on the profile picture, just like in the forums
        jQuery(".Author").each(function() {
            var href = jQuery(this).children(":first-child").attr("href");
            var src = jQuery(this).find("img").attr("src");
            jQuery(this).children(":first-child").replaceWith("<div class=\"Gravatar\"><a hre=\"" + href + "\"><img src=\"" + src + "\"></a></div>");
        });
        jQuery(".Author .Gravatar").on("click", function() {
            var InformationForm = jQuery("<div class=\"UserInformation\">Loading…</div>");
            jQuery("body").append(InformationForm);
            var Pos = jQuery(this).offset();
            var Link = jQuery(this).parent().children("a").attr("href").replace(/\.html/, ".json");
            InformationForm.css("top", Pos.top-3);
            InformationForm.css("left", Pos.left-3);
            jQuery.getJSON(Link).done(function(data) {
                var Form = jQuery(["<span class=\"Author\">",
                    "<div class=\"Gravatar\"><img src=\"" + data.User.Avatar + "\"></div>",
                    "<a href=\"/User.html?Name=" + data.User.Username + "\">" + data.User.Username + "</a>",
                    "</span>",
                    "<div class=\"Clear\"></div>",
                    "<div class=\"UserInfoForum\">",
                    "<h1>Forum</h1>",
                    "<div class=\"UserInfoRow\"><label>Reputation:</label>" + data.User.Forum.Reputation + "</div>",
                    "<div class=\"UserInfoRow\"><label>Posts:</label>" + data.User.Forum.Replies + "</div>",
                    "<div class=\"UserInfoRow\"><label>Topics:</label>" + data.User.Forum.Topics + "</div></div>"].join(""));
                InformationForm.html(Form);
            });
            InformationForm.mouseleave(function() {
                InformationForm.remove();
            });
            return false;
        });

        // Prevent ghost talk
        jQuery(".Message span[style=\"color: white;\"]").removeAttr("style");

        jQuery(".Mine.Owner").addClass("Administrator");
        jQuery(".Mine.Manager").addClass("Moderator");
        jQuery(".Moderator").each(function() {
            var findDev = jQuery(this).find(".Meta .Author a").text();
            if (findDev == "jacob1" || findDev == "cracker64" || findDev == "jacksonmj") {
                jQuery(this).removeClass("Moderator").addClass("Developer");
                jQuery(this).find(".UserTitle").text("Developer");
            }
        });

        setTimeout(function() {
            replacePageHeader();
        }, 2500);

        // Replace the embedded savegames with a version that uses the same format as the forums
        // Set timeout to wait for all page content (embedded saves) to load
        setTimeout(function() {
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
                overlay.css({"opacity": 0});
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
            jQuery(".savegame a img").attr("width", "153").attr("height", "96");
            jQuery(".savegame").on("mouseover", function () {
                jQuery(this).find(".overlay").animate({opacity: 1, top: "3px"}, 150);
            });
            jQuery(".savegame").on("mouseleave", function () {
                jQuery(this).find(".overlay").animate({opacity: 0, top: "-23px"}, 150);
            });
        }, 10000);
    }
    if (currentURL == "/Groups/Thread/EditPost.html") {
        // Add last edited count to the post itself
        var user = jQuery("li.dropdown").children(":first-child").text().trim();
        var dt = new Date();
        var time = dt.getUTCHours() + ":" + dt.getUTCMinutes() + " " + dt.getUTCDate() + "/" + (dt.getUTCMonth() + 1) + "/" + dt.getUTCFullYear();
        var lastEdited;
        setTimeout(function() {
            var content = tinymce.activeEditor.getContent({format:"text"});
            var text;
            if (content.indexOf("<p><small>Edited") === -1) {
                lastEdited = "<p><small>Edited once by " + user + ". Last: " + time + "</small></p>";
                text = content + lastEdited;
            } else {
                var edits;
                if (content.indexOf("<p><small>Edited once") !== -1) {
                    edits = 2;
                } else {
                    edits = parseInt(content.split("<p><small>Edited")[1].split(" ")[1], 10) + 1;
                }
                if (content.split("<p><small>Edited")[1].split("by")[1].split("Last:")[0].indexOf(user) === -1) {
                    user = content.split("<p><small>Edited")[1].split("by")[1].split("Last:")[0].trim() + ", " + user;
                }
                lastEdited = "<p><small>Edited " + edits + " times by " + user + ". Last: " + time + "</small></p>";
                text = content.split("<p><small>")[0] + lastEdited;
            }

            tinymce.activeEditor.setContent(text);
        }, 1000);
        replacePageHeader();
    }
    if (currentURL.indexOf("/Groups/Threads") !== -1) {
        var error = "<div class=\"Error\" id=\"AddReplyError\">Your message was too short.</div>";
        jQuery(error).appendTo(".PostFForm");
    }
    if (currentURL == "/Groups/Thread/Create.html" || currentURL == "/Groups/Thread/Moderation.html") {
        replacePageHeader();
    }
    if (currentURL == "/Groups/Page/View.html" || currentURL == "/Groups/Page/Register.html") {
        addCss([".breadcrumb {",
            "    margin: 0;",
            "    border-top: none;",
            "    border-right: none;",
            "    border-left: none;",
            "}"].join("\n"));
        jQuery(".Pageheader").addClass("breadcrumb").removeClass("Pageheader");
    }
    if (currentURL.indexOf("/Groups/Admin/") !== -1) {
        replacePageHeader();
    }
    if (currentURL == "/Groups/Admin/Members.html") {
        // Make the Admin management page work better by changing it's looks a little bit
        jQuery(".Pagination").remove();
        jQuery(".MemberRow .ButtonLink").css({"display": "inline-block"});
        jQuery(".contents").css({"width": "900px"});
        jQuery(".MemberColumn").css({"width": "417.5px"});
        jQuery(".MemberName").css({"width": "120px"});
    }
    if (currentURL == "/Groups/Admin/MemberElevation.html" || currentURL == "/Groups/Page/Resign.html") {
        // Stylize submit input
        jQuery("input[type=\"submit\"]").addClass("btn");
    }
    if (currentURL == "/Groups/Page/Index.html") {
        // Make the page look like the rest of the website
        jQuery(".Pageheader").css({"background": "#fff","border-bottom": "0px","font-weight": "normal","padding": "0"});
        jQuery(".Page").css({"border": "none"});
        jQuery(".contents").css({"padding": "10px","background": "white","border": "1px solid #DDD"});
        jQuery(".GroupItem:last-child").css({"border-bottom": "none"});
    }
    if (currentURL == "/Groups/Page/Groups.html") {
        // Remove bottom border on the last child of .GroupItem
        jQuery(".GroupItem:last-child").css({"border-bottom": "none"});
        addCss([".breadcrumb {",
            "    border-left: none;",
            "    border-right: none;",
            "    border-bottom: none;",
            "    margin: 0;",
            "    padding: 0;",
            "}"].join("\n"));
        jQuery(".PageFooter").addClass("breadcrumb").removeClass("PageFooter");
    }
    if (currentURL == "/Groups/Page/Register.html") {
        // Reduce the group registration page to the basics that are needed
        jQuery("h1:eq(2)").remove();
        jQuery("textarea").hide();
        jQuery(".OtherF label").remove();
        jQuery("input[name=\"Submit\"]").attr("value", "Submit Registration");
        replacePageHeader();
    }
};

// Check if the Powder Toy enhancements script is loaded
// My script functions only work if they are ran after that specific script
setTimeout(function() {
    if (typeof tptenhance == "undefined") {
        var script = jQuery("<script src=\"https://cdn.rawgit.com/jacksonmj/Userscript-TPT-Enhancements/master/Powder_Toy_enhancements.user.js\"></script>");
        jQuery("head").append(script);
        setTimeout(function() {
            TPTFixerUpper();
        }, 10000);
    } else {
        TPTFixerUpper();
    }
}, 1000);

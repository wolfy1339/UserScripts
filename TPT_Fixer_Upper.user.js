// ==UserScript==
// @name        TPT Fixer Upper
// @namespace   https://github.com/wolfy1339/UserScripts
// @description This script fixes some bugs/errors on The Powder Toy's website (http://powdertoy.co.uk)
// @icon        http://brilliant-minds.tk/img/powder.png
// @author      wolfy1339
// @oujs:author wolfy1339
// @copyright   2014-2016, wolfy1339
// @license     MIT License
// @downloadURL https://openuserjs.org/install/wolfy1339/TPT_Fixer_Upper.user.js
// @version     2.15
// @grant       none
// @match       *://powdertoy.co.uk/*
// @run-at      document-idle
// ==/UserScript==
/* global tptenhance, tinymce */
var currentURL = window.location.pathname;

function addCss(cssString) {
    // Helper function to add CSS
    if (!jQuery("style").length) {
        jQuery("<style type=\"text/css\"></style>").append(cssString).appendTo("head");
    } else {
        jQuery("style:eq(0)").append(cssString);
    }
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
        if (jQuery(".Pageheader a:eq(1)").text() != "Groups") {
            currentGroupName = jQuery(".Pageheader a:eq(1)").text();
            currentGroupID = tptenhance.groups.currentGroupId();
        } else {
            currentGroupName = jQuery(".Pageheader a:eq(2)").text();
            currentGroupID = jQuery(".Pageheader a:eq(2)").attr("href").split("Group=")[1].split("&")[0];
        }
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
    } else if (currentURL == "/Groups/Page/Resign.html") {
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
            "</ul>"
        ].join(""));
    } else {
        breadcrumb = jQuery(["<ul class=\"breadcrumb\">",
            "<li><a href=\"/Groups/Page/Groups.html\">Groups</a><span class=\"divider\">/</span></li>",
            "<li><a href=\"/Groups/Page/View.html?Group=" + currentGroupID + "\">" + currentGroupName + "</a><span class=\"divider\">/</span></li>",
            "<li class=\"active\"><a>" + currentThreadName + "</a></li>",
            "</ul>"
        ].join(""));
    }

    container.append(breadcrumb);
    jQuery(".Pageheader").remove();
    container.insertBefore(".contents");
    if (currentURL == "/Groups/Page/Register.html") {
        jQuery(".breadcrumb").css({"margin-bottom": "7px"});
    }
}

var TPTFixerUpper = function() {
    if (currentURL == "/Search.html") {
        // Enhancements for the rebuilt search feature
        jQuery(".search-avatar").css({"margin-right": "10px"});
        addCss([".search-thumbnail img {",
            "    border-radius: 3px;",
            "    border: 2px solid #DDD;",
            "}",
            ".search-result .details {",
            "    margin-left: 70px;",
            "    margin-right:20px;",
            "}",
            ".input-prepend.input-append input:first-child {",
            "    border-radius: 3px 0 0 3px;",
            "}"
        ].join("\n"));
        jQuery(".input-append").attr("class", "input-prepend input-append");
        jQuery(".posts .search-thumbnail").css({"width": "63px"});
        jQuery(".threads .search-thumbnail").css({"width": "63px"});
    }
    if (currentURL == "/Discussions/Categories/Index.html") {
        // Fix thread view and post count, if the number is big it won't overflow as much
        addCss([".TopicList li .Meta span {",
            "    max-height: 14px;",
            "    font-size: 10px;",
            "}"
        ].join("\n"));
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
            "}"
        ].join("\n"));

        // Stylize file input
        jQuery(".OtherF").removeClass("OtherF");
        jQuery("form div input").css({"width":"255px"});
        jQuery("form div input").replaceWith(["<div class=\"input-prepend\">",
            "  <span class=\"btn btn-file\">Browse...<input type=\"file\" name=\"Avatar\" accept=\"image/*\"></span>",
            "  <input class=\"span8\" id=\"path\" type=\"text\" readonly=\"\">",
            "</div>"
        ].join("\n"));

        jQuery(document).on("change", ".btn-file :file", function() {
            var input = jQuery(this);
            var label = input.val().replace(/\\/g, "/").replace(/.*\//, "");
            input.trigger("fileselect", label);
        });

        jQuery(".btn-file :file").on("fileselect", function(event, label) {
            var input = jQuery(this).parents(".input-prepend").find(":text");

            if (input.length) {
                input.val(label);
            }
        });
    }
    // Make Groups system better
    if (currentURL.indexOf("/Groups") !== -1) {
        // Overide the currentGroupId function to work with the breadcrumbs and the old page header
        tptenhance.groups.currentGroupId = function() {
            if (jQuery(".breadcrumb").length > 0) {
                return +(jQuery(".breadcrumb a:eq(1)").attr("href").split("Group=")[1].split("&")[0]);
            } else {
                return +(jQuery(".Pageheader a:eq(1)").attr("href").split("Group=")[1].split("&")[0]);
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
            "}"
        ].join("\n"));

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

        // Fix the permalink on each post
        $(".Permalink a").each(function() {
            var href = $(this).attr("href").replace("Message=", "Message-");
            $(this).attr("href", href);
        });

        // Fixes to add the overlay when you click on the profile picture, just like in the forums
        jQuery(".Author").each(function() {
            var href = jQuery(this).children(":first-child").attr("href");
            var src = jQuery(this).find("img").attr("src");
            jQuery(this).children(":first-child").replaceWith("<div class=\"Gravatar\"><a href=\"" + href + "\"><img src=\"" + src + "\"></a></div>");
        });
        /* Taken from the website's javascript (http://powdertoy.co.uk/Applications/Application.Discussions/Javascript/Thread.js),
        Modified slightly to fit my coding styles */
        jQuery(".Author .Gravatar").on("click", function() {
            var informationForm = jQuery("<div class=\"UserInformation\">Loading…</div>");
            jQuery("body").append(informationForm);
            var pos = jQuery(this).offset();
            var link = jQuery(this).parent().children("a").attr("href").replace(/\.html/, ".json");
            informationForm.css("top", pos.top-3);
            informationForm.css("left", pos.left-3);
            jQuery.getJSON(link).done(function(data) {
                var form = jQuery(["<span class=\"Author\">",
                    "<div class=\"Gravatar\"><img src=\"" + data.User.Avatar + "\"></div>",
                    "<a href=\"/User.html?Name=" + data.User.Username + "\">" + data.User.Username + "</a>",
                    "</span>",
                    "<div class=\"Clear\"></div>",
                    "<div class=\"UserInfoForum\">",
                    "<h1>Forum</h1>",
                    "<div class=\"UserInfoRow\"><label>Reputation:</label>" + data.User.Forum.Reputation + "</div>",
                    "<div class=\"UserInfoRow\"><label>Posts:</label>" + data.User.Forum.Replies + "</div>",
                    "<div class=\"UserInfoRow\"><label>Topics:</label>" + data.User.Forum.Topics + "</div></div>"
                ].join(""));
                informationForm.html(form);
            });
            informationForm.mouseleave(function() {
                informationForm.remove();
            });
            return false;
        });

        // Prevent ghost talk
        jQuery(".Message span[style=\"color: white;\"]").removeAttr("style");

        jQuery(".Mine.Owner").addClass("Administrator");
        jQuery(".Mine.Manager").addClass("Moderator");
        jQuery(".Moderator").each(function() {
            var a = jQuery(this).find(".Meta .Author a").text();
            if (a == "jacob1" || a == "cracker64" || a == "jacksonmj" || a == "AntB" || a == "Xenocide" || a == "savask" || a == "triclops200") {
                jQuery(this).removeClass("Moderator").addClass("Developer");
                jQuery(this).find(".UserTitle").text("Developer");
            } else if (a == "Simon") {
                jQuery(this).removeClass("Moderator").addClass("Administrator");
                jQuery(this).find(".UserTitle").text("Administrator");
            }
        });

        replacePageHeader();

        // Replace the embedded savegames with a version that uses the same format as the forums
        // Wait for all page content (embedded saves) to load
        jQuery(".fSaveGame").each(function() {
            jQuery(this).find(".fSaveRating").remove();
            jQuery(this).find(".fSaveGameThumb").contents().unwrap();
            jQuery(this).find(".fAuthor").addClass("author").removeClass("fAuthor");
            jQuery(this).find(".fComments").addClass("comments").removeClass("fComments");
            jQuery(this).find(".fSaveDetails").addClass("caption").removeClass("fSaveDetails");

            var overlay = jQuery("<div class=\"overlay\"></div>");
            var title = jQuery(this).find(".fTitle").attr("title").replace(/[,.\s]+/g, "_");
            var href = jQuery(this).find(".fTitle a").attr("href");
            var pthref = href.substring(21, 28);

            overlay.append("<a class=\"btn btn-primary\" href=\"" + href + "\">View</a>");
            overlay.append("<a class=\"btn btn-inverse\" href=\"ptsave:" + pthref + "#" + title + "\">Open</a>");
            overlay.css({"opacity": 0});
            overlay.appendTo(this);

            var title2 = jQuery(this).find(".fTitle").attr("title");
            var text = jQuery(this).find(".fTitle a").text();
            jQuery(this).find(".fTitle").replaceWith("<h5 title=\"" + title2 + "\"><a href=\"" + href + "\">" + text + "</a></h5>");

            jQuery(this).find(".SaveDownloadDo").remove();
            jQuery(this).addClass("savegame").removeClass("fSaveGame");
            jQuery(this).find("a img").attr("width", "153").attr("height", "96");
        });
        jQuery(".savegame").on("mouseover", function() {
            jQuery(this).find(".overlay").animate({opacity: 1, top: "3px"}, 150);
        });
        jQuery(".savegame").on("mouseleave", function() {
            jQuery(this).find(".overlay").animate({opacity: 0, top: "-23px"}, 150);
        });
    }
    if (currentURL == "/Groups/Thread/EditPost.html") {
        // Add last edited count to the post itself

        // Fetch the username properly if the conversation notification icon is present¸
        var user;
        if (jQuery(".dropdown-toggle").find(".badge.badge-info").length) {
            user = jQuery(".dropdown-toggle").clone().children().remove().end().text().trim();
        } else {
            user = jQuery(".dropdown-toggle").text().trim();
        }

        var dt = new Date();
        var month;
        // Only prepend a zero if the month is lower than 10 (dt.getUTCMonth() + 1)
        if (dt.getUTCMonth() < 9) {
            month = "0" + (dt.getUTCMonth() + 1);
        } else {
            month = dt.getUTCMonth() + 1;
        }
        var time = dt.getUTCHours() + ":" + dt.getUTCMinutes() + " " + dt.getUTCDate() + "/" + month + "/" + dt.getUTCFullYear();
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
                lastEdited = "<p><small>Edited " + edits.toString() + " times by " + user + ". Last: " + time + "</small></p>";
                text = content.split("<p><small>")[0] + lastEdited;
            }

            tinymce.activeEditor.setContent(text);
        }, 1000);

        replacePageHeader();
    }
    if (currentURL == "/Groups/Thread/Create.html" || currentURL == "/Groups/Thread/Moderation.html"  || currentURL == "/Groups/Page/Register.html" || currentURL.indexOf("/Groups/Admin/") !== -1) {
        replacePageHeader();
    }
    if (currentURL == "/Groups/Page/View.html") {
        addCss([".breadcrumb {",
            "    margin: 0;",
            "    border-top: none;",
            "    border-right: none;",
            "    border-left: none;",
            "}"
        ].join("\n"));
        jQuery(".Pageheader").addClass("breadcrumb").removeClass("Pageheader");
    }
    if (currentURL == "/Groups/Admin/Members.html") {
        // Make the Admin management page work better by changing it's looks a little bit
        jQuery(".Pagination").remove();
        jQuery(".contents").css({"width": "900px"});
        jQuery(".MemberColumn").css({"width": "417.5px"});
        jQuery(".MemberName").css({"width": "120px"});
    }
    if (currentURL == "/Groups/Admin/MemberElevation.html" || currentURL == "/Groups/Page/Resign.html" || currentURL == "/PasswordReset.html") {
        // Stylize submit input
        jQuery("input[type=\"submit\"]").addClass("btn");
        if (currentURL == "/Groups/Page/Resign.html") {
            jQuery("input[type=\"submit\"]").addClass("btn-danger");
        } else {
            jQuery("input[type=\"submit\"]").addClass("btn-primary");
        }
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
            "}"
        ].join("\n"));
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
}, 2000);

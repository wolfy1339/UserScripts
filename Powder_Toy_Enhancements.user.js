// ==UserScript==
// @name        Powder Toy Enhancements
// @description Fix and improve some things (mainly moderation tools) on powdertoy.co.uk
// @match	 	*://powdertoy.co.uk/*
// @version		2.41
// @license		GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @grant       none
// @downloadURL https://openuserjs.org/install/wolfy1339/Powder_Toy_Enhancements.user.js
// ==/UserScript==


/* jshint forin:true, freeze:true, latedef:true, multistr:true, shadow:inner, undef:true, unused:true */

/* global tptenhance, d3, moment */
/* jshint jquery:true, browser:true */
/* global alert, confirm */
/* global currentSaveID:false */ // defined by powdertoy.co.uk in Browse/View.html
/* global ProcessMessages, LoadForumBlocks, WYSIWYG */ // powdertoy.co.uk functions which are overridden by this script


// contentEval, from http://userscripts.org/scripts/source/100842.user.js :
function contentEval(source) {
  if (document.body.id==="tinymce")
    return;
  if ('function' == typeof source) {
	source = '(' + source + ')();';
  }
  var script = document.createElement('script');
  script.setAttribute("type", "application/javascript");
  script.textContent = source;
  document.body.appendChild(script);
  document.body.removeChild(script);
}

function addScript(url) {
  if (document.body.id==="tinymce")
    return;
  var script = document.createElement('script');
  script.setAttribute("type", "application/javascript");
  script.setAttribute("src", url);
  document.body.appendChild(script);
}


// Fix silly way of checking whether facebook stuff is loaded (Browse.View.js:3, "if(FB)")
// If facebook is blocked, then the javascript on powdertoy.co.uk errors and does not execute important stuff like callbacks for showing tag info popups
contentEval('if (typeof window.FB == "undefined") window.FB = false;');

addScript("//cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.2/moment.min.js");

contentEval(function(){
var tptenhance_init = function(){

	if (typeof $ == "undefined" || typeof moment == "undefined") // check jQuery and other libraries have loaded
	{
		setTimeout(tptenhance_init, 20);
		return;
	}

	window.tptenhance = {

		// used by several functions to replace clicked "Delete" links to show that a request is in progress / finished
		deletingHtml:'<div class="pull-right label label-info"><i class="icon-refresh icon-white"></i> <strong>Deleting...</strong></div>',
		deletedHtml:'<div class="pull-right label label-success"><i class="icon-ok icon-white"></i> <strong>Deleted</strong></div>',
		doneLabelHtml:'<div class="label label-success"><i class="icon-ok icon-white"></i> <strong>Done</strong></div>',

		// a random page to use for redirects, which will hopefully load faster than the default redirect (e.g. to a user moderation page) in ajax requests
		dummyUrl:"/Themes/Next/Javascript/Browse.View.js",

		// Return session key (the thing used as CSRF protection) - cached in tptenhance.sessionKey
		getSessionKey:function()
		{
			if (tptenhance.sessionKey!=="")
				return tptenhance.sessionKey;

			$('.main-menu').find('a').each(function(){
				var url = this.href;
				var matches = url.match(/Logout.html\?Key=[A-Za-z0-9]+/);
				if (matches)
				{
					// Logout link found, extract key
					tptenhance.sessionKey = matches[0].split("=")[1];
				}
			});
			return tptenhance.sessionKey;
		},
		sessionKey:"",

		// Get the username to which the page refers
		// E.g. for moderation page, username of person being moderated.
		getPageUsername:function()
		{
			if (window.location.pathname.toString().indexOf("/User/Moderation.html" ||
					window.location.pathname == "/User.html")!=-1 ||
					window.location.pathname == "/User/Saves.html")!=-1)
				return $('.SubmenuTitle').text();
			if (window.location.pathname.toString().indexOf("/Browse.html")
			{
				var matches = window.location.search.toString().match(/[?&]Search_Query=[^&]*user(?::|%3A)(((?!(%20))[^ +&])+)/);
				if (matches)
					return matches[1];
			}
			return null;
		},

		// Get the username of the currently logged in user
		getAuthedUser:function()
		{
			var el = $(".main-menu .pull-right .dropdown:nth-child(2) a.dropdown-toggle");
			if (el.length)
				return el.contents().get(0).nodeValue.trim();
			return null;
		},

		LoadForumBlocks:function(){
			tptenhance.oldLoadForumBlocks();
			$(".Actions > a").each(function(){
				if (this.href.indexOf("/UnhidePost.html")!=-1)
				{
					$(this).click(function(e){
						e.preventDefault();
						$(this).addClass("disabled btn-primary");
						$.get(this.href);
						var newElement = $(this).parents('.Comment').children('.Message');
						var postID = newElement.attr('id').split("-")[1];
						$.get("/Discussions/Thread/Post.json?Post="+postID, function(){
							location.reload(true);
							// TODO: reload like http://powdertoy.co.uk/Applications/Application.Discussions/Javascript/Thread.js $(".Pagination a") click does
						});
					});
				}
			});
		},

		comments:
		{
			deleteUrl:function(commentId, saveId)
			{
				return "/Browse/View.html?ID="+encodeURIComponent(saveId)+"&DeleteComment="+encodeURIComponent(commentId);
			},
			// Get the ID of the comment inside elem (only works for moderators, since only they get a "Delete" link)
			getId:function(elem)
			{
				var deleteLink = $(elem).find(".Actions a");
				if (deleteLink.length)
					return +(deleteLink.attr("href").match(/DeleteComment=[0-9]+/)[0].split("=")[1]);
				else
					return null;
			}
		},
		tags:
		{
			// lists of callbacks triggered when tags are removed/disabled/enabled
			// callback fn arguments: tag text, save id
			tagRemovedCallbacks:$.Callbacks(),
			// callback fn arguments: tag text
			tagDisabledCallbacks:$.Callbacks(),
			tagEnabledCallbacks:$.Callbacks(),

			disableUrl:function(tag)
			{
				return "/Browse/Tags.html?Delete="+encodeURIComponent(tag)+"&Key="+encodeURIComponent(tptenhance.getSessionKey());
			},
			enableUrl:function(tag)
			{
				return "/Browse/Tags.html?UnDelete="+encodeURIComponent(tag)+"&Key="+encodeURIComponent(tptenhance.getSessionKey());
			},
			removeUrl:function(tag, saveId)
			{
				return "/Browse/EditTag.json?Op=delete&ID="+encodeURIComponent(saveId)+"&Tag="+encodeURIComponent(tag)+"&Key="+encodeURIComponent(tptenhance.getSessionKey());
			},
			searchUrl:function(search)
			{
				return "/Browse/Tags.html?Search_Query="+encodeURIComponent(search);
			},
			// Tag info HTML, showing moderators which user placed a particular tag
			// Optional argument saveId: only show who placed the tag on a single save, instead of showing all instances of the tag
			infoUrl:function(tagText, saveId)
			{
				var url = "/Browse/Tag.xhtml?Tag="+encodeURIComponent(tagText);
				if (typeof saveId!="undefined")
					url += "&SaveID="+encodeURIComponent(saveId);
				return url;
			},

			// Event handlers to use an ajax request for enable/disable button clicks for tags displayed in a div.Tag (on /Browse/Tags.html and user moderation pages)
			disableButtonClick:function(e){
				e.preventDefault();
				var tag = $(this).parents('.Tag').find(".TagText").text();
				if (tptenhance.popoverSelectedTag==tag)
					tptenhance.removePopover();
				var tagElem = $(this).parents('.Tag');
				var url = this.href.replace(/Redirect=[^&]*/, 'Redirect='+encodeURIComponent(tptenhance.dummyUrl));
				$(this).parent().append(' <span class="LoadingIcon"><i class="icon-refresh"></i></span>');
				$(this).css('display','none');
				$.get(url, function()
				{
					tptenhance.tags.showDisabled(tagElem);
					tptenhance.tags.tagDisabledCallbacks.fire(tagElem.find(".TagText").text());
				});
			},
			enableButtonClick:function(e){
				e.preventDefault();
				var tagElem = $(this).parents('.Tag');
				var url = this.href.replace(/Redirect=[^&]*/, 'Redirect='+encodeURIComponent(tptenhance.dummyUrl));
				$(this).parent().append(' <span class="LoadingIcon"><i class="icon-refresh"></i></span>');
				$(this).css('display','none');
				$.get(url, function()
				{
					tptenhance.tags.showEnabled(tagElem);
					tptenhance.tags.tagEnabledCallbacks.fire(tagElem.find(".TagText").text());
				});
			},
			attachHandlers:function(baseElem){
				// Attach event handlers which will make tag disabling/enabling happen in an ajax request. Also add a clearer tooltip for Disable buttons.
				// Does not attach event handlers for tag info popups
				baseElem.find('.UnDelButton').off('click').on('click', tptenhance.tags.enableButtonClick);
				baseElem.find('.DelButton').off('click').on('click', tptenhance.tags.disableButtonClick).attr('title', 'Disable');
			},

			// Change a tag to appear as disabled or enabled (used by event handlers above)
			showDisabled:function(tagElem){
				if (tagElem.hasClass('Restricted'))
					return;
				tagElem.addClass('Restricted');
				tagElem.find('.icon-refresh').remove();
				var btn = tagElem.find('.DelButton');
				btn.removeClass('DelButton').addClass('UnDelButton').css('display','inline');
				btn.attr('href', btn.attr('href').replace('/Browse/Tags.html?Delete=','/Browse/Tags.html?UnDelete='));
				btn.attr('title', 'Disable');
				tptenhance.tags.attachHandlers(tagElem);
			},
			showEnabled:function(tagElem){
				if (!tagElem.hasClass('Restricted'))
					return;
				tagElem.removeClass('Restricted');
				tagElem.find('.icon-refresh').remove();
				var btn = tagElem.find('.UnDelButton');
				btn.removeClass('UnDelButton').addClass('DelButton').css('display','inline');
				btn.attr('href', btn.attr('href').replace('/Browse/Tags.html?UnDelete=','/Browse/Tags.html?Delete='));
				btn.attr('title', 'Approve');
				tptenhance.tags.attachHandlers(tagElem);
			},
			// callbacks for updating status of built-in tag elements (provided by powdertoy.co.uk instead of added by this script) when this script removes/disables/enables a tag
			default_onTagRemoved:function(affectedTagText, affectedSaveId){
				if (typeof currentSaveID=="undefined" || affectedSaveId!=currentSaveID)
					return;
				$(".SaveTags span.Tag.label").each(function(){
					if ($(this).text()===affectedTagText)
						$(this).addClass("label-warning");
				});
			},
			default_onTagDisabled:function(affectedTagText){
				$("div.Tag").each(function(){
					var tagtextelems = $(this).find(".TagText");
					if (tagtextelems.length && tagtextelems.text()===affectedTagText)
						tptenhance.tags.showDisabled($(this));
				});
				$(".SaveTags span.Tag.label").each(function(){
					if ($(this).text()===affectedTagText)
						$(this).addClass("label-danger label-important");
				});
			},
			default_onTagEnabled:function(affectedTagText){
				$("div.Tag").each(function(){
					var tagtextelems = $(this).find(".TagText");
					if (tagtextelems.length && tagtextelems.text()===affectedTagText)
						tptenhance.tags.showEnabled($(this));
				});
				$(".SaveTags span.Tag.label").each(function(){
					if ($(this).text()===affectedTagText)
						$(this).removeClass("label-danger label-important");
				});
			},
			isTagElemDisabled:function(tagElem){
				tagElem = $(tagElem);
				if (tagElem.is("span.TagText"))
					tagElem = tagElem.parents(".Tag");
				if (tagElem.is(".label.Tag"))
					return tagElem.hasClass("label-danger") || tagElem.hasClass("label-important");
				else
					return tagElem.hasClass("Restricted");
			},
			isTagElemRemoved:function(tagElem){
				tagElem = $(tagElem);
				if (tagElem.is("span.TagText"))
					tagElem = tagElem.parents(".Tag");
				if (tagElem.is(".label.Tag"))
					return tagElem.hasClass("label-warning");
				return false;
			},
			createDisableLink:function(tagText){
				return $('<a class="Tag-LinkDisable" title="Disable tag">Disable</a>')
					.attr('href', tptenhance.tags.disableUrl(tagText)+"&Redirect="+encodeURIComponent(location.pathname+location.search));
			},
			createEnableLink:function(tagText){
				return $('<a class="Tag-LinkEnable" title="Enable tag">Enable</a>')
					.attr('href', tptenhance.tags.enableUrl(tagText)+"&Redirect="+encodeURIComponent(location.pathname+location.search));
			}
		},
		makeSaveLinks:function(messages, convertAllNumbers)
		{
			// Turn numbers which might be save IDs into links
			// 'messages' should be the jQuery elements to process, contents should be plain text
			var regex;
			if (typeof convertAllNumbers!="undefined" && convertAllNumbers)
				regex = /(?:~|\b(?:(?:id|save|saveid)[^\d\w]?)[\s]*)?[0-9]+\b/gi;
			else
				regex = /(?:~|\b(?:(?:id|save|saveid)[^\d\w]?)[\s]*)[0-9]+\b/gi;
			messages.each(function(){
				var msg = $(this);
				var text = msg.text();
				msg.empty();

				var result, prevLastIndex = 0;
				regex.lastIndex = 0;
				while ((result=regex.exec(text)))
				{
					// Append the text before the match
					msg.append($('<span></span>').text(text.slice(prevLastIndex, result.index)));
					// Turn the match into a link
					var link = $('<a></a>');
					link.attr('href', tptenhance.saves.viewUrl(result[0].match(/[0-9]+/)[0]));
					link.text(result[0]);
					msg.append(link);
					// store the position of the end of the match
					prevLastIndex = regex.lastIndex;
				}
				// Append last plain text part
				msg.append($('<span></span>').text(text.slice(prevLastIndex)));
			});
		},
		forums:{
			threadUrl:function(id)
			{
				return "/Discussions/Thread/View.html?Thread="+encodeURIComponent(id);
			}
		},
		groups:{
			currentGroupId:function()
			{
				// ID of the group currently being viewed
				return +($(".Pageheader a:eq(1)").attr("href").match(/[0-9]+/)[0]);
			}
		},
		saves:{
			dataUrl:function(id, historyVersion)
			{
				if (typeof historyVersion=="undefined" || !historyVersion)
					return "http://static.powdertoy.co.uk/"+encodeURIComponent(id)+".cps";
				else
					return "http://static.powdertoy.co.uk/"+encodeURIComponent(id)+"_"+encodeURIComponent(historyVersion)+".cps";
			},
			smallerImgUrl:function(id, historyVersion) // 153px × 96px
			{
				// TODO: historyVersion?
				if (typeof historyVersion=="undefined" || !historyVersion)
					return "/GetScreenshot.util?ID="+encodeURIComponent(id)+"&Size=small";
				else
					return tptenhance.saves.smallImgUrl(id, historyVersion);
			},
			smallImgUrl:function(id, historyVersion) // 204px × 128px
			{
				if (typeof historyVersion=="undefined" || !historyVersion)
					return "http://static.powdertoy.co.uk/"+encodeURIComponent(id)+"_small.png";
				else
					return "http://static.powdertoy.co.uk/"+encodeURIComponent(id)+"_"+encodeURIComponent(historyVersion)+"_small.png";
			},
			fullImgUrl:function(id, historyVersion) // 612px × 384px
			{
				if (typeof historyVersion=="undefined" || !historyVersion)
					return "http://static.powdertoy.co.uk/"+encodeURIComponent(id)+".png";
				else
					return "http://static.powdertoy.co.uk/"+encodeURIComponent(id)+"_"+encodeURIComponent(historyVersion)+".png";
			},
			viewUrl:function(id, historyVersion)
			{
				if (typeof historyVersion=="undefined" || !historyVersion)
					return "/Browse/View.html?ID="+encodeURIComponent(id);
				else
					return "/Browse/View.html?ID="+encodeURIComponent(id)+"&Date="+encodeURIComponent(historyVersion);
			},
			infoJsonUrl:function(id, historyVersion)
			{
				if (typeof historyVersion=="undefined" || !historyVersion)
					return "/Browse/View.json?ID="+encodeURIComponent(id);
				else
					return "/Browse/View.json?ID="+encodeURIComponent(id)+"&Date="+encodeURIComponent(historyVersion);
			},
			infoJsonUrlPTT:function(id)
			{
				return "http://powdertoythings.co.uk/Powder/Saves/View.json?ID="+encodeURIComponent(id);
			},
			infoDetailedJsonUrlPTT:function(id)
			{
				return "http://powdertoythings.co.uk/Powder/Saves/ViewDetailed.json?ID="+encodeURIComponent(id);
			},
			historyJsonUrl:function(id)
			{
				return "/Browse.json?Search_Query=history%3A"+encodeURIComponent(id)+"&Start=0&Count=100";
			},
			voteMapUrl:function(id)
			{
				return "/IPTools.html?Save="+encodeURIComponent(id);
			},
			voteDataJsonUrl:function(id)
			{
				return "/IPTools/SaveVoteData.json?ID="+encodeURIComponent(id);
			},
			searchUrl:function(query)
			{
				return "/Browse.html?Search_Query="+encodeURIComponent(query);
			},
			userSearchUrl:function(user)
			{
				return tptenhance.saves.searchUrl("user:"+user);
			},
			getCurrentHistoryVersion:function()
			{
				var matches = window.location.toString().match(/Date=([0-9]+)/);
				if (matches && matches.length)
					return +matches[1];
				else
					return null;
			},
			tabs:{},
			showVotes:function()
			{
				// some of this function is copied from the JS on the website

				var m = [40, 40, 20, 20],
					w = 612 - m[1] - m[3],
					h = 300 - m[0] - m[2];

				// Scales. Note the inverted domain for the y-scale: bigger is up!
				var x = d3.time.scale().range([0, w]),
					y = d3.scale.linear().range([h, 0]),
					xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(-h, 0).tickPadding(6),
					yAxis = d3.svg.axis().scale(y).orient("right").tickSize(-w).tickPadding(6);

				// An area generator.
				var area = d3.svg.area()
					.interpolate("step-after")
					.x(function(d) { return x(d.date); })
					.y0(function(d) { return y((d.value<0)?d.value:0); })
					.y1(function(d) { return y((d.value>0)?d.value:0); });

				// A line generator.
				var line = d3.svg.line()
					.interpolate("step-after")
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d.value); });

				var svg = d3.select("#VoteGraph").append("svg:svg")
					.attr("width", w + m[1] + m[3])
					.attr("height", h + m[0] + m[2])
				  .append("svg:g")
					.attr("transform", "translate(" + m[3] + "," + m[0] + ")");

				var gradient = svg.append("svg:defs").append("svg:linearGradient")
					.attr("id", "gradient")
					.attr("x2", "0%")
					.attr("y2", "100%");

				gradient.append("svg:stop")
					.attr("offset", "0%")
					.attr("stop-color", "#9ecae1")
					.attr("stop-opacity", 0.5);

				gradient.append("svg:stop")
					.attr("offset", "100%")
					.attr("stop-color", "#6baed6")
					.attr("stop-opacity", 1);

				svg.append("svg:clipPath")
					.attr("id", "clip")
				  .append("svg:rect")
					.attr("x", x(0))
					.attr("y", y(1))
					.attr("width", x(1) - x(0))
					.attr("height", y(0) - y(1));

				svg.append("svg:g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + w + ",0)");

				svg.append("svg:path")
					.attr("class", "area")
					.attr("clip-path", "url(#clip)")
					.style("fill", "url(#gradient)");

				svg.append("svg:g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + h + ")");

				svg.append("svg:path")
					.attr("class", "line")
					.attr("clip-path", "url(#clip)");

				var voteLines = svg.append("svg:g");

				var dupVLine;

				var rect = svg.append("svg:rect")
					.attr("class", "pane")
					.attr("width", w)
					.attr("height", h);
					//.call(d3.behavior.zoom().on("zoom", zoom));

				d3.json(tptenhance.saves.voteDataJsonUrl(currentSaveID), function(data) {

				// Parse dates and numbers.
				data.votes.forEach(function(d) {
					d.date = new Date(d.date*1000);//parse(d.date);
					d.value = +d.value;
				});
				data.dupVotes.forEach(function(d) {
					d.Date = new Date(d.Date*1000);//parse(d.date);
				});

				x.domain([d3.min(data.votes, function(d) { return d.date; }), d3.max(data.votes, function(d) { return d.date; })]);
				var ydomain = d3.extent(data.votes, function(d) { return d.value; });
				if (ydomain[0]>0) ydomain[0] = 0;
				y.domain(ydomain);

				rect.call(d3.behavior.zoom().x(x).on("zoom", zoom));

				// Bind the data to our path elements.
				svg.select("path.area").data([data.votes]);
				svg.select("path.line").data([data.votes]);

				function voteMouseover(d) {
					//d.classed("active", true);
					svg.selectAll(".dupVLine").classed("active", function(p) { return p.SourceAddress === d.SourceAddress; });
				}

				function voteMouseout() {
					svg.selectAll(".active").classed("active", false);
					//info.text(defaultInfo);
				}

				dupVLine = voteLines.selectAll("line.link")
				.data(data.dupVotes);

				var lineG = dupVLine.enter().insert("svg:g")
				.attr("class", function(d) { return "dupVLine"+d.Vote+" dupVLine"; })
				.on("mouseover", voteMouseover)
				.on("mouseout", voteMouseout);

				lineG.append("line")
				.attr("x1", 0).attr("x2", 0).attr("y1", h).attr("y2", -5);

				lineG.append("text")
				.attr("text-anchor", "middle")
				.attr('font-size', 11)
				.attr("dy", ".1em")
				.text(function(d) { return d.Username; });

				lineG.append("text")
				.attr("text-anchor", "middle")
				.attr('font-size', 11)
				.attr("dy", ".1em")
				.attr("transform", "translate(0, 14)")
				.text(function(d) { return d.SourceAddress; });

				//.x1(function(d) { return x(d.Date); })
				//.y1(function(d) { return y(100); });
				//.style("stroke-width", function(d) { return Math.sqrt(d.value); });

				dupVLine.exit().remove();

		/*link.enter().insert("svg:line", ".node")
			.attr("class", "link")
			.style("stroke-width", function(d) { return Math.sqrt(d.value); });

		link.exit().remove();*/

				  draw();
				});

				function draw() {
					svg.select("g.x.axis").call(xAxis);
					svg.select("g.y.axis").call(yAxis);
					svg.select("path.area").attr("d", area);
					svg.select("path.line").attr("d", line);
					/*dupVLine.attr("x1", function(d) { return x(d.Date); })
						.attr("y1", function(d) { return h; })
						.attr("x2", function(d) { return x(d.Date); })
						.attr("y2", function(d) { return -5; });*/
					dupVLine.attr("transform", function(d) { return "translate("+x(d.Date)+", 0)"; });
					//svg.select("dupVotes.line").attr();
				}

				// Using a timeout here to defer drawing seems to improve zooming in Firefox on slow computers
				// Possibly multiple calls to zoom are issued simultaneously depending on the amount of
				// scroll wheel movement, and unnecessary redraws occur. The setTimeout defers drawing,
				// hopefully until after all zoom calls occur.
				var zoomDrawTimeout = false;
				function zoomDraw() {
					zoomDrawTimeout = false;
					draw();
				}
				function zoom() {
					//d3.event.transform(x); // TODO d3.behavior.zoom should support extents
					if (zoomDrawTimeout===false) zoomDrawTimeout = setTimeout(zoomDraw, 1);
				}
			}
		},
		users:{
			profileUrlById:function(id)
			{
				return "/User.html?ID="+encodeURIComponent(id);
			},
			savesUrlById:function(id)
			{
				return "/User/Saves.html?ID="+encodeURIComponent(id);
			},
			profileUrlByName:function(n)
			{
				return "/User.html?Name="+encodeURIComponent(n);
			},
			savesUrlByName:function(n)
			{
				return "/User/Saves.html?Name="+encodeURIComponent(n);
			},
	};

	tptenhance.tags.tagRemovedCallbacks.add(tptenhance.tags.default_onTagRemoved);
	tptenhance.tags.tagDisabledCallbacks.add(tptenhance.tags.default_onTagDisabled);
	tptenhance.tags.tagEnabledCallbacks.add(tptenhance.tags.default_onTagEnabled);

	tptenhance.tags.TagInfoPopup = function(){
		this.targetElem = false;
		this.popupElem = false;

		this.selectedTagText = "";
		this.tagDisabled = false;
		this.getInfoXHR = false;
		this.updatePosition = this.updatePosition.bind(this);
		this.handleRemoveLinkClick = this.handleRemoveLinkClick.bind(this);
		this.handleDisableLinkClick = this.handleDisableLinkClick.bind(this);
		this.handleEnableLinkClick = this.handleEnableLinkClick.bind(this);
		this.onTagRemoved = this.onTagRemoved.bind(this);
		this.onTagDisabled = this.onTagDisabled.bind(this);
		this.onTagEnabled = this.onTagEnabled.bind(this);
	};
	tptenhance.tags.TagInfoPopup.prototype.isOpen = function(){
		return (!!this.targetElem);// return true if the popup is visible
	};
	tptenhance.tags.TagInfoPopup.prototype.normaliseTargetElem = function(elem){
		elem = $(elem);
		if (elem.hasClass("TagText"))
			elem = elem.parents(".Tag");
		return elem;
	};
	tptenhance.tags.TagInfoPopup.prototype.handleRemoveLinkClick = function(e){
		var tagInfo = $(e.target).parents('div.TagInfo');
		var saveId;
		var matches = $(tagInfo).find("a.Tag-LinkRemove").attr("href").match(/ID=([0-9]+)/);
		if (matches)
			saveId = +matches[1];
		else if (typeof currentSaveID!="undefined")
			saveId = currentSaveID;
		var url = e.target.href;
		var placeholder = $(tptenhance.deletingHtml).addClass("Tag-LinkRemove");
		$(e.target).replaceWith(placeholder);
		var that = this;
		var tagText = this.selectedTagText;
		$.get(url, function(){
			placeholder.replaceWith($(tptenhance.deletedHtml).addClass("Tag-LinkRemoved"));

			if (that.targetElem.is("span.Tag.label"))
				that.targetElem.addClass("label-warning");
			tptenhance.tags.tagRemovedCallbacks.fire(tagText, saveId);
		});
		return false;
	};
	tptenhance.tags.TagInfoPopup.prototype.onDisabledStateChange = function(newState){// newState=true means the tag is now disabled
		this.tagDisabled = newState;
		if (this.tagDisabled)
		{
			this.popupElem.find(".Tag-LinkDisable").addClass("hide");
			this.popupElem.find(".Tag-LinkEnable").removeClass("hide");

			this.popupElem.find(".TagPopup-showOthers").remove();
			this.popupElem.find(".Tag-LinkRemove").remove();
		}
		else
		{
			this.popupElem.find(".Tag-LinkDisable").removeClass("hide");
			this.popupElem.find(".Tag-LinkEnable").addClass("hide");
		}
		this.popupElem.find(".Tag-placeholder-StatusChange").remove();
	};

	tptenhance.tags.TagInfoPopup.prototype.handleDisableLinkClick = function(e){
		var url = e.target.href;
		var placeholder = $('<div class="pull-right label label-info Tag-LinkDisable Tag-placeholder-StatusChange"><i class="icon-refresh icon-white"></i> <strong>Disabling...</strong></div>');
		placeholder.insertAfter(e.target);
		$(e.target).addClass("hide");
		var tagText = this.selectedTagText;
		$.get(url, function(){
			tptenhance.tags.tagDisabledCallbacks.fire(tagText);
		});
		return false;
	};
	tptenhance.tags.TagInfoPopup.prototype.handleEnableLinkClick = function(e){
		var url = e.target.href;
		var placeholder = $('<div class="pull-right label label-info Tag-LinkEnable Tag-placeholder-StatusChange"><i class="icon-refresh icon-white"></i> <strong>Enabling...</strong></div>');
		placeholder.insertAfter(e.target);
		$(e.target).addClass("hide");
		var tagText = this.selectedTagText;
		$.get(url, function(){
			tptenhance.tags.tagEnabledCallbacks.fire(tagText);
		});
		return false;
	};
	tptenhance.tags.TagInfoPopup.prototype.onTagRemoved = function(affectedTagText, affectedSaveId){
		if (!this.isOpen() || affectedTagText!==this.selectedTagText)
			return;

		this.popupElem.find('div.TagInfo').each(function(){
			var removeLink = $(this).find("a.Tag-LinkRemove");
			if (!removeLink.length)
				return;
			var tagSaveId;
			var matches = removeLink.attr("href").match(/ID=([0-9]+)/);
			if (matches)
				tagSaveId = +matches[1];
			else if (typeof currentSaveID!="undefined")
				tagSaveId = currentSaveID;
			if (tagSaveId==affectedSaveId)
				removeLink.replaceWith($(tptenhance.deletedHtml).addClass("Tag-LinkRemoved"));
		});
		setTimeout(this.updatePosition,1);
	};
	tptenhance.tags.TagInfoPopup.prototype.onTagDisabled = function(affectedTagText){
		if (this.isOpen() && affectedTagText===this.selectedTagText)
			this.onDisabledStateChange(true);
		setTimeout(this.updatePosition,1);
	};
	tptenhance.tags.TagInfoPopup.prototype.onTagEnabled = function(affectedTagText){
		if (this.isOpen() && affectedTagText===this.selectedTagText)
			this.onDisabledStateChange(false);
		setTimeout(this.updatePosition,1);
	};

	tptenhance.tags.TagInfoPopup.prototype.createRemoveLink = function(tagText, saveId){
		var link = $('<a class="pull-right Tag-LinkRemove" title="Remove tag from this save">Remove</a>');
		link.attr('href',tptenhance.tags.removeUrl(tagText,saveId));
		link.on('click', this.handleRemoveLinkClick);
		return link;
	};
	tptenhance.tags.TagInfoPopup.prototype.createTagStatusLinks = function(tagText){
		var container = $("<span></span>");
		container.append(tptenhance.tags.createDisableLink(tagText)
			.addClass("pull-right")
			.on('click', this.handleDisableLinkClick)
		);
		container.append(tptenhance.tags.createEnableLink(tagText)
			.addClass("pull-right hide")
			.on('click', this.handleEnableLinkClick)
		);
		return container.children();
	};

	// Create a popup, with placeholder 'Loading...' text
	tptenhance.tags.TagInfoPopup.prototype.create = function(targetElem){
		tptenhance.tags.tagRemovedCallbacks.add(this.onTagRemoved);
		tptenhance.tags.tagDisabledCallbacks.add(this.onTagDisabled);
		tptenhance.tags.tagEnabledCallbacks.add(this.onTagEnabled);

		this.remove();
		this.targetElem = targetElem = this.normaliseTargetElem(targetElem);
		this.tagDisabled = tptenhance.tags.isTagElemDisabled(this.targetElem);
		this.popupElem = $('<div class="popover fade bottom in" style="display: block;"></div>');
		this.popupElem.appendTo(document.body);
		var title = $('<h3 class="popover-title">Tag Info</h3>');
		var content = $('<div class="popover-content">Loading...</div>');
		var arrow = $('<div class="arrow"></div>');
		var inner = $('<div class="popover-inner"></div>').append(title, content);
		this.popupElem.append(arrow, inner);
		this.updatePosition();
		return content;
	};
	// Update popup position (below centre of element which generated popup)
	tptenhance.tags.TagInfoPopup.prototype.updatePosition = function(){
		if (!this.targetElem || !this.popupElem) return;
		var left = this.targetElem.offset().left - (this.popupElem.width()/2) + (this.targetElem.width()/2);
		if (left<0) left = 0;
		this.popupElem.css("left", left);
		this.popupElem.css("top", this.targetElem.offset().top + this.targetElem.height());
	};
	// Remove the popup
	tptenhance.tags.TagInfoPopup.prototype.remove = function(){
		if (this.popupElem)
			this.popupElem.remove();
		this.popupElem = false;
		this.targetElem = false;
	};

	// Toggle a popup to show who placed a particular tag on a single save
	tptenhance.tags.TagInfoPopup.prototype.showSingle = function(targetElem, tagText, saveId){
		// If clicking on the tag that is already open, close the info popup
		targetElem = this.normaliseTargetElem(targetElem);
		if (this.isOpen() && targetElem.get(0)===this.targetElem.get(0))
		{
			this.remove();
			return;
		}
		// Abort any previous pending request
		if (this.getInfoXHR)
			this.getInfoXHR.abort();

		this.selectedTagText = tagText;
		var content = this.create(targetElem);
		var that = this;
		this.getInfoXHR = $.get(tptenhance.tags.infoUrl(tagText, saveId), function(data){
			that.getInfoXHR = false;
			content.html(data);
			content.find('div.TagInfo').each(function(){
				$(this).append(that.createRemoveLink(tagText, saveId));
				$(this).append(that.createTagStatusLinks(tagText));
			});
			var showMore = $('<div class="TagPopup-showOthers"><a>Show uses on other saves</a></div>');
			showMore.appendTo(content);
			showMore.find("a")
				.attr('href',tptenhance.tags.searchUrl(tagText))
				.on('click', function(){
					that.remove();
					that.showAll(targetElem, tagText);
					return false;
				});
			that.updatePosition();
			if (that.tagDisabled)
				that.onDisabledStateChange(true);
		}, "html");
	};

	// Toggle a popup to show all instances of a particular tag
	// Optional argument sortUser: sorts tags so that tags placed by that username are at the top
	tptenhance.tags.TagInfoPopup.prototype.showAll = function(targetElem, tagText, sortUser){
		// If clicking on the tag that is already open, close the info popup
		targetElem = this.normaliseTargetElem(targetElem);
		if (this.isOpen() && targetElem.get(0)===this.targetElem.get(0))
		{
			this.remove();
			return;
		}
		// Abort any previous pending request
		if (this.getInfoXHR)
			this.getInfoXHR.abort();

		this.selectedTagText = tagText;
		var content = this.create(targetElem);
		var that = this;
		this.getInfoXHR = $.get(tptenhance.tags.infoUrl(tagText), function(data){
			that.getInfoXHR = false;
			content.html(data);

			var tagStatusLinks = $('<div class="pull-right" style="margin-bottom:7px;"></div>').append(that.createTagStatusLinks(tagText));
			content.prepend(tagStatusLinks);

			var shouldSortUser = (typeof sortUser!="undefined" && sortUser!=="");
			var separator = false;
			// Go through the tags in the popup and add Remove links
			content.find('div.TagInfo').each(function(){
				var tagInfo = $(this);
				var saveId = $(tagInfo.find("a")[0]).text();
				var userName = $(tagInfo.find("a")[1]).text();

				$(this).append(that.createRemoveLink(tagText, saveId));

				if (shouldSortUser && userName!==sortUser)
				{
					if (!separator) separator = $('<hr>').appendTo(content);
					$(this).appendTo(content);// (move this tag to end - tags which don't get moved stay where they are, above the separator)
				}
			});

			that.updatePosition();
			if (that.tagDisabled)
				that.onDisabledStateChange(true);
		}, "html");
	};

	tptenhance.tags.tagInfoPopup = new tptenhance.tags.TagInfoPopup();


	// Class to remove many instances of tags ("instance" here means a specific tag on a specific save) with a delay between requests
	tptenhance.tags.TagInstanceRemover = function(){
		this.tags = [];
		this.callback_progress = null;
		this.callback_finished = null;
		this.start = this.start.bind(this);
		this._tagStart = this._tagStart.bind(this);
		this._tagDone = this._tagDone.bind(this);
		this.currentXHR = null;
		this.interval = 500; // delay in ms between requests
	};
	tptenhance.tags.TagInstanceRemover.prototype.push = function(tagText, saveId){
		this.tags.push({tagText:tagText, saveId:saveId});
	};
	tptenhance.tags.TagInstanceRemover.prototype.start = function(){
		this.tagsCount = this.tags.length;
		this._tagStart();
	};
	tptenhance.tags.TagInstanceRemover.prototype._tagStart = function(){
		if (!this.tags.length){
			if (this.callback_finished)
				this.callback_finished();
			return;
		}

		var total = this.tagsCount;
		var done = total-this.tags.length;
		this.currentTag = this.tags.shift();
		if (this.callback_progress)
			this.callback_progress(done, total, this.currentTag);
		this.currentXHR = $.get(tptenhance.tags.removeUrl(this.currentTag.tagText,this.currentTag.saveId), this._tagDone);
	};
	tptenhance.tags.TagInstanceRemover.prototype._tagDone = function(){
		tptenhance.tags.tagRemovedCallbacks.fire(this.currentTag.tagText,this.currentTag.saveId);
		setTimeout(this._tagStart, this.interval);
	};



	tptenhance.tags.SaveTagsTable.prototype.tagInfoStart = function()
	{
		this.fetchTimeout = false;
		if (!this.pendingRows.length)
			return;
		this.fetchRow = this.pendingRows.shift();
		$.get(tptenhance.tags.infoUrl(this.fetchRow.tagText, currentSaveID), this.tagInfoFetched, "html");
	};
	tptenhance.tags.SaveTagsTable.prototype.tagInfoFetched = function(data)
	{
		this.fetchRow.processFetchedInfo(data);
		this.fetchTimeout = setTimeout(this.tagInfoStart, 500);
	};
	tptenhance.tags.SaveTagsTable.prototype.handleRemoveAllClick = function(){
		var pendingIndicator = $('<span class="Tag-LinkRemove Tag-placeholder-Remove"><span class="label label-info" title="Removing..."><i class="icon-refresh icon-white"></i></span></span>');
		var tir = new tptenhance.tags.TagInstanceRemover();
		this.tagElems.each(function(){
			if (!tptenhance.tags.isTagElemDisabled(this) && !tptenhance.tags.isTagElemRemoved(this))
				tir.push($(this).text(), currentSaveID);
		});
		this.tableElem.find("td .Tag-LinkRemove").addClass("hide").before(pendingIndicator);
		tir.start();
	};

	tptenhance.tags.SaveTagsTableRow = function(tagElem){
		this.handleRemoveLinkClick = this.handleRemoveLinkClick.bind(this);
		this.handleDisableLinkClick = this.handleDisableLinkClick.bind(this);
		this.handleEnableLinkClick = this.handleEnableLinkClick.bind(this);
		this.onTagRemoved = this.onTagRemoved.bind(this);
		this.onTagDisabled = this.onTagDisabled.bind(this);
		this.onTagEnabled = this.onTagEnabled.bind(this);

		this.tagElem = $(tagElem);
		this.tagText = this.tagElem.text();
		this.rowElem = $('<tr></tr>');
		this.textCell = $('<td class="TagText"></td>').text(this.tagText).appendTo(this.rowElem);
		this.userCell = $('<td>Loading...</td>').appendTo(this.rowElem);
		this.actionsCell = $('<td class="TagActions"></td>').appendTo(this.rowElem);
		this.removeLink = $('<a class="Tag-LinkRemove" title="Remove tag from this save">Remove</a>')
			.attr('href',tptenhance.tags.removeUrl(this.tagText,currentSaveID))
			.on('click', this.handleRemoveLinkClick);
		this.disableLink = $('<a class="Tag-LinkDisable" title="Disable tag">Disable</a>')
			.attr('href',tptenhance.tags.disableUrl(this.tagText)+"&Redirect="+encodeURIComponent(tptenhance.dummyUrl))
			.on('click', this.handleDisableLinkClick);
		this.enableLink = $('<a class="Tag-LinkEnable" title="Enable tag">Enable</a>')
			.attr('href',tptenhance.tags.enableUrl(this.tagText)+"&Redirect="+encodeURIComponent(tptenhance.dummyUrl))
			.on('click', this.handleEnableLinkClick);
		this.actionsCell.append(this.removeLink);
		this.actionsCell.append(this.disableLink, this.enableLink);

		if (tptenhance.tags.isTagElemDisabled(this.tagElem))
			this.disableLink.addClass("hide");
		else
			this.enableLink.addClass("hide");
		if (tptenhance.tags.isTagElemDisabled(this.tagElem) || tptenhance.tags.isTagElemRemoved(this.tagElem))
			this.userCell.html("&nbsp;");
		if (tptenhance.tags.isTagElemRemoved(this.tagElem))
			this.removeLink.replaceWith('<span><span class="label label-success"><i class="icon-ok icon-white" title="Removed"></i></span></span></span>');

		tptenhance.tags.tagRemovedCallbacks.add(this.onTagRemoved);
		tptenhance.tags.tagDisabledCallbacks.add(this.onTagDisabled);
		tptenhance.tags.tagEnabledCallbacks.add(this.onTagEnabled);
	};
	tptenhance.tags.SaveTagsTableRow.prototype.onTagRemoved = function(affectedTagText, affectedSaveId){
		if (affectedSaveId==currentSaveID && affectedTagText===this.tagText)
		{
			this.actionsCell.find(".Tag-placeholder-Remove").remove();
			this.removeLink.replaceWith('<span><span class="label label-success"><i class="icon-ok icon-white" title="Removed"></i></span></span></span>');
		}
	};
	tptenhance.tags.SaveTagsTableRow.prototype.onTagDisabled = function(affectedTagText){
		if (affectedTagText===this.tagText)
		{
			this.disableLink.addClass("hide");
			this.enableLink.removeClass("hide");
			this.actionsCell.find(".Tag-placeholder-StatusChange").remove();

			this.actionsCell.find(".Tag-placeholder-Remove").remove();
			this.removeLink.replaceWith('<span><span class="label label-success"><i class="icon-ok icon-white" title="Removed"></i></span></span></span>');
		}
	};
	tptenhance.tags.SaveTagsTableRow.prototype.onTagEnabled = function(affectedTagText){
		if (affectedTagText===this.tagText)
		{
			this.disableLink.removeClass("hide");
			this.enableLink.addClass("hide");
			this.actionsCell.find(".Tag-placeholder-StatusChange").remove();
		}
	};
	tptenhance.tags.SaveTagsTableRow.prototype.processFetchedInfo = function(data){
		this.userCell.empty();
		this.userCell.append($(data).filter("div.TagInfo").find("a").first());
	};

	tptenhance.tags.SaveTagsTableRow.prototype.handleRemoveLinkClick = function(e){
		var pendingIndicator = $('<span class="Tag-placeholder-Remove"><span class="label label-info" title="Removing..."><i class="icon-refresh icon-white"></i></span></span>');
		$(e.target).addClass("hide").before(pendingIndicator);
		var url = e.target.href;
		var that = this;
		$.get(url,function(){
			pendingIndicator.remove();
			tptenhance.tags.tagRemovedCallbacks.fire(that.tagText, currentSaveID);
		});
		return false;
	};
	tptenhance.tags.SaveTagsTableRow.prototype.handleDisableLinkClick = function(e){
		var pendingIndicator = $('<span class="Tag-placeholder-StatusChange"><span class="label label-info" title="Disabling..."><i class="icon-refresh icon-white"></i></span></span>');
		$(e.target).addClass("hide").before(pendingIndicator);
		var url = e.target.href;
		var that = this;
		$.get(url,function(){
			pendingIndicator.remove();
			tptenhance.tags.tagDisabledCallbacks.fire(that.tagText);
		});
		return false;
	};
	tptenhance.tags.SaveTagsTableRow.prototype.handleEnableLinkClick = function(e){
		var pendingIndicator = $('<span><span class="label label-info" title="Enabling..."><i class="icon-refresh icon-white"></i></span></span>');
		$(e.target).addClass("hide").before(pendingIndicator);
		var url = e.target.href;
		var that = this;
		$.get(url,function(){
			pendingIndicator.remove();
			tptenhance.tags.tagEnabledCallbacks.fire(that.tagText);
		});
		return false;
	};

	// Class to manage pagination and deletion+refreshing for a comments section (e.g. Browse/View.html or user moderation page)
	tptenhance.comments.CommentView = function(container){
		this.container = $(container);
		this.wasPageChanged = {value:false};
		this.commentPageRequest = null;
		this.handleDeleteClick = this.handleDeleteClick.bind(this);
		this.handlePaginationClick = this.handlePaginationClick.bind(this);
		this.handlePaginationFetched = this.handlePaginationFetched.bind(this);

		var that = this;
		$(window).bind('popstate', function(){
			that.changePage(''+window.location);
		});
		this.msgList = this.container.find(".MessageList");
		this.pagination = this.container.find(".Pagination");
		this.attachCommentHandlers();
		this.attachPaginationHandlers();
		this.makeSaveLinks();
	};
	tptenhance.comments.CommentView.prototype.attachCommentHandlers = function(){
		var that = this;
		this.msgList.find(".Actions a").each(function(){
			if (this.href.indexOf('DeleteComment=')
			{
				$(this).off('click').on('click',that.handleDeleteClick);
				var url = $(this).attr('href');
				var redirectUrl = (''+window.location).replace(/^http:\/\/powdertoy.co.uk/, '');
				if (url.match(/Redirect=[^&]*/))
					url = url.replace(/Redirect=[^&]*/, 'Redirect='+encodeURIComponent(redirectUrl));
				else if (url.indexOf('?')
					url += '&Redirect='+encodeURIComponent(redirectUrl);
				else
					url += '?Redirect='+encodeURIComponent(redirectUrl);
				$(this).attr('href', url);
			}
		});
	};
	tptenhance.comments.CommentView.prototype.attachPaginationHandlers = function(){
		this.pagination.find("a").off('click').on('click', this.handlePaginationClick);
	};
	tptenhance.comments.CommentView.prototype.handleDeleteClick = function(e){
		var deleteLink = $(e.target);
		var msg = deleteLink.parents(".Post");
		var wasPageChanged = this.wasPageChanged;
		var that = this;
		var placeholder = $(tptenhance.deletingHtml);
		deleteLink.css("display", "none");
		msg.find(".Meta").prepend(placeholder);
		msg.addClass("Deleting");
		$.get(deleteLink.attr('href'), function(data){
			msg.removeClass("Deleting").addClass("Deleted");
			placeholder.replaceWith(tptenhance.deletedHtml);
			if (!wasPageChanged.value)
				that.mergeComments(data);
		});
		return false;
	};
	tptenhance.comments.CommentView.prototype.extractCommentsFromResponse = function(data){
		return $(data).find(".MessageList");
	};
	tptenhance.comments.CommentView.prototype.extractPaginationFromResponse = function(data){
		return $(data).find(".Pagination").first();
	};
	tptenhance.comments.CommentView.prototype.mergeComments = function(data){
		var newComments = this.extractCommentsFromResponse(data).find(".Post");
		var existingCommentIds = [];
		var that = this;
		// Check which comments are already displayed on the page
		this.msgList.find(".Post").each(function(){
			existingCommentIds.push(tptenhance.comments.getId($(this)));
		});
		// Insert comments which are in the response but not yet on the page (i.e. the comments which have moved up into the current page because some of the comments that were previously on the current page have been deleted)
		newComments.each(function(){
			var commentId = tptenhance.comments.getId($(this));
			if (existingCommentIds.indexOf(commentId)===-1)
				that.msgList.append($(this));
		});
		// Sort comments into the correct order (newest first / descending ID)
		var commentArray = this.msgList.find(".Post").toArray();
		commentArray.sort(function(a,b){
			var idA = tptenhance.comments.getId(a);
			var idB = tptenhance.comments.getId(b);
			return (idA<idB) ? 1 : -1;
		});
		$(commentArray).detach().appendTo(this.msgList);
		this.attachCommentHandlers();
		this.makeSaveLinks();
	};

	tptenhance.comments.CommentView.prototype.makeSaveLinks = function(){
		tptenhance.makeSaveLinks(this.msgList.find(".Post .Message"));
	};

	tptenhance.comments.CommentView.prototype.handlePaginationClick = function(e){
		var url = $(e.target).attr("href");
		if (typeof history.pushState!="undefined")
			history.pushState(null, "", url);
		this.changePage(url);
		return false;
	};
	tptenhance.comments.CommentView.prototype.changePage = function(url){
		this.container.find("#ActionSpinner").fadeIn("fast");
		this.wasPageChanged.value = true;
		this.wasPageChanged = {value:false};
		if (this.commentPageRequest)
			this.commentPageRequest.abort();
		// url = url.replace(/\.html\?/, ".json?Mode=MessagesOnly&");
		this.commentPageRequest = $.get(url, this.handlePaginationFetched);
	};
	tptenhance.comments.CommentView.prototype.handlePaginationFetched = function(data){
		this.commentPageRequest = null;
		this.container.find("#ActionSpinner").fadeOut("fast");
		var newPagination = this.extractPaginationFromResponse(data);
		this.pagination.empty().append(newPagination);
		var newComments = this.extractCommentsFromResponse(data).find(".Post");
		this.msgList.empty().append(newComments);
		this.attachCommentHandlers();
		this.attachPaginationHandlers();
		this.makeSaveLinks();
	};


	tptenhance.saves.makeThumb = function(saveInfo){
		var thumbContainer = $('<div class="savegame-outer"><div class="savegame"></div></div>');
		var thumbImg = $('<a><img height="96" width="153"></a>');
		thumbImg.attr("href", tptenhance.saves.viewUrl(saveInfo.ID, saveInfo.Version));
		thumbImg.find("img").attr("src", tptenhance.saves.smallImgUrl(saveInfo.ID, saveInfo.Version));
		var caption = $('<div class="caption"><h5><a></a></h5><span class="author"></span><span class="comments"></span>');
		caption.find("h5 a").attr("href", tptenhance.saves.viewUrl(saveInfo.ID, saveInfo.Version)).text(saveInfo.ShortName);
		caption.find(".author").text(saveInfo.Username);
		if (typeof saveInfo.Version!="undefined" && saveInfo.Version)
			caption.find(".comments").text(moment(new Date(+saveInfo.Version * 1000)).format("YYYY-MM-DD HH:mm:ss"));
		else
			caption.find(".comments").text(saveInfo.Comments+" comment"+(+saveInfo.Comments!=1?"s":""));
		thumbContainer.find(".savegame").append(thumbImg).append(caption);
		return thumbContainer;
	};

	tptenhance.saves.countSignCopies = function(signs, checkSign){
		// Returns the number of signs in the signs array which match checkSign
		var count = 0;
		for (var i=0; i<signs.length; ++i)
		{
			if (signs[i].PlacementX==checkSign.PlacementX && signs[i].PlacementY==checkSign.PlacementY && signs[i].RawText==checkSign.RawText)
				++count;
		}
	};

	tptenhance.saves.addPicSignLinks = function(picContainer, signData){
		signData.forEach(function(s){
			var signElem;
			if (s.Type=="Save link" || s.Type=="Thread link")
				signElem = $('<a></a>');
			else
			//	other signs disabled for now (I might enable them if I can make them use the same font as TPT). Uncomment next line to enable other signs:
				//signElem = $('<span></span>');
				return;
			signElem.addClass("SaveSign");
			if (tptenhance.saves.countSignCopies(signData, s)>1)
				signElem.addClass("DupSign");
			signElem.css({
				top:s.DrawY+"px",
				left:s.DrawX+"px",
				width:s.DrawW+"px",
				height:s.DrawH+"px"
			});
			signElem.text(s.DisplayText);

			if (s.Type=="Save link")
			{
				signElem.attr("href", tptenhance.saves.viewUrl(s.LinkID));
				signElem.addClass("SignLink SignLink-Save");
			}
			else if (s.Type=="Thread link")
			{
				signElem.attr("href", tptenhance.forums.threadUrl(s.LinkID));
				signElem.addClass("SignLink SignLink-Thread");
			}
			else if (s.Type=="Spark sign")
			{
				signElem.addClass("SignSpark");
			}
			else
			{
				signElem.addClass("SignPlain");
			}
			signElem.appendTo(picContainer);
		});
	};

	tptenhance.saves.tabs.Container = function(container){
		this.onBtnClick = this.onBtnClick.bind(this);
		this.container = container;
		this.tabs = [];
		this.tabBtns = $('<ul class="nav nav-pills"></ul>');
		$('<div></div>').append(this.tabBtns).css({"text-align": "center"}).appendTo(container);
		this.tabBtns.css({"display": "inline-block", "margin-bottom":"0"});
		this.activeTab = null;
	};
	tptenhance.saves.tabs.Container.prototype.addTab = function(newTab){
		var tabInfo = {
			obj:newTab,
			btn:$('<li class="item"><a href=""></a></li>').appendTo(this.tabBtns),
			container:$('<div></div>')
		};
		tabInfo.btnText = tabInfo.btn.find("a");
		tabInfo.btnText.data("tabInfo", tabInfo);
		tabInfo.btnText.on("click", this.onBtnClick);
		this.tabs.push(tabInfo);
		newTab.init(tabInfo);
	};
	tptenhance.saves.tabs.Container.prototype.onBtnClick = function(e){
		this.tabBtns.find("li.active").removeClass("active");
		$(e.delegateTarget).parent().addClass("active");

		var newTabInfo = $(e.delegateTarget).data("tabInfo");
		if (this.activeTab!==null)
			this.activeTab.container.detach();
		newTabInfo.container.appendTo(this.container);
		this.activeTab = newTabInfo;
		newTabInfo.obj.activate();
		setTimeout(tptenhance.tags.tagInfoPopup.updatePosition,1);
		return false;
	};

	tptenhance.saves.tabs.Tags = function(){
		this.activated = false;
	};
	tptenhance.saves.tabs.Tags.prototype.init = function(info){
		this.info = info;
		this.container = this.info.container;
		this.info.btnText.text("Tags");
	};
	tptenhance.saves.tabs.Tags.prototype.activate = function(){
		if (this.activated===false)
		{
			// TODO: click on tags in table to show other uses, button to remove all instances of a tag
			var tagsTable = new tptenhance.tags.SaveTagsTable($(".SaveTags .Tag"));
			this.container.append(tagsTable.tableElem);
			this.activated = true;
		}
	};

	tptenhance.saves.tabs.Bumps = function(){};
	tptenhance.saves.tabs.Bumps.prototype.init = function(info){
		this.info = info;
		this.container = this.info.container;
		this.info.btnText.text("Bumps");
	};
	tptenhance.saves.tabs.Bumps.prototype.activate = function(){
		var that = this;
		$.get(tptenhance.saves.infoJsonUrlPTT(currentSaveID), function(data){
			that.container.empty();
			var bumpList = $('<div style="text-align:center;"></div>');
			data.BumpTimes.sort(function(a,b){return b-a;});
			if (data.BumpTimes.length)
			{
				if (data.BumpTimes.length>1)
					$('<strong>This save has been bumped at least '+data.BumpTimes.length+' times:</strong>').appendTo(bumpList);
				else
					$('<strong>This save has been bumped at least once:</strong>').appendTo(bumpList);
				data.BumpTimes.forEach(function(bt) {
					var dateText = moment(new Date(+bt * 1000)).format("DD MMM YYYY HH:mm:ss");
					$('<div></div>').text(dateText).appendTo(bumpList);
				});
			}
			else
			{
				bumpList.text('No record found of this save ever being published');
			}
			that.container.append(bumpList);
			tptenhance.tags.tagInfoPopup.updatePosition();
		}, "json");
	};

	tptenhance.saves.tabs.History = function(){};
	tptenhance.saves.tabs.History.prototype.init = function(info){
		this.info = info;
		var container = $('<div class="thumbnails"></div><div class="Clear"></div>');
		container.appendTo(this.info.container);
		this.container = container.filter(".thumbnails");
		this.info.btnText.text("History");
	};
	tptenhance.saves.tabs.History.prototype.activate = function(){
		var that = this;
		$.get(tptenhance.saves.historyJsonUrl(currentSaveID), function(data){
			that.container.empty();
			if (typeof data.Saves=="undefined")
				return;
			if (data.Saves.length)
			{
				for (var i=0; i<data.Saves.length; i++)
					that.container.append(tptenhance.saves.makeThumb(data.Saves[i]));
			}
			else
			{
				$('<div class="alert" style="margin-top: 10px;">No save history found.</div>').appendTo(that.container);
			}

			tptenhance.tags.tagInfoPopup.updatePosition();
		}, "json");
	};

	tptenhance.saves.tabs.Details = function(){};
	tptenhance.saves.tabs.Details.prototype.init = function(info){
		this.info = info;
		this.container = this.info.container;
		this.info.btnText.text("More info");
	};
	tptenhance.saves.tabs.Details.prototype.activate = function(){
		var that = this;
		$.get(tptenhance.saves.infoDetailedJsonUrlPTT(currentSaveID), function(data){
			that.container.empty();
			if (typeof data.Error!="undefined")
			{
				that.container.append($("<div></div>").addClass("alert alert-error").text(data.Error));
			}
			else if (!data)
			{
				that.container.append($("<div></div>").addClass("alert alert-error").text("Error while fetching save info"));
			}
			else
			{
				var subcontainer;
				subcontainer = $('<div></div>');
				that.makeElemsInfo(subcontainer, data);
				that.container.append(subcontainer);

				subcontainer = $('<div style="text-align:center;"><div class="SaveDetails-notifyOld">(data may be up to 5 minutes old)</div></div>');
				that.makeSignsTable(subcontainer, data);
				that.container.append(subcontainer);
				tptenhance.saves.addPicSignLinks($(".SaveGamePicture"), data.Signs);
			}
			tptenhance.tags.tagInfoPopup.updatePosition();
		}, "json");
	};
	tptenhance.saves.tabs.Details.prototype.makeElemsInfo = function(container, data){
		var elemsContainer = $('<div><div class="ElemCountChart"></div></div>').appendTo(container);
		var elemsChart = d3.select(elemsContainer.find(".ElemCountChart").get(0));
		var totalCount = d3.sum(data.ElementCount, function(d) { return d.Count; });
		elemsChart.selectAll("div.bar")
		.data(data.ElementCount.sort(function(a,b){return d3.descending(a.Count,b.Count);}))
		.enter()
		.append("div")
		.classed("bar", true)
		.style("width", function(d){return (d.Count/totalCount*100)+"%";})
		.style("background-color", function(d){return (typeof d.Colour!="undefined") ? "#"+d.Colour : "#000"; })
		.style("color", function(d){
			if (typeof d.Colour=="undefined")
				return "#FFF";
			//2*r + 3*g + b
			if (2*parseInt(d.Colour.substring(0,2),16) + 3*parseInt(d.Colour.substring(2,4),16) + parseInt(d.Colour.substring(4,6),16) > 544)
				return "#000";
			else
				return "#FFF";
		})
		.each(function(d){
			var nametxt;
			if (typeof d.Name!="undefined")
				nametxt = d.Name;
			else
				nametxt = d.Identifier;
			var tooltiptxt = nametxt+": "+d.Count+" ";
			tooltiptxt += (d.Count===1) ? "particle" : "particles";
			$(this).tooltip({title:tooltiptxt, placement:"top"});
			$(this).append($("<span class=\"barlabel\"></span>").text(nametxt));
		});
		elemsChart.append("div").classed("Clear", true);
	};
	tptenhance.saves.tabs.Details.prototype.makeSignsTable = function(container, data){
		var signsTbl = $('<table cellspacing="0" cellpadding="0" style="margin:0 auto;" class="SignsTbl"><thead><tr><th>Position</th><th>Displayed text</th><th>Sign type</th></tr></thead><tbody></tbody></table>');
		var signsTblBody = signsTbl.find('tbody');
		data.Signs.sort(function(a,b){return a.PlacementY*10000-b.PlacementY*10000+a.PlacementX-b.PlacementX;});
		if (data.Signs.length)
		{
			data.Signs.forEach(function(s){
				var row = $('<tr></tr>');
				if (tptenhance.saves.countSignCopies(data.Signs, s)>1)
					row.addClass("DupSign");
				$('<td></td>').text(s.PlacementX+','+s.PlacementY).appendTo(row);
				if (s.Type=="Save link" || s.Type=="Thread link")
				{
					var cell, url;
					if (s.Type=="Save link")
					{
						url = tptenhance.saves.viewUrl(s.LinkID);
						cell = $('<td></td>').appendTo(row);
						$('<a></a>').text(s.DisplayText).attr('href', url).appendTo(cell);

						cell = $('<td></td>').text(s.Type+': ').appendTo(row);
						$('<a></a>').text(s.LinkID).attr('href', url).appendTo(cell);
						var thumb = $('<img>').attr('src', tptenhance.saves.smallImgUrl(s.LinkID));
						$('<a class="SignLinkSaveThumb"></a>').append(thumb).attr('href', url).appendTo(cell);
					}
					else if (s.Type=="Thread link")
					{
						url = tptenhance.forums.threadUrl(s.LinkID);
						cell = $('<td></td>').appendTo(row);
						$('<a></a>').text(s.DisplayText).attr('href', url).appendTo(cell);

						cell = $('<td></td>').text(s.Type+': ').appendTo(row);
						$('<a></a>').text(s.LinkID).attr('href', url).appendTo(cell);
					}
				}
				else if (s.Type=="Spark sign")
				{
					$('<td></td>').text(s.DisplayText).appendTo(row);
					$('<td></td>').text(s.Type).appendTo(row);
				}
				else
				{
					$('<td></td>').text(s.RawText).appendTo(row);
					$('<td></td>').text(s.Type).appendTo(row);
				}
				row.appendTo(signsTblBody);
			});
			container.append(signsTbl);
		}
	};

	tptenhance.saves.tabs.Search = function(){};
	tptenhance.saves.tabs.Search.prototype.init = function(info){
		this.info = info;
		this.info.btnText.text("Search similar");

		var container = $('<div><strong>Search for similar saves by:</strong><br></div>').css({"text-align":"center"});
		$('<a></a>')
			.attr('href', 'http://powdertoythings.co.uk/Powder/Saves/Search.html?Search_Query='+encodeURIComponent("sort:id search:title "+$(".Title").attr('title').trim()))
			.text("Title")
			.append('<br>')
			.appendTo(container);
		$('<a></a>')
			.attr('href', 'http://powdertoythings.co.uk/Powder/Saves/Search.html?Search_Query='+encodeURIComponent("search:similartitle "+$(".Title").attr('title').trim()))
			.text("Similar title")
			.append('<br>')
			.appendTo(container);
		if ($(".SaveDescription").text().trim()!="No Description provided.")
		{
			$('<a></a>')
				.attr('href', 'http://powdertoythings.co.uk/Powder/Saves/Search.html?Search_Query='+encodeURIComponent("sort:id search:desc "+$(".SaveDescription").text().trim()))
				.text("Description")
				.append('<br>')
				.appendTo(container);
		}
		this.info.container.append(container);
	};
	tptenhance.saves.tabs.Search.prototype.activate = function(){};



	if (window.location.pathname == "/User.html")!=-1)
	{
		$(document).ready(function(){
			var matches = window.location.toString().match(/(Name|ID)=.+/);
			if (matches)
			{
				$(".ProfileInfo > .alert-info:nth-child(2)").remove();
				var regRow = $('<div class="UserInfoRow"><label>Registered:</label> <span></span></div>');
				regRow.insertAfter($(".ProfileInfo .page-header").first());
				$.get("http://powdertoythings.co.uk/Powder/User.json?"+matches[0], function(data) {
					var txt = "unknown";
					function timeToString(regTime)
					{
						return moment(regTime).format("DD MMM YYYY HH:mm:ss");
					}
					function boundsText(bounds)
					{
						if (typeof bounds.NextUser=="undefined" && typeof bounds.PrevUser=="undefined")
							return "";
						var txt = "registered ";
						if (typeof bounds.PrevUser!="undefined")
						{
							txt += "after user "+(+bounds.PrevUser.ID)+" at "+timeToString(new Date(bounds.PrevUser.RegisterTime*1000));
							if (typeof bounds.NextUser!="undefined")
								txt += ", \n";
						}
						if (typeof bounds.NextUser!="undefined")
						{
							txt += "before user "+(+bounds.NextUser.ID)+" at "+timeToString(new Date(bounds.NextUser.RegisterTime*1000));
						}
						return txt;
					}

					if (typeof data.User!="undefined")
					{
						if (typeof data.User.RegisterTime!="undefined")
						{
							txt = timeToString(new Date(data.User.RegisterTime*1000));
						}
						else if (typeof data.User.RegisterTimeApprox!="undefined")
						{
							txt = "approx "+timeToString(new Date(data.User.RegisterTimeApprox*1000));
							if (typeof data.User.RegisterTimeBounds!="undefined")
							{
								regRow.find("span").tooltip({title:"Interpolated time - "+boundsText(data.User.RegisterTimeBounds), placement:"top"});
							}
						}
						else if (typeof data.User.RegisterTimeBounds!="undefined")
						{
							txt = "unknown ("+boundsText(data.User.RegisterTimeBounds)+")";
						}
					}
					regRow.find("span").text(txt);
				}, "json");
			}
		});
	}
	if (window.location.pathname == "/Browse/View.html")!=-1)
	{
		$(document).ready(function(){
			if (typeof d3=="undefined")
				$.ajax({dataType: "script", cache: true, url: "/Themes/Next/Javascript/D3.js"});
			setTimeout(function(){
				window.showSaveVotes = tptenhance.saves.showVotes;

				$(".Pagination a").die('click');
				tptenhance.comments.commentView = new tptenhance.comments.CommentView($(".Subpage"));

				$("span.Tag").die('click');

				var newDetailsPane;
				if ($("#VoteGraph").length)
					newDetailsPane = $('<div class="SaveDetails"></div>').insertAfter("#VoteGraph");
				else
					newDetailsPane = $('<div class="SaveDetails"></div>').insertAfter(".SaveDescription");
				var infoTabs = new tptenhance.saves.tabs.Container(newDetailsPane);
				infoTabs.addTab(new tptenhance.saves.tabs.Bumps());
				infoTabs.addTab(new tptenhance.saves.tabs.History());
				infoTabs.addTab(new tptenhance.saves.tabs.Search());
				infoTabs.addTab(new tptenhance.saves.tabs.Details());

				$(".AddComment .OtherF textarea").attr("maxlength", 500);
			},1);
			$(".SaveDetails .Warning").addClass("alert alert-error").css("margin-bottom", "5px");
			tptenhance.makeSaveLinks($(".SaveDescription"));

			var saveVersion = tptenhance.saves.getCurrentHistoryVersion();
			if (saveVersion)
			{
				$(".SaveGamePicture img").attr("src", tptenhance.saves.fullImgUrl(currentSaveID, saveVersion));
				$("#SaveToComputerButton").attr("href", tptenhance.saves.dataUrl(currentSaveID, saveVersion));
				// TODO: fix open link, and make it more obvious that this is an old version of the save
			}
		});
	}
	if (window.location.pathname == "/Browse/Tags.html")
	{
		$(document).ready(function(){
			setTimeout(function(){
				$("span.TagText").die('click');
				$("span.TagText").on('click', function(){
					tptenhance.tags.tagInfoPopup.showAll($(this), $(this).text());
				});
				tptenhance.tags.attachHandlers($("div.Tag"));
			},1);
		});
	}
	if (window.location.pathame == "/Discussions/Thread/View.html")
	{
		// Extend LoadForumBlocks to add a click callback to the Unhide post buttons, to fix the site redirecting to the first page of the thread instead of the page with the post when a post is unhidden
		// Also scroll to top/bottom of page when changing to next/previous page in a thread
		tptenhance.oldLoadForumBlocks = window.LoadForumBlocks;
		window.LoadForumBlocks = tptenhance.LoadForumBlocks;
		$(document).ready(function(){
			setTimeout(function(){
				$(".Pagination a").die('click');
				$(".Pagination a").live('click', function(){
					if(!window.history.pushState){
						return true;
					}
					var pageChangeDirection = 0;

					var matchesCurrent = window.location.toString().match(/PageNum=([0-9]+)/);
					var matchesNew = this.href.match(/PageNum=([0-9]+)/);
					if (matchesCurrent && matchesNew)
					{
						if ((+matchesNew[1])<(+matchesCurrent[1]))
							pageChangeDirection = -1;
						else if ((+matchesNew[1])>(+matchesCurrent[1]))
							pageChangeDirection = 1;
					}

					var doScroll = function(){};
					if (pageChangeDirection==-1)
					{
						if ($(window).scrollTop() >= $('.Pagefooter').offset().top-$(window).height())
						{
							var scrolloffset = $(window).scrollTop()-($('.Pagefooter').offset().top-$(window).height());
							doScroll = function(){
								$(window).scrollTop(scrolloffset+$('.Pagefooter').offset().top-$(window).height());
							};
						}
						else
						{
							doScroll = function(){
								$(window).scrollTop($(document.body).height()-$(window).height());
							};
						}
					}
					else if (pageChangeDirection==1 && $(window).scrollTop() > $('.TopicTitle').offset().top)
					{
						doScroll = function(){
							$(window).scrollTop(0);
						};
					}
					doScroll();

					var Link2 = this.href;
					var Link = this.href.replace(/\.html\?/, ".json?Mode=HTML&");
					$("#ActionSpinner").fadeIn("fast");
					$("ul.MessageList").fadeTo(200, 0.5);
					$.get(Link, function(data){
						console.log("page get");
						$("#ActionSpinner").fadeOut("fast");
						$(".Pagination").html(data.Pagination);
						var OLHeight = $('ul.MessageList').height();
						$("ul.MessageList").children().addClass("QueueRemove");
						var newTop;
						if(pageChangeDirection==-1){
							$("ul.MessageList").prepend(data.Posts);
							$("ul.MessageList").css("top", -($('ul.MessageList').height()-OLHeight)+"px");
							newTop = 0;
						} else if (pageChangeDirection===1) {
							$("ul.MessageList").append(data.Posts);
							newTop = (-OLHeight);
						} else if (pageChangeDirection===0) {
							$("ul.MessageList").children(".QueueRemove").remove();
							$("ul.MessageList").append(data.Posts);
							$("ul.MessageList").css({"top": 0});
							$(".MessageListOuter").css({"height": "auto"});
							$("ul.MessageList").fadeTo(500, 1);
						}
						if (pageChangeDirection!==0)
						{
							$(".MessageListOuter").css({"height":(+$("ul.MessageList").height()-OLHeight)+"px"});
							doScroll();
							console.log("scroll done");
							$("ul.MessageList").stop();
							$("ul.MessageList").animate({
								top: newTop
							}, 500);
							setTimeout(function() {
								$("ul.MessageList").children(".QueueRemove").remove();
								$("ul.MessageList").stop();
								$("ul.MessageList").css({"top": 0});
								$(".MessageListOuter").css({"height": "auto"});
								$("ul.MessageList").fadeTo(500, 1);
								console.log("done remove");
							}, 550);
						}
						try
						{
							ProcessMessages();
							LoadForumBlocks();
						}
						catch(e)
						{
							console.log(e);
						}
						if(window.history.pushState){
							window.history.pushState("", "", Link2);
						}
					}, "json").fail(function(){location.reload(true);});
					return false;
				});
			},1);
		});
	}
	if (window.location.pathname == "/Discussions/Thread/HidePost.html")!=-1)
	{
		$(document).ready(function(){
			// To fix the site redirecting to the first page of the thread instead of the page with the post when a post is hidden
			// submit form via Ajax request then redirect to the correct page ourselves
			$('.FullForm').on('submit', function(e){
				e.preventDefault();
				$(this).find(".btn.btn-primary").addClass("disabled").attr("value", "Hiding...");
				var formData = $(this).serialize();
				formData += "&Hide_Hide=Hide+Post";
				$.post($(this).attr('action'), formData, function(){
					window.location = '/Discussions/Thread/View.html?'+(window.location.search.match(/Post=[0-9]+/)[0]);
				});
			});
		});
	}
	if (window.location.pathname == "/Groups/")!=-1)
	{
		$(document).ready(function(){
			$('.ButtonLink').addClass('btn');
			$('.GroupOptions .btn').each(function(){
				var txt = $(this).text();
				if (txt=="New Topic") $(this).addClass('btn-primary');
				if (txt=="Resign") $(this).addClass('btn-danger');
			});
			$('.GroupInfo').append($('.GroupOptions'));
			$('.SubmitF input[type="submit"]').addClass('btn btn-primary');
			if (window.location.pathname == "/Groups/Page/Register.html")!=-1) {
				$('form input[type="submit"]').addClass('btn btn-primary').css('margin', '10px 0');
			}
			if (window.location.pathname == "/Groups/Admin/Members.html")!=-1) {
				$('.MemberActions a.btn').each(function(){
					// Add icons and colours to buttons
					$(this).addClass("btn-mini");
					if ($(this).text()=="Accept")
					{
						$(this).addClass("btn-success").prepend('<i class="icon-ok icon-white"></i> ');
					}
					if ($(this).text()=="Reject")
					{
						$(this).addClass("btn-danger").prepend('<i class="icon-remove icon-white"></i> ');
					}
					if ($(this).text()=="Remove")
					{
						$(this).addClass("btn-danger").html('<i class="icon-remove icon-white"></i>');
					}
				});
				$('.NewMembers a.MemberName').each(function(){
					// User profile link is broken for pending registrations, uses Name=1234 instead of either Name=JohnSmith or ID=1234
					$(this).attr('href', $(this).attr('href').replace(/\?Name=/, "?ID="));
				});
				// Remove join time for pending registrations, since this seems to always be the current time.
				$('.NewMembers .MemberJoined').remove();
			}
			if (window.location.pathname == "/Groups/Admin/MemberRemove.html")!=-1) {
				// Prettier removal confirmation button
				$('.FullForm input[type="submit"]').addClass('btn btn-danger').text('Remove');
			}
		});
	}
	if (window.location.pathname == "/Groups/Thread/")!=-1)
	{
		$(document).ready(function(){
			// WYSIWYG editor
			$("#AddReplyMessage").addClass("EditWYSIWYG");
			tptenhance.wysiwygLoaded = 0;
			var wysiwygPrepare = function()
			{
				tptenhance.wysiwygLoaded++;
				if (tptenhance.wysiwygLoaded>=2)
				{
					WYSIWYG('#AddReplyMessage, textarea[name="Post_Message"], textarea[name="Thread_Message"]');
					window.GetRef = function(Username, PostID){
						$('html, body').animate({scrollTop: $(document).height()}, 200);
						$("#AddReplyMessage.EditPlain").insertAtCaret("@"+Username+"!"+PostID+"\n");
						$("#AddReplyMessage.EditWYSIWYG").tinymce().execCommand('mceInsertContent',false, "<p>@"+Username+"!"+PostID+"</p><p></p>");
					};
					window.GetQuote = function(PostID, Element, Username){
						$('html, body').animate({scrollTop: $(document).height()}, 200);
						$.get("/Groups/Thread/Post.json?Type=Raw&Post="+PostID, function(data){
							if(data.Status==1){
								$("#AddReplyMessage.EditPlain").insertAtCaret("<p><cite>"+Username+"</cite>:</p><blockquote>"+data.Post+"</blockquote>");
								$("#AddReplyMessage.EditWYSIWYG").tinymce().execCommand('mceInsertContent',false, "<p><cite>"+Username+"</cite>:</p><blockquote>"+data.Post+"</blockquote><p>&nbsp;</p>");
							} else {
								$("#AddReplyMessage.EditPlain").insertAtCaret("<p><cite>"+Username+"</cite>:</p><blockquote>"+$("#"+Element).text()+"</blockquote>");
								$("#AddReplyMessage.EditWYSIWYG").tinymce().execCommand('mceInsertContent',false, "<p><cite>"+Username+"</cite>:</p><blockquote>"+$("#"+Element).text()+"</blockquote><p>&nbsp;</p>");
							}
						});
					};
				}
			};
			$.getScript("/Applications/Application.Discussions/Javascript/jQuery.TinyMCE.js", wysiwygPrepare);
			$.getScript("/Applications/Application.Discussions/Javascript/WYSIWYG.js", wysiwygPrepare);

			$('.Pagefooter .Warning').addClass("alert alert-warning");
			$('form input[type="submit"]').addClass('btn');
			$('form input[type="submit"]').each(function(){
				var txt = $(this).attr('value');
				if (txt=="Stick" || txt=="Unstick") $(this).addClass('btn-info');
				if (txt=="Delete Thread") $(this).addClass('btn-danger');
				if (txt=="Save") $(this).addClass('btn-primary');
				if (txt=="Post") $(this).addClass('btn-primary').css('margin-top', '5px');
			});
			$('.Pageheader').prepend('<a href="/Groups/Page/Groups.html">Groups</a> &raquo;');

			var fixGroupPosts = function()
			{
				$('.ButtonLink').addClass('btn');
				$('.Banned .Comment .Information').addClass("alert alert-warning").html("This post is hidden because the user is banned");
				$('.Member .Comment .Information, .Administrator .Comment .Information, .Moderator .Comment .Information').addClass("alert alert-warning").html("This post has been hidden");
				$('.Comment .Actions .ButtonLink').addClass('btn-mini');
				$('.Comment .Actions').removeClass('Actions').addClass('Actions2');// to stop groups CSS on site from overriding bootstrap button styles
				$('.Post.Moderator').each(function(){
					if ($(this).find(".Meta .UserTitle").text()=="Member")
						$(this).find(".Meta .UserTitle").text("Moderator");
				});
				$(".HidePostButton").off('click');
				$(".HidePostButton").on('click', function(){
					var currentPost = $(this).parents(".Post");
					var messageId = currentPost.find(".Message").attr("id");
					var url = $(this).attr('href').replace(/\.html/, ".json");
					$.post(url, "Hide_Hide=Hide").success(function(){
						$.get(location, function(data){
							var newPost = $(data).find(".Message#"+messageId).parents(".Post");
							currentPost.replaceWith(newPost);
							fixGroupPosts();
						});
					});
					$(this).text('Hiding...').addClass("disabled");
					return false;
				});
				$(".UnhidePostButton").off('click');
				$(".UnhidePostButton").on('click', function(){
					var actionButton = $(this);
					$.get(actionButton.attr("href"), function(){
						$.get(location, function(data){
							var currentPost = actionButton.parents(".Post");
							var messageId = currentPost.find(".Message").attr("id");
							var newPost = $(data).find(".Message#"+messageId).parents(".Post");
							currentPost.replaceWith(newPost);
							fixGroupPosts();
						});
					});
					$(this).text('Unhiding...').addClass("disabled");
					return false;
				});
				var groupId = tptenhance.groups.currentGroupId();
				$(".Post a").each(function(){
					if ($(this).text()!="(View Post)") return;
					var matches = $(this).attr('href').match(/\/Discussions\/Thread\/View.html\?Post=([0-9]+)$/);
					if (matches)
					{
						$(this).attr('href', "/Groups/Thread/View.html?Post="+encodeURIComponent(matches[1])+"&Group="+encodeURIComponent(groupId));
					}
				});
				var threadPageNum = $(".Pagination .active a").first().attr("href").match(/PageNum=([0-9]+)/)[1];
				var threadId = $(".Pagination .active a").first().attr("href").match(/Thread=([0-9]+)/)[1];
				// Fix permalinks, since the default ones don't link to the correct page
				$(".Post .Permalink a").each(function(){
					var matches = $(this).attr("href").match(/Post=([0-9]+)/);
					if (matches)
					{
						var postId = matches[1];
						$(this).attr("href", "/Groups/Thread/View.html?"+
							"Thread="+encodeURIComponent(threadId)+
							"&Group="+encodeURIComponent(groupId)+
							"&PageNum="+encodeURIComponent(threadPageNum)+
							"#Message="+encodeURIComponent(postId)
						);
					}
				});
			};
			fixGroupPosts();
		});
	}
	if (window.location.pathname.toString().indexOf("/Browse.html")
	{
		$(document).ready(function(){
			var user = tptenhance.getPageUsername();
			if (user!==null)
			{
				var header = $('<div class="Pageheader Submenu"><h1 class="SubmenuTitle"></h1><ul class="nav nav-tabs"></ul></div>');
				header.find("h1").text(user);
				var headerNav = header.find("ul");

				function newTab(container, text, url)
				{
					var tab = $('<li class="item"><a></a></li>').appendTo(container);
					tab.find("a").text(text).attr("href", url);
					return tab;
				}
				newTab(headerNav, "Profile", tptenhance.users.profileUrlByName(user));
				newTab(headerNav, "Saves", tptenhance.users.savesUrlByName(user));
				if (user===tptenhance.getAuthedUser())
					headerNav.append('<li class="item"><a href="/Groups/Page/Index.html">Groups</a></li><li class="item"><a href="/Profile.html">Edit</a></li>');
				$('#PageBrowse').prepend(header);
			}
		});
	}

	// Correct repository username for github button, so that number of stars displays correctly
	if ($(".social-github iframe").length)
		$(".social-github iframe").attr("src", $(".social-github iframe").attr("src").replace("FacialTurd", "simtr"));
};
tptenhance_init();
});

function addCss(cssString)
{
	var head = document.getElementsByTagName('head')[0];
	if (!head) return;
	var newCss = document.createElement('style');
	newCss.type = "text/css";
	newCss.innerHTML = cssString;
	head.appendChild(newCss);
}
addCss('.Tag .DelButton, .Tag .UnDelButton { top:auto; background-color:transparent; }\
.Tag .LoadingIcon { position:absolute; right:3px; line-height:20px; }\
.popover-inner { width:380px; }\
.VoteUpIcon { background-color:#0C0; border:1px solid #080; }\
.VoteDownIcon { background-color:#C00; border:1px solid #800; }\
.VoteUpIcon, .VoteDownIcon { margin-top:2px; }\
.DupVotes { margin-top: 10px; }\
.DupVotes h4 { text-align:center; margin:3px 0; }\
.DupVotes table { margin:0 auto; border:1px solid #CCC; }\
.DupVotes td, .DupVotes th { padding:3px 6px; }\
.DupVotes th { text-align:left; background-color:#DDD; }\
.DupVotes tr:nth-child(even) { background-color:#FFF; }\
.DupVotes tr:nth-child(odd) { background-color:#EFEFEF; }\
.DupVotes tr:hover, .DupVotes tr.highlight:hover { background-color:#E0E0FF; }\
.DupVotes tr.highlight .IPAddress { background-color:#FFF !important; }\
.DupVotes tr.highlight { background-color:#C8C8FF; }\
.DupVotes .Date { font-family:monospace; }\
.SignsTbl { margin:0 auto; border:1px solid #CCC; }\
.SignsTbl td, .SignsTbl th { padding:3px 6px; border:1px solid #CCC}\
.SignsTbl th { text-align:left; background-color:#DDD; }\
.SignsTbl th:nth-child(2) { min-width:200px; }\
.SignsTbl td:nth-child(2), .SignsTbl td:nth-child(3) { text-align:left; }\
.SignsTbl tr:nth-child(even) { background-color:#FFF; }\
.SignsTbl tr:nth-child(odd) { background-color:#F9F9F9; }\
.SignsTbl tr:hover, .DupVotes tr.highlight:hover { background-color:#E0E0FF; }\
.SignsTbl tr.DupSign td:nth-child(1) { color:#C00; font-weight:bold; }\
.SignLinkSaveThumb { display:block; }\
.SignLinkSaveThumb img { clear:left; width:102px; height:64px; }\
.Post { word-wrap: break-word; }\
.savegame { width:153px; }\
.savegame .caption a { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\
.TagInfo { clear:right; }\
.TagInfo .label { margin-bottom:1px; }\
.SaveDetails ul.MessageList li.Post { border-top:1px solid #DCDCDC; border-bottom:0 none; }\
.new-topic-button .btn { white-space:nowrap; }\
.tag-removedcurrent { text-decoration: line-through; background-color:#ffd; }\
.tag-removedall { text-decoration: line-through; background-color:#fed; }\
.progresstitle { font-size:10px; margin-bottom:4px; }\
.TagsTable .TagActions a, .TagsTable .TagActions > span { margin:0 5px; min-width:50px; display:inline-block; text-align:center; }\
.TagsTable .TagActions a.hide { display:none; }\
.TagsTable { margin:0 auto; border:1px solid #CCC; }\
.TagsTable td, .TagsTable th { padding:3px 6px; border:1px solid #CCC}\
.TagsTable th { text-align:left; background-color:#DDD; }\
.TagsTable th:nth-child(3) { text-align:center; }\
.TagsTable th:nth-child(3) a { cursor:pointer; }\
.TagsTable td:nth-child(1) { min-width:100px; }\
.TagsTable td:nth-child(2) { min-width:100px; }\
.ElemCountChart { display:flex; flex-direction:row; margin:10px 0; border:1px solid #CCC; }\
.ElemCountChart .bar { flex:1 1 auto; min-width:2px; box-sizing:border-box; overflow:hidden; text-align:center; }\
.ElemCountChart .barlabel { padding:2px; }\
.SaveDetails-notifyOld { text-align:center; margin:10px 0;}\
.TagInfo .Tag-LinkDisable, .TagInfo .Tag-LinkEnable { margin:0 10px; }\
.TagPopup-showOthers { text-align:right; clear:right; }\
.Post.Deleting { }\
.Post.Deleted { opacity:0.7;text-decoration:line-through; }\
.SaveGamePicture { position:relative; }\
.SaveGamePicture .SaveSign { position:absolute; display:block; overflow:hidden; font-size:9px; line-height:12px;color:rgba(255,255,255,0); text-align:center; }\
.SaveGamePicture .SaveSign:hover { background-color:#000; color:#FFF; }\
.SaveGamePicture .SaveSign.SignLink:hover { color:#00BFFF; background-color:#FFF; }\
.SaveDetails .thumbnails { margin:0; }\
#PageBrowse .Submenu h1 { float:right; font-size:20px; line-height: 34px; margin-right: 5px; }');
if (window.location.pathname.indexOf("/Groups/")!==-1)
{
	addCss('.TopicList li .TopicPages { width:auto; }\
.TopicList .Pagination li { padding:0; border-bottom: 1px solid #DCDCDC; line-height: normal; }\
.TopicList .Pagination a { font-size: 9px !important; line-height: 16px; min-width: 10px !important; padding: 0 3px; text-align: center; border-width: 1px 1px 1px 0 !important; }\
.TopicList .Pagination li:first-child a { border-left-width: 1px !important; }\
.TopicList .pagination { height: 16px; margin: 0; padding: 3px; }\
.contents h1 { font-size: 20px; }\
.GroupOptions { position:relative; top:0; right:0; float:right; clear:right;}\
.GroupDescription { margin:0; }\
.MessageListOuter { margin-bottom:7px; }\
.PostFForm #AddReplyMessage { width:100%; margin:0; padding:0; }\
.PostFForm, .ModerationFooter { margin:0; }\
.container { background: none repeat scroll 0 0 rgba(0, 0, 0, 0); border: medium none; padding: 0; }\
.Page { border: 1px solid #CDD2D7; }\
.Moderator .Author, .Administrator .Author { background-image: url("/Themes/Next/Design/Images/Shield.png"); }\
.main-menu li a[href="/Groups.html"] { display: none; }\
ul.MessageList li.Post div.Meta span.Actions2 { float:right; }\
ul.MessageList li.Post div.Meta span.Actions2 a { visibility:hidden; }\
ul.MessageList li.Post:hover div.Meta span.Actions2 a { visibility:visible; }\
.CurrentMembers .MemberActions select[name="Elevation"] { width:100px; }\
.MemberColumn { width:360px; }');
}

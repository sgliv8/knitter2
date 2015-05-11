'use strict'

console.log(' item mirror on page script loaded for tab: %s', chrome.runtime.id);	

chrome.runtime.onMessage.addListener(function(msg, sender, responseCallback){
	window.addEventListener('mouseup',updateSelectedText);
	console.log('sender %o', sender);
	execute(msg);
});

function responseCallback(){
	return "scriptjs received message";
}

function execute(msg) {
	console.log('msg: %o passed to controller',msg);
	if(msg.action === 'toggleSidebar') {
		toggleSidebar();
		updateSelectedText();
	} else if (msg.action === 'searchResult') {
		addFolderIcon(msg);
	} else if (msg.action === 'saved') {
		toggleSidebar();
		// var alert = document.createElement('div');
		// alert.id = "alert";
		// alert.setAttribute('class', 'alert alert-info');
		// alert.style.position = "fixed";
		// alert.style.bottom = "30%";
		// alert.style.zIndex = "9999999";
		// alert.style.background = "#428bca";
		// alert.style.left = "30%";
		// alert.style.width = "300px";
		// alert.style.height = "150px;"
		// // alert.style.display = "none";
		// alert.setAttribute('data-dismiss', 'alert');
		// alert.setAttribute('aria-hidden', 'true');
		// alert.innerHTML = "Text Saved.";
		// document.body.appendChild(alert);
		// setTimeout(function(){
		// 	alert.style.display = "none";
		// }, 1500);
	}
}

function addFolderIcon(msg) {
	var newTextList = [];
	var selectedTextWindow = document.getElementById("selectedTextWindow");
	if(!selectedTextWindow) {throw "missing selectedTextWindow";}

	console.log('msg.message: %o', msg.message);
	var folderNames = msg.message;

	//var folderNames = createFolderNames(msg.message);
	console.log('folderNames: %o', folderNames);
	var textList = selectedTextWindow.innerHTML.split(' ');
	console.log('textList: %o', textList);
	selectedTextWindow.innerHTML = "";
	for(var key in textList) {
		var text = textList[key];
		console.log('text: %o', text);
		if(folderNames[text]) {

			if (folderNames[text].length == 1){
				text = "<b style='padding: 0 4px;'>" + text+ "</b>";
				selectedTextWindow.appendChild(createSingleIcon(folderNames[text]));
			} else {
				text = "<b style='padding: 0 4px;'>" + text+ "</b>";
				selectedTextWindow.appendChild(createMultipleIcon(folderNames[text]));
			}
			
		}
		newTextList.push(text);
		selectedTextWindow.innerHTML += text +" ";
	}	

}

function createFolderNames(messages) {
	var folderNames = [];
	for(var key in messages) {
		var folderName = messages[key].split("/").pop();
		//console.log(folderName);
		//create an array where key is the matched foldernames, value is the folder paths
		folderNames[folderName] = messages[key];
		console.log(folderNames);
	}
	return folderNames;
}

function createSingleIcon(path) {
	var icon = document.createElement('img');
	var imgURL = chrome.extension.getURL("images/folder.png")
	icon.src = imgURL;
	icon.id = "folderIcon";
	icon.title = path;
	return icon;
}

function createMultipleIcon(path) {
	var icon = document.createElement('img');
	var imgURL = chrome.extension.getURL("images/folders.png")
	icon.src = imgURL;
	icon.id = "foldersIcon";
	icon.title = path;
	//icon.setAttribute('data-toggle', "modal");
	//icon.setAttribute('data-target', ".multipleIcon");

	icon.onclick = function(){
		wrapperDiv = document.createElement("div");
		wrapperDiv.setAttribute("style","position: absolute; left: 0px; top: 0px; background-color: rgb(255, 255, 255); opacity: 0.5; z-index: 2000; height: 1083px; width: 100%;");

		iframeElement = document.createElement("iframe");
		iframeElement.setAttribute("style","width: 100%; height: 100%;");

		wrapperDiv.appendChild(iframeElement);

		modalDialogParentDiv = document.createElement("div");
		modalDialogParentDiv.setAttribute("style","position: absolute; width: 350px; border: 1px solid rgb(51, 102, 153); padding: 10px; background-color: rgb(255, 255, 255); z-index: 2001; overflow: auto; text-align: center; top: 149px; left: 497px;");

		modalDialogSiblingDiv = document.createElement("div");

		modalDialogTextDiv = document.createElement("div"); 
		modalDialogTextDiv.setAttribute("style" , "text-align:center");

		modalDialogTextSpan = document.createElement("span"); 
		modalDialogText = document.createElement("strong"); 
		modalDialogText.innerHTML = "Processing...  Please Wait.";

		modalDialogTextSpan.appendChild(modalDialogText);
		modalDialogTextDiv.appendChild(modalDialogTextSpan);
		modalDialogTextDiv.appendChild(breakElement);
		modalDialogTextDiv.appendChild(breakElement);
		modalDialogTextDiv.appendChild(imageElement);

		modalDialogSiblingDiv.appendChild(modalDialogTextDiv);
		modalDialogParentDiv.appendChild(modalDialogSiblingDiv);

		document.body.appendChild(wrapperDiv);
		document.body.appendChild(modalDialogParentDiv);
	}

	return icon;
}

function toggleSidebar () {
	console.log('toggle sidebar');
	var sidebarHTML = getItemMirrorSidebar();
	if(sidebarHTML.style.display === 'none') {
		sidebarHTML.style.display = 'inline';

	} else {
		sidebarHTML.style.display = 'none';
		sidebarHTML.style.bottom = "-30%";
		var v = 30;
		var slide = setInterval(function(){
			if(sidebarHTML.style.bottom != "0%"){
			sidebarHTML.style.bottom = "-" + v+"%";
			v-=1;
			}else{
				clearInterval(slide);
			}
		

		}, 10);
	}
}

function updateSelectedText() {
	var selectedTextWindow = document.getElementById('selectedTextWindow');
	var selectedText = getSelectedText();
	if(selectedTextWindow && selectedText) {
		searchDropbox(selectedText);
		selectedTextWindow.innerText = selectedText;
	}
}

//passed a message back to background.js
function searchDropbox(selectedText) {
	var msg = {
		'action': 'search',
		'message': selectedText
	};
	console.log('sending message %o', msg);
	chrome.runtime.sendMessage(msg, function(response){
		console.log("%o", response);
	});
}


function getItemMirrorSidebar () {
	var sidebarHTML = document.getElementById('itemMirrorSidebar')
	if(sidebarHTML === null){
		sidebarHTML = createItemMirrorSidebar();
		console.log('creating new item mirror sidebar');
		document.body.appendChild(sidebarHTML);
		var v = 30;
		var slide = setInterval(function(){
			if(sidebarHTML.style.bottom != "0%"){
			sidebarHTML.style.bottom = "-" + v+"%";
			v-=1;
			}else{
				clearInterval(slide);
			}
		

		}, 10);
	} 
	return sidebarHTML;
}

function createItemMirrorSidebar() {
	var sidebarHTML = createSiderbarFrame();
	createSiderbarContent(sidebarHTML);
	return sidebarHTML;
}

function createSiderbarFrame() {
	var sidebarHTML = document.createElement('div');
	sidebarHTML.id = "itemMirrorSidebar"
	sidebarHTML.style.position = "fixed";
	sidebarHTML.style.bottom = "0";
	sidebarHTML.style.right = "10px";
	sidebarHTML.style.width = "350px";
	sidebarHTML.style.border = "1px solid black";
	sidebarHTML.style.background = "#fff";
	//sidebarHTML.style.opacity = "0.97";
	//sidebarHTML.style.zIndex = "999999";
	sidebarHTML.style.borderRadius="10px"
	sidebarHTML.style.display = 'none';
	return sidebarHTML;
}

function createSiderbarContent(sidebarHTML) {
	var sidebarContainer = document.createElement('div');
	sidebarContainer.setAttribute("class", "header");

	var selectedTextWindow = document.createElement('div');
	selectedTextWindow.id = "selectedTextWindow";
	selectedTextWindow.setAttribute("contentEditable", "True");

	// var okButton = document.createElement('button');
	// okButton.innerText = "Save";
	// okButton.id = "okButton";
	// cancel button
	// var cancelButton = document.createElement('button');       
	// cancelButton.innerText="close";
	// cancelButton.id = "closeButton";

	var okButton = document.createElement('img');
	var imgURL = chrome.extension.getURL("images/check.png")
	okButton.src = imgURL;
	okButton.id = "okButton";
	okButton.setAttribute("class", "pull-right");

	var cancelButton = document.createElement('img');
	var imgURL = chrome.extension.getURL("images/close.png")
	cancelButton.src = imgURL;
	cancelButton.id = "closeButton";
	cancelButton.setAttribute("class", "pull-right");
	sidebarContainer.appendChild(cancelButton);
	sidebarContainer.appendChild(okButton);
	

	okButton.onclick = function(){
		// get the folder path
		var path = [];
		var newSelectedText = document.getElementById("selectedTextWindow").innerText;
		var folderPaths = document.getElementById("selectedTextWindow").getElementsByTagName("img");
		for(var i=0; i<folderPaths.length; i++) {
			if(folderPaths[i].title){
			path[i] = folderPaths[i].title;}
		}

		if(path.length == 0 && newSelectedText != "") {
			path.push('/2014-06, HTML5 MSIM IS, shared/final week demonstration/Notes');
		}
		console.log("folderPaths: " + path);
		var msg = {
			'action': 'save',
			'paths': path,
			'selectedText': newSelectedText
		};

		console.log('sending folderNames %o', msg);
		chrome.runtime.sendMessage(msg, function(response){
			console.log("%o", response);
		});
	};
	cancelButton.onclick = function(){
		toggleSidebar();
	}; 

	sidebarHTML.appendChild(sidebarContainer);
	sidebarHTML.appendChild(selectedTextWindow);
	//sidebarHTML.appendChild(okButton);
	//sidebarHTML.appendChild(cancelButton);

}

function getSelectedText(msg) {
	var selection = window.getSelection();
	if(selection.rangeCount > 0) {
	 	var range = selection.getRangeAt(0);
	   	if (range) {
	    	var div = document.createElement('div');
	    	div.appendChild(range.cloneContents());
		 	return div.innerText;
		}
	}	
}




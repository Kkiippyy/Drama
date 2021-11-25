makeBold = function (form) {
	addFormat(form, '**')
}

makeItalics = function (form) {
	addFormat(form, '*')
}

makeQuote = function (form) {
	addFormat(form, '>', false)
}

/***
 * Takes a form and does one of three things:
 *  * If no text is selected, insert the format char and puts the cursor in the expected place
 *  * If the format is not applied to the selection, applies it
 *  * If the format was already applied, it removes it.
 *  Also refocus the form after inserting the formatting chars
 *
 * @param {string} form The destination form id to do this transformation on
 * @param {string} format The tag to add, for example '*' for italics
 * @param {boolean} [repeatOnEnd=true] Flag that says that the {@link format} should be repeated at the end.
 */
function addFormat(form, format, repeatOnEnd = true) {

	function escape(string) {
		return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
	}

	const text = document.getElementById(form);
	const startIndex = text.selectionStart;
	const endIndex = text.selectionEnd;
	const selectedText = text.value.substring(startIndex, endIndex);

	let newCursorPos = endIndex
	let replaceStr = selectedText

	if (selectedText.includes(format)) {
		replaceStr = selectedText.replace(new RegExp(escape(format), "g"), '');
		newCursorPos = endIndex - (selectedText.length - replaceStr.length);
	}

	else if (selectedText.length === 0) {
		replaceStr = format + selectedText + (repeatOnEnd ? format : "");
		newCursorPos = startIndex + format.length;
	}

	else {
		replaceStr = format + selectedText + (repeatOnEnd ? format : "");
		newCursorPos = endIndex + format.length * (repeatOnEnd ? 2 : 1);
	}

	text.value = text.value.substring(0, startIndex) + replaceStr + text.value.substring(endIndex);
	text.selectionStart = newCursorPos
	text.selectionEnd = newCursorPos

	text.focus()
}

function charLimit(form, text) {

	var input = document.getElementById(form);

	var text = document.getElementById(text);

	var length = input.value.length;

	var maxLength = input.getAttribute("maxlength");

	if (length >= maxLength) {
		text.style.color = "#E53E3E";
	}
	else if (length >= maxLength * .72){
		text.style.color = "#FFC107";
	}
	else {
		text.style.color = "#A0AEC0";
	}

	text.innerText = maxLength - length;

}

hide_image=function(){
	x=document.getElementById('image-upload-block');
	url=document.getElementById('post-URL').value;
	if (url.length>=1){
		x.classList.add('d-none');
	}
	else {
		x.classList.remove('d-none');
	}
}

function autoSuggestTitle()	{

	var urlField = document.getElementById("post-URL");

	var titleField = document.getElementById("post-title");

	var isValidURL = urlField.checkValidity();

	if (isValidURL && urlField.value.length > 0 && titleField.value === "") {

		var x = new XMLHttpRequest();
		x.withCredentials=true;
		x.onreadystatechange = function() {
			if (x.readyState == 4 && x.status == 200) {

				title=JSON.parse(x.responseText)["title"];
				titleField.value=title;

				checkForRequired()
			}
		}
		x.open('get','/submit/title?url=' + urlField.value);
		x.send(null);

	};

};

function checkForRequired() {

	var title = document.getElementById("post-title");

	var url = document.getElementById("post-URL");

	var text = document.getElementById("post-text");

	var button = document.getElementById("create_button");

	var image = document.getElementById("file-upload");

	if (url.value.length > 0 || image.value.length > 0) {
		text.required = false;
		url.required=false;
	} else if (text.value.length > 0 || image.value.length > 0) {
		url.required = false;
	} else {
		text.required = true;
		url.required = true;
	}

	var isValidTitle = title.checkValidity();

	var isValidURL = url.checkValidity();

	var isValidText = text.checkValidity();

	if (isValidTitle && (isValidURL || image.value.length>0)) {
		button.disabled = false;
	} else if (isValidTitle && isValidText) {
		button.disabled = false;
	} else {
		button.disabled = true;
	}
}


function markdown() {
	var input = document.getElementById('post-text').value;

	var emojis = Array.from(input.matchAll(/:(.{1,30}?):/gi))
	if(emojis != null){
		for(i = 0; i < emojis.length; i++){
			var emoji = emojis[i][0]
			var remoji = emoji.replace(/:/g,'');
			if (remoji.startsWith("!"))
			{
				input = input.replace(emoji, "<img height=30 src='/assets/images/emojis/" + remoji.substring(1) + ".webp' class='mirrored'>")
			} else {
				input = input.replace(emoji, "<img height=30 src='/assets/images/emojis/" + remoji + ".webp'>")
			}

		}
	}

	var options = Array.from(input.matchAll(/\s*\$\$([^\$\n]+)\$\$\s*/gi))
	if(options != null){
		for(i = 0; i < options.length; i++){
			var option = options[i][0];
			var option2 = option.replace(/\$\$/g, '').replace(/\n/g, '')
			input = input.replace(option, '');
			input += '<div class="custom-control"><input type="checkbox" class="custom-control-input" id="' + option2 + '"><label class="custom-control-label" for="' + option2 + '">' + option2 + ' - <a>0 votes</a></label></div>';
		}
	}

	document.getElementById('preview').innerHTML = marked(input)
}

document.onpaste = function(event) {
	f=document.getElementById('file-upload');
	files = event.clipboardData.files
	filename = files[0].name.toLowerCase()
	if (filename.endsWith(".jpg") || filename.endsWith(".jpeg") || filename.endsWith(".png") || filename.endsWith(".webp") || filename.endsWith(".gif"))
	{
		f.files = files;
		document.getElementById('filename-show').textContent = filename;
		document.getElementById('urlblock').classList.add('d-none');
		var fileReader = new FileReader();
		fileReader.readAsDataURL(f.files[0]);
		fileReader.addEventListener("load", function () {document.getElementById('image-preview').setAttribute('src', this.result);});  
		document.getElementById('file-upload').setAttribute('required', 'false');
		checkForRequired();
	}
}

document.getElementById('file-upload').addEventListener('change', function(){
	f=document.getElementById('file-upload');
	document.getElementById('urlblock').classList.add('d-none');
	document.getElementById('filename-show').textContent = document.getElementById('file-upload').files[0].name;
	filename = f.files[0].name.toLowerCase()
	if (filename.endsWith(".jpg") || filename.endsWith(".jpeg") || filename.endsWith(".png") || filename.endsWith(".webp") || filename.endsWith(".webp"))
	{
		var fileReader = new FileReader();
		fileReader.readAsDataURL(f.files[0]);
		fileReader.addEventListener("load", function () {document.getElementById('image-preview').setAttribute('src', this.result);});  
		checkForRequired();
	}
})
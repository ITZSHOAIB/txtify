//Initialization...
let file;
let selectedCrop = false;
let mousePosStart, mousePosEnd;
const spinnerDiv = document.querySelector(".spinner");
const fileInput = document.querySelector("#file-1");
const languageSelector = document.querySelector("#langsel");
const selectedImage = document.querySelector('#selected-image');
const resultText = document.querySelector('.result-area');
const resultSection = document.querySelector('.result-div');
const fileSpan = document.querySelector('.file-span');
const txtifyBtn = document.querySelector('.txtifyBtn');
const displayImgSection = document.querySelector('.img-display'); 
const canvas = document.querySelector('#imgCanvas');
const ctx = canvas.getContext("2d");
const hiddenCanvas = document.querySelector('#hiddenCanvas');
const hiddenCtx = hiddenCanvas.getContext("2d");

//click on file input when clicked on Span
fileSpan.addEventListener("click", () => {
	fileInput.click();
});

//If not selected image rect...
const initMousePos = () => {
	mousePosStart = {x: 0, y: 0};
	mousePosEnd = {x: canvas.width, y: canvas.height};
}


//on-upload image...
fileInput.addEventListener('change', (event) => {
	if (!fileInput.files) {
		return null;
	}
	let arr = fileInput.value.split('.');
	let fileExt = arr[arr.length - 1];
	if(fileExt != "png" && fileExt != "jpg" && fileExt != "jpeg"){
		alert("We only support png, jpg , jpeg FILES.");
		return null;
	}
	file = event.target.files[0];
	displayImgSection.style.display = "flex";
	canvas.style.display = "block";
	//Draw image...
	drawOnUpload();
    drawRect();
});


// Prevent scrolling when touching the canvas
document.body.addEventListener("touchmove", (event) => {
  if (event.target == canvas) {
    event.preventDefault();
  }
}, { passive:false });


//Draw the uploaded original image on Canvas...
const drawOnUpload = () => {
	drawImageOnCanvas(true);
}
const drawImageOnCanvas = (flag) => {
	let reader = new FileReader();
	reader.onload = function(event){
        let img = new Image();
        img.onload = function(){
        	let tempWidth, tempHeight
        	if(img.width > window.innerWidth/1.25){
        		tempWidth = window.innerWidth/1.25;
    			tempHeight = (img.height/img.width) * tempWidth;
        	}else{
        		tempWidth = img.width;
    			tempHeight = img.height;
        	}
    		canvas.width = tempWidth;
        	canvas.height = tempHeight;
        	ctx.drawImage(img,0,0,canvas.width,canvas.height);
        	if(flag == true){
        		initMousePos();
        	}
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
}


//------------------ Canvas --------------------
//Gives the relative position of the Canvas...
//Calculating Mouse position...
const getMousePos = (canvas, event) => {
	let rct = canvas.getBoundingClientRect();
	return{
		x: event.clientX-rct.left,
		y: event.clientY-rct.top
	};
}
//Get Starting touch position..
const getTouchPos = (canvas, event) => {
  	var rect = canvas.getBoundingClientRect();
	return {
		x: event.touches[0].clientX - rect.left,
		y: event.touches[0].clientY - rect.top
	};
}
//Get Changed touch position..
const getChangedTouchPos = (canvas, event) => {
  	var rect = canvas.getBoundingClientRect();
	return {
		x: event.changedTouches[0].clientX - rect.left,
		y: event.changedTouches[0].clientY - rect.top
	};
}

//Detect touch device...
const is_touch_enabled = () => { 
return ( 'ontouchstart' in window ) ||  
	( navigator.maxTouchPoints > 0 ) || 
	( navigator.msMaxTouchPoints > 0 ); 
} 

//Draw Rectangle Event Fuctions-------
function rectEventDown(event){
	ctx.beginPath();
}

function rectEventUp(event){
	ctx.rect(mousePosStart.x, mousePosStart.y, mousePosEnd.x-mousePosStart.x, mousePosEnd.y-mousePosStart.y);
	ctx.lineWidth = 3;
	ctx.strokeStyle = 'yellow';
	ctx.stroke();
}	

//Draw rectangle...
function drawRect(){
	canvas.addEventListener('mousedown', (event) => {
		selectedCrop = true;
		drawImageOnCanvas(false);
		if(!is_touch_enabled()){
			mousePosStart = getMousePos(canvas, event);
		}
		rectEventDown(event);
	});
	canvas.addEventListener('mouseup', (event)=>{
		if(!is_touch_enabled()){
			mousePosEnd = getMousePos(canvas, event);
		}
		if(mousePosStart.x == mousePosEnd.x && mousePosStart.y == mousePosEnd.y){
			selectedCrop = false;
			drawImageOnCanvas(true);
		}
		rectEventUp(event);
	});
	if(is_touch_enabled()){
		canvas.addEventListener('touchstart', (event)=>{
			drawImageOnCanvas();
			mousePosStart = getTouchPos(canvas, event);
			let mouseEvent = new MouseEvent("mousedown");
			canvas.dispatchEvent(mouseEvent);
		});
		canvas.addEventListener("touchend", (event) =>{
			mousePosEnd = getChangedTouchPos(canvas, event);
			let mouseEvent = new MouseEvent("mouseup");
			canvas.dispatchEvent(mouseEvent);
		});
	}
}

//Converting Image Url into Image File Object...
const convertImgLinkToFileObj = (link) => {
	let byteString = atob(link.split(',')[1]);
	let ab = new ArrayBuffer(byteString.length);
	let ia = new Uint8Array(ab);
	for (var i = 0; i < byteString.length; i++) {
	    ia[i] = byteString.charCodeAt(i);
	}
	let blob = new Blob([ia], { type: 'image/png' });
	let file2 = new File([blob], "image.png");
	return file2;
}

//Let's textify the cropped area...
txtifyBtn.addEventListener("click", () => {
	if(file == null || file == undefined){
		alert("Please upload an image...");
		return;
	}
	spinnerDiv.style.display = "block";
	resultSection.style.display = 'none';
	if(selectedCrop == true){
		hiddenCanvas.width = mousePosEnd.x-mousePosStart.x-4;
		hiddenCanvas.height = mousePosEnd.y-mousePosStart.y-4;
		hiddenCtx.drawImage(
		    canvas,
		    mousePosStart.x+2,
		    mousePosStart.y+2,
		    mousePosEnd.x-mousePosStart.x-4,
		    mousePosEnd.y-mousePosStart.y-4, 0, 0,
		    mousePosEnd.x-mousePosStart.x-4,
		    mousePosEnd.y-mousePosStart.y-4
		);
		let croppedImgLink = hiddenCanvas.toDataURL();
		let croppedImgObj = convertImgLinkToFileObj(croppedImgLink);
		imgToText(croppedImgObj);
	}
	else{
		imgToText(file);
	}
});



//Convert image to text using Tesseract...
const imgToText = (file) => {
	Tesseract.recognize(file, languageSelector.value).then(function(data){
    	progressUpdate({ status: 'done', data: data })
	})
}

//Checks, whether done or not...
function progressUpdate(packet){
    if(packet.status == 'done'){
    	spinnerDiv.style.display = "none";
    	resultSection.style.display = 'flex';
        resultText.innerHTML = packet.data.data.text;
    }
}

//Scroll to bottom
function scrollToBottom(){
	window.scrollTo(0, document.querySelector('.main').scrollHeight);
}

//Copy to clipboard...
resultText.addEventListener("click", ()=>{
	let text = resultText.innerHTML;
	copyToClipboard(text);
	resultSection.innerHTML = resultSection.innerHTML + "Text Copied!";
})
//create temporary textarea..
const copyToClipboard = (str) => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};
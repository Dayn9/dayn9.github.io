// Get the modal
var modal = document.getElementById("myModal");
var modalImg = document.getElementById("modal-image");
var captionText = document.getElementById("modal-caption");

// Get the image and insert it inside the modal
var images = document.getElementsByClassName("modal-trigger");

let showModal = function(){
  modal.style.display = "block";
  modalImg.src = this.src;
  captionText.innerHTML = this.alt; // use its "alt" text as a caption
}

let hideModal = function(){
  modal.style.display = "none";
}

for (let i = 0; i < images.length; i++) {
    images[i].onclick = showModal;
}

// Get the <span> element that closes the modal
var closeButton = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
closeButton.onclick = hideModal;
modalImg.onclick = hideModal;
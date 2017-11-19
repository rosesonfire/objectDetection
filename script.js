function refresh() {
  var imgName = document.querySelector("#hello").value,
      sensitivity = document.querySelector("#sensitivity").value;

  document.querySelector("#sensitivityValue").innerHTML = sensitivity;

  var fileExt = imgName.split(".")[1];
  
  document.querySelector("#bye").setAttribute("src", "/" + imgName);
  document.querySelector("#sensitivity").setAttribute("hidden", true);
  
  window.work(imgName, fileExt, sensitivity)
    .then(function(base64Img) {

      var tada = document.querySelector("#tada");

      tada.setAttribute("src", "data:image/" + fileExt + ";base64," + base64Img)
      document.querySelector("#sensitivity").removeAttribute("hidden");

    });
}

document.querySelector("#hello").addEventListener("change", function(event){
  refresh();
});

document.querySelector("#sensitivity").addEventListener("change", function(event){
  refresh();
});
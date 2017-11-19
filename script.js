function refresh() {

  var noImageOption = document.querySelector("#no-image");
  
  if (noImageOption) {
    noImageOption.remove();
  }

  var imgName = document.querySelector("#hello").value,
      sensitivity = document.querySelector("#sensitivity").value,
      tolerance = document.querySelector("#tolerance").value;

  document.querySelector("#sensitivityValue").innerHTML = sensitivity;
  document.querySelector("#toleranceValue").innerHTML = tolerance;

  var fileExt = imgName.split(".")[1];
  
  document.querySelector("#bye").setAttribute("src", "/" + imgName);
  document.querySelectorAll(".critical").forEach(function(criticalElement) {
    criticalElement.setAttribute("hidden", true);
  });
  
  window.work(imgName, fileExt, sensitivity, tolerance)
    .then(function(base64Img) {

      var tada = document.querySelector("#tada");

      tada.setAttribute("src", "data:image/" + fileExt + ";base64," + base64Img)
      document.querySelectorAll(".critical").forEach(function(criticalElement) {
        criticalElement.removeAttribute("hidden");
      });

    });

}

document.querySelector("#hello").addEventListener("change", function(event){
  refresh();
});

document.querySelector("#sensitivity").addEventListener("change", function(event){
  refresh();
});

document.querySelector("#tolerance").addEventListener("change", function(event){
  refresh();
});
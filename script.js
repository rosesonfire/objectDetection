function refresh() {

  var noImageOption = document.querySelector("#no-image");
  
  if (noImageOption) {
    noImageOption.remove();
    document.querySelectorAll("fieldset").forEach(function(fieldset) {
      fieldset.removeAttribute("hidden");
    });
  }

  var imgName = document.querySelector("#hello").value,
      sensitivity = document.querySelector("#sensitivity").value,
      tolerance = document.querySelector("#tolerance").value;

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
  
  var value = this.value;
  
  document.querySelector("#sensitivitySetter").value = value;
  refresh();

});

document.querySelector("#sensitivitySetter").addEventListener("change", function(event){
  
  var value = this.value;

  document.querySelector("#sensitivity").value = value;
  refresh();

});

document.querySelector("#tolerance").addEventListener("change", function(event){
  
  var value = this.value;
  
  document.querySelector("#toleranceSetter").value = value;
  refresh();

});

document.querySelector("#toleranceSetter").addEventListener("change", function(event){
  
  var value = this.value;

  document.querySelector("#tolerance").value = value;
  refresh();

});
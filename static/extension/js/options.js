// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("transform_characters");
  var choice = select.children[select.selectedIndex].value;
  localStorage["transform_characters"] = choice;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var transform_characters = localStorage["transform_characters"];
  if (!transform_characters) {
    return;
  }
  var select = document.getElementById("transform_characters");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == transform_characters) {
      child.selected = "true";
      break;
    }
  }
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
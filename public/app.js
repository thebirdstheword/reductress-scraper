$(document).on("click", "#saveBtn", function() {
  event.preventDefault();
  $(this)
    .attr("disabled", true)
    .html("<em>Saved!</em>");
  $.ajax({
    type: "POST",
    url: "/saving",
    data: {
      URL: $(this)
        .siblings("a")
        .attr("href")
        .trim()
    }
  }).done(function(data) {});
});

$(document).on("click", "#removeBtn", function() {
  event.preventDefault();
  $.ajax({
    type: "POST",
    url: "/saved",
    data: {
      URL: $(this)
        .siblings("a")
        .attr("href")
        .trim()
    },
    success: function() {
      location.reload();
    }
  });
});

$(document).on("click", "#addNote", function() {
  event.preventDefault();
  $.ajax({
    type: "POST",
    url: "/saveNote",
    data: {
      URL: $(this)
        .attr("data-URL")
        .trim(),
      note: $(this)
        .parent()
        .siblings()
        .children("textarea")
        .val()
        .trim()
    },
    success: function() {
      location.reload();
    }
  });
});

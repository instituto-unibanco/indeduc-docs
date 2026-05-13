document$.subscribe(function () {
  document.querySelectorAll("a[href]").forEach(function (a) {
    if (a.hostname && a.hostname !== location.hostname) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  });

  document.querySelectorAll(".md-typeset details > summary a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  });
});

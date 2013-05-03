(function () {
  $(document).ready(function () {
    $("form").submit(function (e) {
      e.preventDefault();

      var status = $("#status");
      var user = $("select[name=username]").val();
      var lab = $("select[name=lab]").val();
      var url = "/unlock/" + encodeURIComponent(user) + lab;

      status.text("unlocking...");
      $.get(url, function () {
        status.text("unlocked.");
      });
    });
  });
})();
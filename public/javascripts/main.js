(function ($) {
  /*global $:true, jQuery:true */
  var navHeight = $('.navbar').height();
  $('body').css({ marginTop : navHeight });

  function checkPasswordMatch() {
    var password = $("#password").val();
    var confirmPassword = $("#password2").val();

    if (password != confirmPassword)
      $("#checkPw")
        .addClass("form-error")
        .removeClass("form-success")
        .html("Passwords do not match!");
    else
      $("#checkPw")
        .addClass("form-success")
        .removeClass("form-error")
        .html("Passwords match."),
        $("#registerButton").prop("disabled", false);
  }

  $("#password2, #checkPw").keyup(checkPasswordMatch);

  window.setTimeout(function () {
    $(".toast").slideUp(500, function () {
      $(this).remove();
    });
  }, 10000);
})(jQuery);

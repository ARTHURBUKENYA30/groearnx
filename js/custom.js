// Shared site behavior and backend form integration.
(function () {
  "use strict";

  var year = document.querySelector("#displayYear");
  if (year) year.textContent = new Date().getFullYear();

  // The template's countdown exists only on the home page.
  var dayEl = document.getElementById("countDay");
  var hourEl = document.getElementById("countHour");
  var minEl = document.getElementById("countMin");
  var secEl = document.getElementById("countSec");
  if (dayEl && hourEl && minEl && secEl) {
    var deadline = Date.now() + 11 * 24 * 60 * 60 * 1000;
    var tick = function () {
      var distance = Math.max(0, deadline - Date.now());
      dayEl.textContent = Math.floor(distance / 86400000);
      hourEl.textContent = Math.floor((distance % 86400000) / 3600000);
      minEl.textContent = Math.floor((distance % 3600000) / 60000);
      secEl.textContent = Math.floor((distance % 60000) / 1000);
      if (distance === 0) {
        dayEl.textContent = "0";
        clearInterval(timer);
      }
    };
    tick();
    var timer = setInterval(tick, 1000);
  }

  function statusFor(form) {
    var status = form.querySelector("[data-form-status]");
    if (!status) {
      status = document.createElement("p");
      status.setAttribute("data-form-status", "");
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      status.style.marginTop = "12px";
      form.appendChild(status);
    }
    return status;
  }

  function setFormBusy(form, busy) {
    var button = form.querySelector('button[type="submit"], button:not([type])');
    if (!button) return;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Please wait...";
    } else {
      button.disabled = false;
      if (button.dataset.originalText) button.textContent = button.dataset.originalText;
    }
  }

  async function submitJson(form, endpoint, payload) {
    var status = statusFor(form);
    status.textContent = "";
    status.style.color = "";
    setFormBusy(form, true);
    try {
      var response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
      var result = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(result.error || "Submission failed. Please try again.");
      status.textContent = result.message || "Submitted successfully.";
      status.style.color = "green";
      form.reset();
    } catch (error) {
      status.textContent = error.message || "Unable to submit right now. Please try again.";
      status.style.color = "#b00020";
    } finally {
      setFormBusy(form, false);
    }
  }

  document.querySelectorAll(".subscribe_section form, .info_form form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector('input[type="email"], input');
      var email = input ? input.value.trim() : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        var status = statusFor(form);
        status.textContent = "Please enter a valid email address.";
        status.style.color = "#b00020";
        if (input) input.focus();
        return;
      }
      submitJson(form, "/api/newsletter", { email: email });
    });
  });

  document.querySelectorAll(".contact_section form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var inputs = form.querySelectorAll("input, textarea");
      var payload = {
        name: inputs[0] ? inputs[0].value.trim() : "",
        phone: inputs[1] ? inputs[1].value.trim() : "",
        email: inputs[2] ? inputs[2].value.trim() : "",
        message: inputs[3] ? inputs[3].value.trim() : ""
      };
      if (payload.name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || payload.message.length < 5) {
        var status = statusFor(form);
        status.textContent = "Please enter your name, a valid email, and a message of at least 5 characters.";
        status.style.color = "#b00020";
        return;
      }
      submitJson(form, "/api/contact", payload);
    });
  });
})();

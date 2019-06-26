/**
 * MIT License
 *
 * Copyright (c) 2019 Ubisecure, Inc
 *
 * Permission is hereby granted, free  of charge, to any person obtaining
 * a  copy  of this  software  and  associated  documentation files  (the
 * "Software"), to  deal in  the Software without  restriction, including
 * without limitation  the rights to  use, copy, modify,  merge, publish,
 * distribute,  sublicense, and/or sell  copies of  the Software,  and to
 * permit persons to whom the Software  is furnished to do so, subject to
 * the following conditions:
 *
 * The  above  copyright  notice  and  this permission  notice  shall  be
 * included in all copies or substantial portions of the Software.
 *
 * THE  SOFTWARE IS  PROVIDED  "AS  IS", WITHOUT  WARRANTY  OF ANY  KIND,
 * EXPRESS OR  IMPLIED, INCLUDING  BUT NOT LIMITED  TO THE  WARRANTIES OF
 * MERCHANTABILITY,    FITNESS    FOR    A   PARTICULAR    PURPOSE    AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE,  ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

 
// Configuration parameters can either be defined here, or in a separate javascript file.
// See README.md for more information.
/*
const perUserAuthenticationMatchingParams = {
  enabled: true,
  autoRedirect: true,
  validByDefault: false,
  validationRules: {
    "password.1": /^[^@]+$/g  // doesn't contain @
  },
  errorMessages: {
    "INVALID_USERNAME": {
      ""  : "Invalid username",
      "fi": "Virheellinen käyttäjätunnus",
      "sv": "Ogiltigt användarnamn"
    }
  }
}
*/
 
/**
 * Login class
 * 
 * Implements the business logic for login UI validation
 */
function Login(passwordMethods, externalMethods, validationRules, validByDefault) {
    this.validationRules = validationRules;
    this.passwordMethods = passwordMethods;
    this.externalMethods = externalMethods;
    this.validPasswordMethods = [];
    this.validExternalMethods = [];
    this.username = "";
    this.selectedPasswordMethod = "";
    this.validByDefault = validByDefault;
}

Login.prototype = (function() {
    function setUsername(username) {
        if (typeof username !== 'string') {
            throw new Error("argument username must be string");
        }
        const loginValidator = this;
        this.username = username.trim();
        this.validPasswordMethods = [];
        this.validExternalMethods = [];
        if (this.username) {
            const passwordMethodsConsumer = function(value) { 
                if (loginValidator.validateUsername(username, value)) {
                    loginValidator.validPasswordMethods.push(value);
                }
            };
            this.passwordMethods.forEach(passwordMethodsConsumer);
            if (this.validPasswordMethods.length == 1) {
                this.selectedPasswordMethod = this.validPasswordMethods[0];
            }
            else {
                this.selectedPasswordMethod = "";
            }
            const externalMethodsConsumer = function(value) { 
                if (loginValidator.validateUsername(username, value)) {
                    loginValidator.validExternalMethods.push(value);
                }
            }
            this.externalMethods.forEach(externalMethodsConsumer);
        }
    }
    
    function validateUsername(username, method) {
        if (!this.validationRules) {
            return this.validByDefault;
        }
        const rules = this.validationRules[method];
        if (rules) {
            if (rules.length > 1) {
                var doesAnyRuleMatch = false;
                const ruleMatcher = function(rule) {
                    doesAnyRuleMatch = doesAnyRuleMatch || username.match(rule);
                };
                rules.forEach(ruleMatcher);
                return doesAnyRuleMatch;
            }
            else if (rules.length == 1) {
                return username.match(rules[0]);
            }
            else {
                return username.match(rules);
            }
        }
        return this.validByDefault;
    }
    
    function getUsername() {
        return this.username;
    }
    
    function isUsernameValid() {
        return (this.validPasswordMethods.length > 0 || this.validExternalMethods.length > 0);
    }
    
    function getValidPasswordMethods() {
        return this.validPasswordMethods;
    }
    
    function getValidExternalMethods() {
        return this.validExternalMethods;
    }
    
    function setSelectedPasswordMethod(method) {
        if (this.isUsernameValid(this.username, method) && this.validPasswordMethods.includes(method)) {
            this.selectedPasswordMethod = method;
        }
        else {
            this.selectedPasswordMethod = "";
        }
    }
    
    function getSelectedPasswordMethod() {
        return this.selectedPasswordMethod;
    }
    
    return {
        constructor: Login,
        setUsername: setUsername,
        getUsername: getUsername,
        isUsernameValid: isUsernameValid,
        getValidPasswordMethods: getValidPasswordMethods,
        getValidExternalMethods: getValidExternalMethods,
        setSelectedPasswordMethod: setSelectedPasswordMethod,
        getSelectedPasswordMethod: getSelectedPasswordMethod,
        validateUsername: validateUsername
    };
})();

/*
 * DOM manipulation
 */
// The checks for undefined and null are here to enable unit testing, where jQuery is not used and $(document) would throw ReferenceError.
(typeof $ !== "undefined" && $ !== null) && $(document).ready(function() {
    // Parse parameters and set default values for undefined ones.
    const params = 
        (typeof perUserAuthenticationMatchingParams !== "undefined")
        ? perUserAuthenticationMatchingParams
        : {};
    
    const enabled = 
        (typeof params.enabled === "boolean") 
        ? params.enabled
        : true;
    
    const errorMessages = 
        params.errorMessages
        ? params.errorMessages
        : {};
    
    const autoRedirect = 
        (typeof params.autoRedirect === "boolean") 
        ? params.autoRedirect
        : false;
        
    const validationRules = 
        params.validationRules
        ? params.validationRules
        : {};
        
    const validByDefault = 
        (typeof params.validByDefault === "boolean") 
        ? params.validByDefault
        : true;
    
    if (!enabled) {
        return;
    }
    
    if (!$("#username").length) {
        return;
    }
    
    const passwordMethods = [];
    const passwordMethodLabels = {};
    const passwordMethodsConsumer = function() {
        passwordMethods.push(this.value);
        passwordMethodLabels[this.value] = this.innerText.trim();
    };
    $("select#method > option").each(passwordMethodsConsumer);
    
    if (passwordMethods.length == 0) {
        const method = view.getMethod();
        if (method) {
            passwordMethods.push(method);
        }
    }
    
    const externalMethods = [];
    const externalMethodsConsumer = function() {
        externalMethods.push(this.className);
    };
    $(".loginbuttons > form > span").each(externalMethodsConsumer);
    
    const login = new Login(passwordMethods, externalMethods, validationRules, validByDefault);
    var username = "";
    var selectedPasswordMethod = "";
    if ($("#external #loginerror").length > 0) {
        username = getCookie("per-user-authentication-matching-username");
        selectedPasswordMethod = getCookie("per-user-authentication-matching-passwordmethod");
        if (!username) {
            username = $("#username").val();
            selectedPasswordMethod = $("select#method option:selected").val();
            if (!selectedPasswordMethod) {
                selectedPasswordMethod = view.getMethod();
            }
        }
    }
    else {
        username = $("#username").val();
        if (username) {
            selectedPasswordMethod = $("select#method option:selected").val();
            if (!selectedPasswordMethod) {
                selectedPasswordMethod = view.getMethod();
            }
        }
    }
    updateUsername(username);
    updateSelectedPasswordMethod(selectedPasswordMethod);
    
    var disableTriggers = false; // used while refreshing dom so that we don't trigger event handlers unintentionally
    
    $("#username").val("");
    $("select#method").detach();
    
    var showInitialError = true;
    if ($("#login #loginerror").length == 0) {
        $("#login #logintext").after("<div id='loginerror'><p></p></div>");
        $("#login #loginerror").hide();
    }
    
    $("label[for=method]").hide();
    $("label[for=method]").after("<div id='passwordselectiongroup'></div>");
    $("#passwordselectiongroup").hide();
    $("label[for=method]").append(" <span id='selectedpasswordmethodspan'></span>");
    $(".loginbutton").append("<input id='selectedpasswordmethod' type='hidden' name='method' value='" + getPasswordMethodLabel(login.getSelectedPasswordMethod()) + "'/>");
    
    /* Initiate event handlers */
    
    const methodLabelClickHandler = function(event) {
        if (disableTriggers) {
            return false;
        }
        event.preventDefault();
        updateSelectedPasswordMethod("");
        showInitialError = false;
        refreshDom();
    };
    $("label[for=method]").click(methodLabelClickHandler);
    
    const usernameLabelClickHandler = function(event) {
        if (disableTriggers) {
            return false;
        }
        if ($("#username").attr("readonly")) {
            var currentUsername = $("#username").val();
            $("#password").val("");
            updateUsername("");
            updateSelectedPasswordMethod("");
            showInitialError = false;
            refreshDom();
            $("#username").val(currentUsername);
            $("#username").attr("readonly", false);
        }
        $("#username").focus();
    };
    $("label[for=username]").click(usernameLabelClickHandler);
    
    const usernameFieldClickHandler = function(event) {
        if (disableTriggers) {
            return false;
        }
        if (!$("#username").attr("readonly")) {
            return true;
        }
        var currentUsername = $("#username").val();
        $("#password").val("");
        updateUsername("");
        updateSelectedPasswordMethod("");
        showInitialError = false;
        refreshDom();
        $("#username").val(currentUsername);
        $("#username").attr("readonly", false);
        $("#username").blur();  // Edge (44.17763.1.0) and Firefox (67.0.3) seem to handle the next focus() better if blur() is called first.
        $("#username").focus();
    };
    $("#username").click(usernameFieldClickHandler);
    
    const loginFormSubmitHandler = function(event) {
        if (disableTriggers) {
            return false;
        }
        if (!login.isUsernameValid()) {
            event.preventDefault();
            updateUsername($("#username").val());
            showInitialError = false;
            refreshDom();
        }
    };
    $(".loginitem form").submit(loginFormSubmitHandler);
    
    const usernameKeypressHandler = function(event) {
        if (disableTriggers) {
            return false;
        }
        if (event.which == 13) { // return or enter
            event.preventDefault();
            updateUsername($("#username").val());
            showInitialError = false;
            refreshDom();
        }
    };
    $("#username").keypress(usernameKeypressHandler);
    
    
    refreshDom();
    
    function refreshDom() {
        disableTriggers = true;
        if (!showInitialError && autoRedirect) {
            if (login.getValidPasswordMethods().length == 0 && login.getValidExternalMethods().length == 1) {
                const externalMethod = login.getValidExternalMethods()[0];
                var button = $("div.loginbuttons span[class='" + externalMethod + "'] a");
                if (button.length == 0) {
                    button = $("div.loginbuttons span[class='" + externalMethod + "'] input")
                }
                if (button.length > 0) {
                    button[0].click();
                    return;
                }
            }
        }
        updateError();
        updateLogin();
        updateExternal();
        disableTriggers = false;
    }
    
    function updateUsername(username) {
        login.setUsername(username);
        setCookie("per-user-authentication-matching-username", username);
    }
    
    function updateSelectedPasswordMethod(method) {
        login.setSelectedPasswordMethod(method);
        setCookie("per-user-authentication-matching-passwordmethod", method);
    }
    
    function updateError() {
        if (!showInitialError) {
            if (login.isUsernameValid()) {
                $("#login #loginerror").text("");
                $("#login #loginerror").hide();
                $("#external #loginerror").text("");
                $("#external #loginerror").hide();
            }
            else if (login.getUsername().trim()) {
                $("#login #loginerror").text(getErrorMessage("INVALID_USERNAME", view.obj.locale));
                $("#login #loginerror").show();
            }
        }
    }
    
    function updateLogin() {
        $("#username").val(login.getUsername());
        
        $("#selectedpasswordmethod").val(login.getSelectedPasswordMethod());
        $("#selectedpasswordmethodspan").text(getPasswordMethodLabel(login.getSelectedPasswordMethod()));
        
        updatePasswordDomainSelection();
        
        if (login.isUsernameValid()) {
            $("#username").attr("readonly", true);
            if (login.getSelectedPasswordMethod()) {
                $(".loginbutton input.button").show();
                $("label[for=password]").show();
                $("#password").show();
                $("#password").focus();
            }
            else {
                $("label[for=password]").hide();
                $("#password").hide();
                $(".loginbutton input.button").hide();
            }
        }
        else {
            $("#username").attr("readonly", false);
            $("#username").focus();
            $("#password").hide();
            $("label[for=password]").hide();
            $(".loginbutton input.button").show();
        }
    }
    
    function updatePasswordDomainSelection() {
        if (login.getValidPasswordMethods().length > 1) {
            if (!login.getSelectedPasswordMethod()) {
                $("label[for=method]").show();
                $("#passwordselectiongroup").show();
                $("#passwordselectiongroup").html("");
                $("#passwordselectiongroup").append("<br/>");
                const passwordSelectionClickEventHandler = function(event) {
                    updateSelectedPasswordMethod(event.target.id);
                    refreshDom();
                };
                $("#passwordselectiongroup").on("click", ".button", passwordSelectionClickEventHandler);

                const validPasswordMethodsConsumer = function(index, value) {
                    $("#passwordselectiongroup").append("<br/>");
                    const passwordButton = $("<input class='button' type='button'/>");
                    passwordButton.attr("value", getPasswordMethodLabel(value));
                    passwordButton.attr("id", value);
                    passwordButton.appendTo("#passwordselectiongroup");
                };
                $.each(login.getValidPasswordMethods(), validPasswordMethodsConsumer);
            }
            else {
                $(".loginbutton input.button").show();
                $("label[for=method]").show();
                $("#passwordselectiongroup").hide();
                
            }
        }
        else if (login.getValidPasswordMethods().length == 0) {
            $("label[for=method]").hide();
            $("#passwordselectiongroup").hide();
        }
    }
    
    function updateExternal() {
        if (login.getValidExternalMethods().length >= 1) {
            $("#external").show();
            $("#external .loginbuttons > form > span").hide();
            const validExternalMethodsHandler = function(index, value) { 
                $("#external span[class='" + value + "']").show();
            };
            $.each(login.getValidExternalMethods(), validExternalMethodsHandler);
        }
        else {
            $("#external").hide();
        }
    }
    
    function getPasswordMethodLabel(method) {
        if (method) {
            return passwordMethodLabels[method];
        }
        else {
            return "";
        }
    }
    
    function getErrorMessage(error, locale) {
        if (errorMessages[error]) {
            if (errorMessages[error][locale]) {
                return errorMessages[error][locale];
            }
            else if (errorMessages[error][""]) {
                return errorMessages[error][""];
            }
        }
        return error;
    }
    
    function getCookie(name) {
        const v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
        return v ? v[2] : null;
	}

	function setCookie(name, value) {
        document.cookie = name + "=" + value + ";Secure;path=" + view.obj.conversation.contextPath;
	}
});

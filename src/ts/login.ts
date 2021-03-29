import * as $ from "jquery";
import { isLoggedIn } from "./auth";
import * as Config from "./config";
import * as Util from "./util";

//Thank ihateregex.io for this one
const emailRegex = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gi;

export function setupLogin() {
    setupCommon();

    let loginType = document.body.getAttribute("data-login-type");
    if(loginType == "login") {
        setupLoginPage();
    }

    if(loginType == "register") {
        setupRegisterPage();
    }
}

/**
 * By the default we don't want the form to submit the HTML way, we do this manually
 */
function setupCommon() {
    let form = document.getElementById("login-form");
    form.addEventListener("submit", function(e) {
        e.preventDefault();
    });
}

/**
 * Submit the login/request form so things like password managers can do their job
 */
function completeCommon() {
    let form = <HTMLFormElement> document.getElementById("login-form");
    form.submit();
}

interface LoginForm extends HTMLFormElement {
    email:          HTMLInputElement;
    password:       HTMLInputElement;
}

interface RegisterForm extends LoginForm {
    repeatPassword:     HTMLInputElement;
    agreePolicies:      HTMLInputElement;
}

//Response from the backend
interface LoginResponse {
    status:         number;
    status_message: string;
    session_id:     string;
}

function setupRegisterPage() {
    let registerBtn = document.getElementById("register-submit");
    registerBtn.addEventListener("click", function(e) {
        let registerForm = <RegisterForm> document.getElementById("login-form");
        
        //Get the status box element
        let statusElem = document.getElementById("status");

        //Get all form elements
        let emailElem = document.getElementById("email");
        let passwordElem = document.getElementById("password");
        let passwordRepeatElem = document.getElementById("repeat-password");
        let agreePoliciesElem = document.getElementById("agree-policies");

        //Clear classes on all form elements
        emailElem.classList.value = "";
        passwordElem.classList.value = "";
        passwordRepeatElem.classList.value = "";
        agreePoliciesElem.classList.value = "";

        //Check if the Email field is filled in
        if(registerForm.email == null || registerForm.email.value == "") {
            emailElem.classList.value = "border-bottom-red";

            statusElem.innerHTML = "You need to enter an E-mail address!";
            statusElem.classList.value = "red";
            statusElem.style.visibility = "visible";

            return;
        }

        //Check if the email address matches the form of an email address
        if(!emailRegex.test(registerForm.email.value)) {
            emailElem.classList.value = "border-bottom-red";

            statusElem.innerHTML = "The E-mail address you entered is not valid!";
            statusElem.classList.value = "red";
            statusElem.style.visibility = "visible";

            return;
        }

        //Check if the Password field is filled in
        if(registerForm.password == null || registerForm.password.value == "") {
            passwordElem.classList.value = "border-bottom-red";

            statusElem.innerHTML = "You need to enter a password!";
            statusElem.classList.value = "red";
            statusElem.style.visibility = "visible";

            return;
        }

        //Check if the repeat Password field is filled in
        if(registerForm.repeatPassword == null || registerForm.repeatPassword.value == "") {
            passwordRepeatElem.classList.value = "border-bottom-red";

            statusElem.innerHTML = "You need to repeat your password!";
            statusElem.classList.value = "red";
            statusElem.style.visibility = "visible";

            return;
        }

        //Check if the Password and the repeat Password match
        if(registerForm.password.value != registerForm.repeatPassword.value) {
            statusElem.innerHTML = "Passwords don't match!";
            statusElem.classList.value = "red";
            statusElem.style.visibility = "visible";

            passwordElem.classList.value = "border-bottom-red";
            passwordRepeatElem.classList.value = "border-bottom-red";
            return;
        }

        //Check if the agreePolicies checkbox has been checked
        if(!registerForm.agreePolicies.checked) {
            statusElem.innerHTML = "You need to agree with our policies before you can continue!";
            statusElem.classList.value = "red";
            statusElem.style.visibility = "visible";

            agreePoliciesElem.classList.value = "border-red";
            return;
        }

        //Send a POST request to the register endpoint
        //Email and password in base64
        var registerReq = $.ajax({
            url: Config.REGISTER_ENDPOINT,
            method: 'POST',
            data: {
                email: btoa(registerForm.email.value),
                password: btoa(registerForm.password.value)
            }
        })

        registerReq.done(function(e) {
            let loginResponse = <LoginResponse> e;

            if(loginResponse.status != 200) {
                statusElem.innerHTML = loginResponse.status_message;
                statusElem.classList.value = "red";
                statusElem.style.visibility = "visible";

                return;
            }

            statusElem.innerHTML = "Registration successful!";
            statusElem.classList.value = "green";
            statusElem.style.visibility = "visible";

            Util.setCookie("sessionid", loginResponse.session_id);
            completeCommon();

            //Redirect the user back to where they came from
            let from_param = Util.findGetParameter("from");
            if(from_param == null || from_param == "") {
                window.location.href = "/static/dashboard/dashboard.html";
                return;        
            }


            window.location.href = from_param;
        });

        registerReq.fail(function(e) {
            statusElem.innerHTML = "Something went wrong. Please try again later!";
            statusElem.classList.value = "red";
            statusElem.style.visibility = "visible";
        });
    });
}

interface OauthResponse {
    status:         number,
    redirect_uri:   string
}

function finishOauthFlow() {
    let finishOauthLoginReq = $.ajax({
        url: Config.OAUTH_FINISH_LOGIN_ENDPOINT,
        method: 'POST',
        data: {
            session_id: Util.getCookie("sessionid"),
            state: Util.findGetParameter("state")
        }
    });

    finishOauthLoginReq.done(function(e) {
        let oauthResponse = <OauthResponse> e;
        if(oauthResponse.status != 200) {
            //Something went wrong finishing the oauth flow. Aborting
            console.error("Unable to finish Oauth flow, got status " + oauthResponse.status);
            window.location.href = "/static/dashboard/dashboard.html";
            return;
        }
        
        window.location.href = oauthResponse.redirect_uri;
        return;
    });

    finishOauthLoginReq.fail(function(e) {
        console.error(e);
        window.location.href = "/static/dashboard/dashboard.html";
        return;
    });
}

function setupLoginPage() {
    if(isLoggedIn(false)) {
        let isOauth = Util.findGetParameter("is_oauth");
        if(isOauth != null && isOauth == "true") {
            finishOauthFlow();
            return;
        }
        
        let redirectUri = Util.findGetParameter("redirect_uri");
        if(redirectUri != null && redirectUri != "") {
            window.location.href = redirectUri;
            return;
        }
        
        window.location.href = "/static/dashboard/dashboard.html";    
    }

    let loginBtn = document.getElementById("login-submit");
    loginBtn.addEventListener("click", function(e) {
        let loginForm = <LoginForm> document.getElementById("login-form");

        //Get the status box element
        let statusElem = document.getElementById("status");

        //Get all form elements
        let emailElem = document.getElementById("email");
        let passwordElem = document.getElementById("password");

        //Clear classes on all fields
        statusElem.classList.value = "";
        emailElem.classList.value = "";
        passwordElem.classList.value = "";

        //Check if the email field is filled in
        if(loginForm.email == null || loginForm.email.value == "") {
            emailElem.classList.value = "border-bottom-red";

            statusElem.innerHTML = "You need to enter an E-mail address!";
            statusElem.classList.value = "red";
            statusElem.style.visibility = "visible";

            return;
        }

        //Check if the email address matches the form of an email address
        if(!emailRegex.test(loginForm.email.value)) {
            emailElem.classList.value = "border-bottom-red";

            statusElem.innerHTML = "The E-mail address you entered is not valid!";
            statusElem.classList.value = "red";
            statusElem.style.visibility = "visible";

            return;
        }

        //Check if the password field is filled in
        if(loginForm.password == null || loginForm.password.value == "") {
            passwordElem.classList.value = "border-bottom-red";

            statusElem.innerHTML = "You need to enter a password!";
            statusElem.classList.value = "red";
            statusElem.style.visibility = "visible";

            return;
        }

        let loginReq = $.ajax({
            url: Config.LOGIN_ENDPOINT,
            method: 'POST',
            data: {
                email: btoa(loginForm.email.value),
                password: btoa(loginForm.password.value)
            }
        });

        loginReq.done(function(e) {
            let loginResponse = <LoginResponse> e;

            if(loginResponse.status != 200) {
                statusElem.innerHTML = loginResponse.status_message;
                statusElem.classList.value = "red";
                statusElem.style.visibility = "visible";
            
                return;
            }

            statusElem.innerHTML = "Login successful!";
            statusElem.classList.value = "green";
            statusElem.style.visibility = "visible";

            Util.setCookie("sessionid", loginResponse.session_id);
            completeCommon();

            let isOauth = Util.findGetParameter("is_oauth");
            if(isOauth != null && isOauth == "true") {
                finishOauthFlow();
                return;
            }

            let redirectUri = Util.findGetParameter("redirect_uri");
            if(redirectUri != null || redirectUri != "") {
                window.location.href = redirectUri;
                return;
            }

            window.location.href = "/static/dashboard/dashboard.html";
            return;
        });

        loginReq.fail(function(e) {
            statusElem.innerHTML = "Something went wrong. Please try again later!";
            statusElem.classList.value = "red";
            statusElem.style.visibility = "visible";
        });
    });

}
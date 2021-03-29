import * as $ from 'jquery';
import * as Util from './util';
import * as Config from './config';

interface SessionResponse {
    status:         number,
    user:           string
}

export function isLoggedIn(redirect: boolean = true): boolean {
    let sessionId = Util.getCookie("sessionid");
    if(sessionId == null || sessionId == "") {
        if(redirect) {
            window.location.href = "/static/login/login.html";
        }
        
        return false;
    }

    let sessionRequest = $.ajax({
        url: Config.SESSION_ENDPOINT,
        method: 'post',
        data: {
            session_id: sessionId
        }
    });

    sessionRequest.done(function(e) {
        let sessionResponse = <SessionResponse> e;
        if(sessionResponse.status == 401) {
            window.location.href = "/static/login/login.html";
            return false;
        }

        if(sessionResponse.status == 200) {
            return true;
        }
    });

    sessionRequest.fail(function(e) {
        alert("Something went wrong, please try again later");
        window.location.href = "/static/login/login.html";
        return false;
    })
}

export function logout() {
    Util.removeCookie("sessionid");
    window.location.href = "/static/login/login.html";
}
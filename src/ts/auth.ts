import * as $ from 'jquery';
import * as Util from './util';
import * as Config from './config';

interface SessionResponse {
    status:         number,
    user:           string
}

export function isLoggedIn(callback: (v: boolean) => any, redirect: boolean = true): void {
    let sessionId = Util.getCookie("sessionid");
    if(sessionId == null || sessionId == "") {
        if(redirect) {
            window.location.href = "/static/login/login.html";
        }
        
        callback(false);
    }

    $.ajax({
        url: Config.SESSION_ENDPOINT,
        method: 'post',
        data: {
            session_id: sessionId
        },
        success: function(e) {
            let sessionResponse = <SessionResponse> e;
            if(sessionResponse.status == 401) {    
                if(redirect) {
                    window.location.href = "/static/login/login.html";
                }
    
                callback(false);
            }
    
            if(sessionResponse.status == 200) {
                callback(true);
            }
        },
        error: function(e) {
            alert("Something went wrong, please try again later");
            window.location.href = "/static/login/login.html";
            callback(false);
        }
    });
}

export function logout() {
    Util.removeCookie("sessionid");
    window.location.href = "/static/login/login.html";
}
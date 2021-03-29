/**
 * Get the value of a GET parameter
 * @param parameterName The name of the parameter
 * @returns The value of the requested parameter. Null if parameter doesn't exist
 */
 export function findGetParameter(parameterName: string): string {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

/**
 * Get the value of a cookie from the cookiejar
 * @param cookieName The name of the cookie
 * @returns The value of the requested cookie
 */
 export function getCookie(cookieName: string): string {
	var name: string = cookieName + "=";
	var decodedCookie: string = decodeURIComponent(document.cookie);
	var ca: string[] = decodedCookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
	  	while (c.charAt(0) == ' ') {
			c = c.substring(1);
	  	}
		  
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
	  	}
	}
	return "";
}

/**
 * Set a Cookie which will expire in 30 days
 * @param cookieName The name of the Cookie
 * @param cookieValue The value of the Cookie
 */
export function setCookie(cookieName: string, cookieValue: string) {
    var d = new Date();
    d.setTime(d.getTime() + (30*24*60*60*1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

/**
 * Remove (unset) a cookie
 * @param cookieName The name of the cookie to remove
 */
export function removeCookie(cookieName: string) {
    var d = new Date();
    d.setTime(d.getTime() - 1);
    var expirers = "expires" + d.toUTCString();
    document.cookie = cookieName + "=;" + expirers + ";path=/";
}

/**
 * Convert epoch time (seconds since January 1st 1970; also known as Unix time) to dd/mm/yyyy in UTC
 * @param epoch Epoch time as a number
 */
export function epochToUtcDate(epoch: number, includeTime = false): string {
    var date = new Date(epoch);
    var formattedDate = ("0" + date.getUTCDate()).slice(-2) + "-" + ("0" + (date.getUTCMonth() +1)).slice(-2) + "-" + date.getUTCFullYear();

    if(includeTime) {
        formattedDate += " " + ("0" + date.getUTCHours()).slice(-2) + ":" + ("0" + date.getUTCMinutes()).slice(-2);
    }

    return formattedDate;
}
import { isLoggedIn, logout } from "./auth";
import * as Util from "./util";
import * as Config from "./config";
import * as $ from "jquery";

export function loadDashboard() {
    //Check if the user is logged in
    isLoggedIn((v) => {});

    //Set up the navigation links
    setupLinks();

    //Set up the Services section
    setupServices();
}

/**d
 * Set up the navigation links
 */
function setupLinks() {
    document.getElementById("logoutBtn").addEventListener("click", function(e) { logout() });
}

interface UserServiceResponse {
    status:     number,
    services:   UserService[]    
}

interface UserService {
    service_id: string,
    config:     ServiceConfig
}

interface ServiceConfig {
    name:           string,
    identifier:     ServiceType,
    icon:           string,
    requires_login: boolean,
    login_method:   LoginMethod
}

enum ServiceType {
    HONEYWELL
}

enum LoginMethod {
    PASSWORD
}

interface GetServiceResponse {
    status:     number,
    services:   ServiceConfig[]
}

/**
 * Set up the 'Services' section
 */
function setupServices() {
    //Set up the '+' button
    //This will be a popup
    let newServiceBtn = document.getElementById("newServiceBtn");
    newServiceBtn.addEventListener("click", function(e) {
        
        //Styles to make everything but the popup be blurred
        let blurStyles =`
            nav,main {
                filter: blur(3px);
                pointer-events: none;
            }

            * {
                transition: all .3 ease;
            }
        `;
        
        //Create a <style> element for the above style
        let blurStyleSheet = document.createElement("style");
        blurStyleSheet.id = "blurStyleSheet";
        blurStyleSheet.type = "text/css";
        blurStyleSheet.innerHTML = blurStyles;
        
        //Apply the style
        document.head.appendChild(blurStyleSheet);
        
        //Create a div which will hold the services in the popup window
        let newServiceDiv = document.createElement("div");
        newServiceDiv.id = "newService";
        newServiceDiv.classList.value = "newService";

        //Create a h2 element for the title of the popup
        let title = document.createElement("h2");
        title.classList.value = "title";
        title.innerHTML = "Add a new Service";
        newServiceDiv.appendChild(title);

        //Create a 'holder' div which will hold all serviceItem's 
        let serviceHolder = document.createElement("div");
        serviceHolder.classList.value = "serviceHolder";
        
        //Request payload for the server
        let _data = {
            session_id: Util.getCookie("sessionid"),
            only_owned: false
        };

        //Make the HTTP POST request
        let getAllServicesRequest = $.ajax({
            url: Config.GET_SERVICES_ENDPOINT,
            method: 'POST',
            data: JSON.stringify(_data),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });

        //Request was successful
        getAllServicesRequest.done(function(e) {
            let userServicesResponse = <GetServiceResponse> e;
            
            //We have to check the status
            if(userServicesResponse.status != 200) {
                console.error("Non-200 status code: " + userServicesResponse.status);
                return;
            }

            //Iterate over the returned serviceItem's
            for(let i = 0; i < userServicesResponse.services.length; i++) {
                let service = userServicesResponse.services[i];
    
                //Parent div of this serviceItem
                let serviceItem = document.createElement("div");
                serviceItem.classList.value = "serviceItem";
                serviceItem.id = service.identifier.toString();
    
                //The icon of the service
                let serviceIcon = document.createElement("img");
                serviceIcon.classList.value = "serviceIcon";
                serviceIcon.src = service.icon;
                serviceIcon.alt = service.name + " Icon";
                serviceItem.appendChild(serviceIcon);
    
                //Name of the service
                let serviceName = document.createElement("p");
                serviceName.classList.value = "serviceName";
                serviceName.innerHTML = service.name;
                serviceItem.appendChild(serviceName);
    
                serviceItem.addEventListener("click", function(e) {
                    console.log("Opening popup");

                    //Create another popup window
                    let addServicePopup = document.createElement("div");
                    addServicePopup.id = service.identifier.toString();
                    addServicePopup.classList.value = "newService addSvcPopup";
                    addServicePopup.style.zIndex = "10";

                    //Create a h2 element for the title of the popup
                    let title = document.createElement("h2");
                    title.classList.value = "title";
                    title.innerHTML = "Add " + service.name;
                    addServicePopup.appendChild(title);

                    let fieldHolders = document.createElement("div");
                    fieldHolders.classList.value = "fieldHolders";

                    addServicePopup.appendChild(fieldHolders);
                    document.body.appendChild(addServicePopup);
                });

                //Add the serviceItem to the holder
                serviceHolder.appendChild(serviceItem);
            }

            //When the user clicks outside of the holder,
            //we want to close the window
            let outsideBoundsClickFn = function(e: any) {
                if(e.target instanceof Element) {
                    let target = e.target as Element;
    
                    //Check if the user clicked outside our popup
                    if(!newServiceDiv.contains(target)) {
                        console.log("outsidebounds click");

                        let addSvcElems = document.getElementsByClassName("addSvcPopup");
                        for(let i = 0; i < addSvcElems.length; i++) {
                            let elem = addSvcElems[i];

                            if(elem.contains(target)) {
                                console.log(elem);

                                return;
                            }

                            elem.remove();
                        }

                        console.log("removing");

                        //Remove the popup
                        newServiceDiv.remove();

                        //Remove the blur
                        blurStyleSheet.remove();
                    }
                }
            };
    
            //Add our event listener to the document
            document.body.addEventListener("click", outsideBoundsClickFn, { once: false });

            //Add the service holder to the newServiceDiv and add that to the body
            newServiceDiv.appendChild(serviceHolder);
            document.body.appendChild(newServiceDiv);
        });

        //Request failed
        //TODO error handling
        getAllServicesRequest.fail(function(e) {
            console.error(e);
            return;
        });
    });

    //Load all services the user has added to their account
    loadUserServices();
}

/**
 * Load the Services the user has added
 */
function loadUserServices() {
    let sessionId = Util.getCookie("sessionid");

    //Request payload for the server
    let _data = {
        session_id: sessionId,
        only_owned: true
    }

    //Make the HTTP POST request
    let getServicesRequest = $.ajax({
        url: Config.GET_SERVICES_ENDPOINT,
        method: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(_data)
    });

    //Request was successful
    getServicesRequest.done(function(e) {
        let userServicesResponse = <UserServiceResponse> e;
        
        //We have to check the status
        if(userServicesResponse.status != 200) {
            console.error("Non-200 status code: " + userServicesResponse.status);
            return;
        }

        let servicesSection = document.getElementById("servicesSection");
        
        //Iterate over the returned services
        for(let i = 0; i < userServicesResponse.services.length; i++) {
            let service = userServicesResponse.services[i];

            //Create a serviceItem
            let serviceItem = document.createElement("div");
            serviceItem.classList.value = "serviceItem";
            serviceItem.id = service.service_id;

            //Set the icon
            let serviceIcon = document.createElement("img");
            serviceIcon.classList.value = "serviceIcon";
            serviceIcon.src = service.config.icon;
            serviceIcon.alt = service.config.name + " Icon";
            serviceItem.appendChild(serviceIcon);

            //Set the name
            let serviceName = document.createElement("p");
            serviceName.classList.value = "serviceName";
            serviceName.innerHTML = service.config.name;
            serviceItem.appendChild(serviceName);

            //Add the serviceItem to the serviceSection
            servicesSection.appendChild(serviceItem);
        }
    });

    //The request failed
    //TODO error handling
    getServicesRequest.fail(function(e) {
        console.error(e);
    });
}
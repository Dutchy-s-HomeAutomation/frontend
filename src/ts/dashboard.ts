import { isLoggedIn, logout } from "./auth";

export function loadDashboard() {
    isLoggedIn((v) => {});
    setupLinks();   
}

function setupLinks() {
    //document.getElementById("connectionsBtn").addEventListener("click", function(e) { window.location.href = "./connections.html"});
    document.getElementById("logoutBtn").addEventListener("click", function(e) { logout() });
}
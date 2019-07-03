// get stargazers
// var xhr = function () {
//     if (window.ActiveXObject) {
//         try {
//             return new ActiveXObject('Msxml2.XMLHTTP');
//         } catch (e) {
//             try {
//                 return new ActiveXObject('Microsoft.XMLHTTP');
//             } catch (e1) {
//                 return null;
//             }
//         }
//     }
//     else if (window.XMLHttpRequest) {
//         return new XMLHttpRequest();
//     }
// }();

// xhr.onreadystatechange = function () {
//     if (xhr.readyState === 4) {
//         if (xhr.status === 200) {
//             document.getElementById('stargazers').innerText = ' Star ' + JSON.parse(xhr.responseText).stargazers_count;
//         }
//     }
// };

// xhr.open('get', 'https://api.github.com/repos/JiHong88/SunEditor', true);
// xhr.send();

// menu button
var navbarCollapse = document.getElementById('bs-example-navbar-collapse-1');
var navDisplay = false;
function buttonToggle () {
    navDisplay = !navDisplay;
    navbarCollapse.style.display = navDisplay ? 'block' : 'none';
}
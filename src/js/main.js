var openMenuFlag = false;
function toggleMenu() {
  let menuIcon = document.getElementById('menuIcon');
  let timesIcon = document.getElementById('timesIcon');
  let menuContent = document.getElementById('menuContent');

  if (openMenuFlag) {
    menuIcon.style.display = 'none';
    timesIcon.style.display = 'block';
    menuContent.style.display = 'flex';
  } else {
    menuIcon.style.display = 'block';
    timesIcon.style.display = 'none';
    menuContent.style.display = 'none';
  }

  openMenuFlag = !openMenuFlag;
}

(() => {
  toggleMenu;
})();

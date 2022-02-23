    // Fixed action button menu
    var menu_items = document.querySelectorAll('.fixed-action-btn');
    var menu_instances = M.FloatingActionButton.init(menu_items);
    console.log(menu_instances);
    
    // Add contact modal
    var modal = document.querySelectorAll('.modal');
    var modal_instances = M.Modal.init(modal);
    console.log(modal_instances);

    // Side nav
    var sidenav = document.querySelectorAll('.sidenav');
    var sidenav_instances = M.Sidenav.init(sidenav);

    var tabs = document.querySelector('.tabs');
    var tab_instance = M.Tabs.init(tabs);
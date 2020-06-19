"use strict";

var PROJECTS = {
    projects: [
        {
            "name": "Garden",
            "description": "The Garden was created as a way to bring people and organizations together to work, play and dance. Some of its activities are in the form of service or creative projects, some are classes or workshops, some are performances, and some are open space mixers with no agenda."
        },
        {
            "name": "Project 2",
            "description": "XXkkdk dkdkd kdkdkd dkdkdk dkdkd kdkdddd ekekekke kekeke kekeke"
        },
        {
            "name": "Project 3",
            "description": " "
        },

    ]
}

var numProjs = 0;
function getDiv() {
    var id = "proj_" + numProjs++;
    var div = $('<div class="grid-item"/>', { id: id, width: 200, border: 2 });
    div.appendTo("#projectListDiv");
    div.html("foo bar");
    return div;
}

function loadProjects() {

    var projects = PROJECTS.projects;
    projects.forEach(project => {
        var div = getDiv();
        /*
        var item = '<div class="grid-item">Name: NAME<br>DESC</div>';
        item = item.replace("NAME", project.name)
        item = item.replace("DESC", project.description);
        $('.grid').masonry().append(item);
        */
       var item = "<b>NAME</b><p>DESC";
       item = item.replace("NAME", project.name)
       item = item.replace("DESC", project.description);
      // $('.grid').masonry().append(item);
      div.html(item);
    });
}

$(document).ready(e => {
    //alert("hello");
    loadProjects();
    $('.grid').masonry({
        //$('#projectListDiv').masonry({
        // options
        itemSelector: '.grid-item',
        columnWidth: 120
    });
    // loadProjects();
});

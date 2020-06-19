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

var XXPROJECTS = {
    "projects": [
      {
        "name": "The Garden",
        "description": "The Garden was created as a way to bring people and organizations together to work, play and dance. Some of its activities are in the form of service or creative projects, some are classes or workshops, some are performances, and some are open space mixers with no agenda.",
        "image": "community.jpg"
      },
      {
        "name": "WorldViews Organization and Community",
        "description": "The mission of this project is to create and nurture a vibrant community of people working on WorldViews, enjoying the project, or using it to share views of the world.",
        "image": "virtualtour.jpg"
      },
      {
        "name": "Guide and Expert Registry",
        "description": "This project will make it easy to find people around any location who can tell you about that location and provide views or tours of the area. This works by listing current live streams or guides ready to stream using Periscope, Meerkat, or other mobile streaming technologies. We also have a ShareCamApp powered by the JumpCh.at WebRTC system that lets people take pictures together. The Registry lists active guides, or guides willing to provide views for upcoming events, and for others to list views or event coverage they would like to see.",
        "image": "techdevelopment.jpg"
      },
      {
        "name": "WorldViews Technology Development",
        "description": "This activity is to build cool server and client software for furthering the WorldViews mission. All our software is open source, and built on open source. Currently the main efforts are building a client virtual earth browser called TeleViewer, which can show many layers of information, videos, and live video feeds. TeleViewer is built upon the open source CesiumJS. Another part of the current development is to develop a server to support many WorldViews capabilities. We currently support serving the TeleViewer using either nodejs, django, python flask, or a simple python server. We primarily are focusing on flask, and use the mongodb.",
        "image": "worldviews.png"
      },
      {
        "image": "toyokawa.jpg",
        "name": "TeleViewer",
        "description": "Our first  project was TeleViewer, which is a digital earth supporting many different ways to see the world or any part of the world. These may be based on images, video, computer graphics, or live streamed views, telepresence robotic views, etc. It is inspired by Google Eath, StreetView and many great related projects, but we seek to build open source tools with core content in the creative commons. Our ultimate vision is to have free tools available to anyone to let them see the world or any part of the world in useful and inspiring ways."
      },
      {
        "image": "toyokawa.jpg",
        "name": "Cupertino - Toyokawa Sister City Program",
        "description": "WorldViews is interested in ways to help connect people and share experiences across sister cities. We are working with the Cupertino Toyokawa Sister Cities program to explore ways to do this. Our first effort at this will be during the Cupertino Cherry Blossom Festival."
      },
      {
        "image": "polly-med.jpg",
        "name": "Next Generation Polly",
        "description": "Polly was an FXPAL project, based on the idea of a 'parrot on the shoulder' serving as an avatar for someone wanting to virtualy visit a location they can't physically access. It is a bit like using a telepresence robot, but instead of the person connecting to a robot, they connect to the robotic parrot being carried by a guide. It was fun using Polly to take people on virtual tours, and was especially rewarding to take Henry and Jane Evans on a tour of the Stanford Business school, where Henry had received his MBA (shown in video above.) As is clearly seen, our prototype, designed and 3D printed by Don Severns worked, but was rather clunky and fragile. We always hoped for a Polly type device to become more available. Now DJI has put out a product called the Osmo mobile, which is very much like Polly. We are planning to use this to revive the Polly idea, and give more virtual tours. Enock has made good progress on this, getting the DJI sample code to work for controlling the gimbal."
      },
      {
        "image": "horseshoepond.jpg",
        "name": "Drone Views",
        "description": "Inspired by the sites Travel By Drone and Travel With Drone we would like to have a layer that shows beautiful videos captured by drones from all around the world. We would also like to show current live drone videos, and allow users to make a request to have videos shot at various locations of their interest. We will also work to provide software so that drone flights can be remotely controlled (within geobox and safety control guidelines) by remote people watching on WorldViews."
      }
    ]
  };

var numProjs = 0;
function getDiv() {
    var id = "proj_" + numProjs++;
    var div = $('<div class="grid-item"/>', { id: id, width: 200, border: 2 });
    div.appendTo("#projectListDiv");
    div.html("foo bar");
    return div;
}

async function getProjects() {
    var projectsObj = await loadJSON("projects.json");
    return projectsObj;
}

async function loadProjects() {
    //projects = PROJECTS.projects;
    var projectsObj = await getProjects();
    var projects = projectsObj.projects;
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

$(document).ready(async e => {
    //alert("hello");
    await loadProjects();
    $('.grid').masonry({
        //$('#projectListDiv').masonry({
        // options
        itemSelector: '.grid-item',
        columnWidth: 120
    });
    // loadProjects();
});

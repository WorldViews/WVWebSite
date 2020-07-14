"use strict";

var PROJECTS = {
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
    div.html("empty div");
    return div;
}



class ProjectDB {
    constructor() {
        this.projectsObj;
        this.projectsById = {};
        this.allowEdits = false;
        var inst = this;
        this.setupGUI();
        this.initFirebase();
    }

    async initFirebase() {
        var inst = this;
        if (inst.firebase)
            return;
        var firebaseConfig = {
            apiKey: "AIzaSyBqAsqHaBZGT-UsC82ShV3koGWWgu-l8to",
            authDomain: "fir-helloworld-39759.firebaseapp.com",
            databaseURL: "https://fir-helloworld-39759.firebaseio.com",
            projectId: "fir-helloworld-39759",
            storageBucket: "fir-helloworld-39759.appspot.com",
            messagingSenderId: "1080893233748",
            appId: "1:1080893233748:web:1614aab0d167c094322bc1"
        };
        // Initialize Firebase
        //TODO: move firebase initialization to early place before we
        // go to fetch data.
        firebase.initializeApp(firebaseConfig);
        inst.firebase = firebase;

        firebase.auth().onAuthStateChanged(user => {
            console.log("authStateChange", user);
            inst.user = user;
            if (user) {
                // User is signed in.
                var displayName = user.displayName;
                var email = user.email;
                var emailVerified = user.emailVerified;
                var photoURL = user.photoURL;
                var isAnonymous = user.isAnonymous;
                var uid = user.uid;
                var providerData = user.providerData;
                if (!displayName || displayName == "")
                    displayName = email;
                $("#userInfo").html(displayName);
                $("#login").html("signout");
                inst.allowEdits = true;
                //inst.heartBeater = setInterval(() => inst.produceHeartBeat(), 5000);
                // ...
            } else {
                // User is signed out.
                // ...
                $("#userInfo").html("guest");
                $("#login").html("login");
                inst.allowEdits = false;
                if (inst.heartBeater) {
                    clearInterval(inst.heartBeater);
                    inst.heartBeater = null;
                }
            }
        });
        $("#login").click(e => inst.handleLogin());
    }

    handleLogin() {
        // window.open('./PlayAuth/auth.html');
        if (this.user) {
            this.firebase.auth().signOut().then(function () {
                // Sign-out successful.
            }).catch(function (error) {
                // An error happened.
            });
        }
        else {
            window.location = './auth.html';
        }
    }


    getFirebaseDB() {
        if (this.firebaseDB)
            return this.firebaseDB;
        this.initFirebase();
        /*
        var firebaseConfig = {
            apiKey: "AIzaSyBqAsqHaBZGT-UsC82ShV3koGWWgu-l8to",
            authDomain: "fir-helloworld-39759.firebaseapp.com",
            databaseURL: "https://fir-helloworld-39759.firebaseio.com",
            projectId: "fir-helloworld-39759",
            storageBucket: "fir-helloworld-39759.appspot.com",
            messagingSenderId: "1080893233748",
            appId: "1:1080893233748:web:1614aab0d167c094322bc1"
        };
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        */
        this.firebaseDB = this.firebase.database();
        console.log("db:", this.firebaseDB);
        return this.firebaseDB;
    }

    loadProjectsFromFirebase() {
        var db = this.getFirebaseDB();
        console.log("db:", db);
        //var dbRef = db.ref('/text');
        var dbRef = db.ref();
        console.log("Got dbRef", dbRef);
        return new Promise((res, rej) => {
            dbRef.on('value', snap => {
                console.log("Got", snap);
                var obj = snap.val();
                console.log("obj", obj);
                var jstr = JSON.stringify(obj, null, 3);
                console.log("projects", jstr);
                res(obj.topics);
            });
        })
    }

    async loadProjects() {
        var inst = this;
        //var projectsObj = await loadJSON("projects.json");
        var projectsObj = await this.loadProjectsFromFirebase();
        this.projectsObj = projectsObj;
        projectsObj.projects.forEach(proj => {
            inst.checkId(proj);
            this.projectsById[proj.id] = proj;
        });
        return projectsObj;
    }

    uniqueId() {
        var id = 'proj_' + getClockTime();
        id = id.replace(/\./g, "_");
        return id;
    }

    checkId(proj) {
        if (!proj.id || proj.id == "" || proj.id == "NEW") {
            //proj.id = proj.name.replace(/ /g, "_");
            proj.id = this.uniqueId();
        }
    }

    async updateDB() {
        //return this.updateProjectsFile();
        return this.updateFirebaseDB();
    }

    async updateFirebaseDB() {
        console.log("update firebase");
        var db = this.getFirebaseDB();
        console.log("db:", db);
        //var dbRef = db.ref('/text');
        var dbRef = db.ref();
        console.log("Got dbRef", dbRef);
        await dbRef.child("topics").set(this.projectsObj);
        console.log("Successfully updated");
    }

    async updateProjectsFile() {
        var jstr = JSON.stringify(this.projectsObj, null, 3);
        console.log("ProjectsObj:\n", jstr);
        var fname = "projects.json";
        return uploadDataToFile("/", jstr, fname);
    }

    setupGUI() {
        var inst = this;
        $("#updateProject").click(() => {
            inst.updateProject();
        });
        $("#cancelButton").click(() => {
            inst.launchProjectList();
        });
        $("#deleteButton").click(() => {
            inst.deleteProject(inst.currentProj);
        });
    }

    // This is called from GUI to delete a project
    async deleteProject(proj) {
        if (!proj)
            proj = this.currentProject;
        var projs = this.projectsObj.projects;
        var i = -1;
        for (var j = 0; j < projs.length; j++) {
            if (projs[j].id == proj.id)
                i = j;
        }
        if (i >= 0) {
            projs.splice(i, 1);
        }
        else {
            alert("cannot find project to delete");
        }
        await this.updateDB();
        this.launchProjectList();
    }


    async layoutProjects() {
        //projects = PROJECTS.projects;
        var inst = this;
        var projectsObj = await this.loadProjects();
        var projects = projectsObj.projects;
        projects.forEach(project => {
            var div = this.getProjectDiv(project);
        });
        if (this.allowEdits) {
            //let bstr = sprintf('<input id="%s" type="button" value="edit">', bid);
            $("#createProject").click(e => inst.launchCreateProject())
        }
    }

    // called from GUI to update the project being editd.
    async updateProject() {
        var proj = this.currentProject;
        var editor = tinymce.get('editArea');
        var content = editor.getContent();
        //proj.id = $("#projectId").val();
        proj.name = $("#projectName").val();
        var imageURL = $("#imageURL").val();
        var infoURL = $("#infoURL").val();
        var instagramUsername = $("#instagramName").val();
        var instagramTag = $("#instagramTag").val();
        var projectType = $("#projectType").val();
        if (imageURL)
            proj.imageURL = imageURL;
        if (infoURL)
            proj.infoURL = infoURL;
        if (projectType)
            proj.projectType = projectType;
        if (instagramTag)
            proj.instagramTag = instagramTag;
        if (instagramUsername)
            proj.instagramUsername = instagramUsername;
        proj.description = content;
        if (proj.name == "" || !proj.name) {
            alert("Name required for projects");
            return;
        }
        this.checkId(proj);
        await this.updateDB();
        this.launchProjectList();
    }

    launchCreateProject() {
        console.log("*** create New Project");
        var url = "projectEdit.html?projectId=NEW";
        if (username)
            url = url + "&username=" + username;
        window.open(url, "_self");
    }

    launchProjectList() {
        var url = "projectList.html?edit=True";
        if (username)
            url = url + "&username=" + username;
        window.open(url, "_self");
    }

    // called to change to a new webpage for editing a project
    launchEditProject(projId) {
        var url = "projectEdit.html?projectId=" + projId;
        if (username)
            url = url + "&username=" + username;
        window.open(url, "_self");
    }

    // called to set up things for editing project on this webpage
    editProject(projId) {
        var proj = this.projectsById[projId];
        this.isNewProj = false;
        if (projId == "NEW") {
            console.log("*** create new project");
            this.isNewProj = true;
            proj = { name: '', id: "", description: "" };
            this.projectsObj.projects.push(proj);
        }
        this.currentProject = proj;
        console.log("editProj", proj);
        $("#projectId").val(projId);
        $("#projectName").val(proj.name);
        $("#imageURL").val(proj.image);
        $("#infoURL").val(proj.infoURL);
        $("#projectType").val(proj.projectType);
        $("#instagramName").val(proj.instagramUsername);
        $("#instagramTag").val(proj.instagramTag);
        //$("#editArea").html(proj.description);
        if (proj == null) {
            alert("No project with id", projId);
        }
        var editor = tinymce.get('editArea');
        var content = editor.getContent();
        ///content = content.replace(/{\$baseurl}/g, 'http://mydomain.com');
        editor.setContent(proj.description);
    }


    getProjectDiv(project) {
        var inst = this;
        //project.id = project.name.replace(/ /g, "_");
        let bid = 'edit' + project.id;
        let div = getDiv();
        let item = "<b>NAME</b><p>DESC";
        item = item.replace("NAME", project.name)
        item = item.replace("DESC", project.description);
        if (project.image) {
            item = sprintf("<img src='%s' class='proj-img'><br>", project.image) + item;
        }
        // $('.grid').masonry().append(item);
        item += '<br>';
        if (this.allowEdits) {
            let bstr = sprintf('<input id="%s" type="button" value="edit">', bid);
            console.log("button:", bid, bstr);
            item += bstr;
        }
        div.html(item);
        if (this.allowEdits) {
            $("#" + bid).click(e => {
                console.log("edit", bid);
                inst.launchEditProject(project.id);
            });
        }
        return div;
    }
}


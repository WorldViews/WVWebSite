"use strict";


var numProjs = 0;
function getDiv(container) {
    container = container || "#projectListDiv";
    var id = "proj_" + numProjs++;
    var div = $('<div class="grid-item"/>', { id: id, width: 200, border: 2 });
    div.appendTo(container);
    div.html("empty div");
    return div;
}



class ProjectDB {
    constructor(opts) {
        opts = opts || {};
        this.opts = opts;
        this.projectsObj = null;
        this.projectsById = {};
        this.allowEdits = false;
        var dbRoot = getParameterByName("dbRoot");
        this.dbRoot = dbRoot || opts.dbRoot || "/topics";

        var inst = this;
        this.setupGUI();
        this.initFirebase();
    }

    async initFirebase() {
        var inst = this;
        if (inst.firebase)
            return;
        var firebaseConfig = {
            apiKey: "AIzaSyABtA6MxppX03tvzqsyO7Mddc606DsHLT4",
            authDomain: "gardendatabase-1c073.firebaseapp.com",
            databaseURL: "https://gardendatabase-1c073.firebaseio.com",
            projectId: "gardendatabase-1c073",
            storageBucket: "gardendatabase-1c073.appspot.com",
            messagingSenderId: "601117522914",
            appId: "1:601117522914:web:90b28c88b798e45f5fd7bb"
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
        this.firebaseDB = this.firebase.database();
        console.log("db:", this.firebaseDB);
        return this.firebaseDB;
    }

    loadProjectsFromFirebase() {
        console.log("loadProjectsFromFirebase root:", this.dbRoot);
        var db = this.getFirebaseDB();
        console.log("db:", db);
        //var dbRef = db.ref('/topics');
        var dbRef = db.ref(this.dbRoot);
        console.log("Got dbRef", dbRef);
        return new Promise((res, rej) => {
            dbRef.on('value', snap => {
                console.log("Got", snap);
                var obj = snap.val();
                console.log("obj", obj);
                //var jstr = JSON.stringify(obj, null, 3);
                //console.log("projects", jstr);
                res(obj);
            });
        })
    }

    async loadProjectsFromURL(url) {
        var projectsObj = await loadJSON(url);
        this.projectsObj = projectsObj;
        return projectsObj;
    }

    async loadProjects() {
        var inst = this;
        var projectsURL = getParameterByName("projectsURL") || this.opts.projectsURL;
        if (projectsURL) {
            return await this.loadProjectsFromURL(projectsURL);
        }
        //var projectsObj = await loadJSON("projects.json");
        var projectsObj = await this.loadProjectsFromFirebase();
        this.projectsObj = projectsObj;
        projectsObj.projects.forEach(proj => {
            inst.checkId(proj);
            this.projectsById[proj.id] = proj;
            proj.tags = inst.getTags(proj.projectType);
        });
        return projectsObj;
    }

    async getProjectByName(name) {
        if (!this.projectsObj)
            await this.loadProjects();
        for (var proj of this.projectsObj.projects) {
            if (proj.name == name)
                return proj;
        }
        return null;
    }

    // opts may either contain "tags" which is a tag specifier for finding
    // a subset of the projects, or "names" which selects projects with given names
    // Note that names can be used to set the order of projects, the returned
    // list will be ordered same as names.
    async getProjects(opts) {
        var tags = opts.tags;
        var names = opts.names;
        var projectsObj = this.projectsObj;
        if (!projectsObj)
            projectsObj = await this.loadProjects();
        var projs = [];
        if (names) {
            for (var name of names) {
                var proj = await this.getProjectByName(name);
                if (proj) {
                    projs.push(proj)
                }
                else {
                    alert("Project not found " + name)
                }
            }
            return projs;
        }
        if (typeof tags == "string")
            tags = this.getTags(tags);
        for (var proj of projectsObj.projects) {
            if (tags) {
                if (this.contains(proj.tags, tags)) {
                    projs.push(proj);
                }
            }
            else {
                projs.push(proj);
            }
        }
        return projs;
    }

    getTags(str) {
        if (!str)
            return [];
        str = str.trim().toLowerCase();
        return str.split(/[ ,]+/);
    }

    // return true if tagList contains all given tags.  Tags
    contains(tagList, tags) {
        if (typeof tags == "string")
            return (tagList.indexOf(tagOrTags.toLowerCase() >= 0));
        for (var tag of tags) {
            if (tagList.indexOf(tag.toLowerCase()) < 0)
                return false;
        }
        return true;
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
        /*
        var dbRef = db.ref();
        console.log("Got dbRef", dbRef);
        await dbRef.child("topics").set(this.projectsObj);
        */
        var dbRef = db.ref(this.dbRoot);
        console.log("dbRef", dbRef);
        await dbRef.set(this.projectsObj);
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
            inst.launchNextPage();
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
        this.launchNextPage();
    }


    async layoutProjects(opts) {
        opts = opts || {};
        console.log("layoutProjects", opts);
        var inst = this;
        var projects = await this.getProjects(opts);
        projects.forEach(project => {
            var div = this.getProjectDiv(project, opts.container);
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
        proj.mtime = getClockTime();
        if (proj.name == "" || !proj.name) {
            alert("Name required for projects");
            return;
        }
        this.checkId(proj);
        await this.updateDB();
        this.launchNextPage();
    }

    launchCreateProject() {
        console.log("*** create New Project");
        var url = "projectEdit.html?projectId=NEW";
        if (username)
            url = url + "&username=" + username;
        window.open(url, "_self");
    }

    launchNextPage() {
        var nextPage = getParameterByName("nextPage");
        var url = nextPage || this.nextPage || "projectList.html";
        url += "?edit=True";
        url += "&dbRoot=" + this.dbRoot;
        if (username)
            url = url + "&username=" + username;
        window.open(url, "_self");
    }

    // called to change to a new webpage for editing a project
    launchEditProject(projId) {
        var url = sprintf("projectEdit.html?projectId=%s&dbRoot=%s", projId, this.dbRoot);
        if (this.nextPage)
            url += "&nextPage=" + this.nextPage;
        if (username)
            url = url + "&username=" + username;
        var winName = this.editWindowName || "_self";
        console.log("winName", winName);
        window.open(url, winName);
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
        $("#imageURL").val(proj.imageURL);
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

    getProjectDiv(project, container) {
        var inst = this;
        //project.id = project.name.replace(/ /g, "_");
        let bid = 'edit' + project.id;
        let projDivId = 'projDiv' + project.id;
        let xid = 'xxx' + project.id;
        let div = getDiv(container);
        let item = `
        <h3 class='proj-heading'>${project.name}</h3>
        <div id='${projDivId}'>${project.description}
        <br>
        <span id='${xid}'>
        </span>
        </div>
        `;
        item += '<br>';
        if (this.allowEdits) {
            let bstr = sprintf('<button id="%s">Edit</button>', bid);
            //console.log("button:", bid, bstr);
            item += bstr;
        }
        div.html(item);
        if (this.allowEdits) {
            var jqBut = $("#"+bid);
            jqBut.click(e => {
                console.log("edit", bid);
                var label = jqBut.html();
                console.log("label", label);
                if (label == "Edit") {
                    jqBut.html("Save");
                    tinymce.init({
                        selector: '#'+projDivId,
                        height: 500,
                        theme: 'modern',
                        plugins: [
                            'advlist autolink lists link image charmap print preview hr anchor pagebreak',
                            'searchreplace wordcount visualblocks visualchars code fullscreen',
                            'insertdatetime media nonbreaking save table contextmenu directionality',
                            'emoticons template paste textcolor colorpicker textpattern imagetools'
                        ],
                        toolbar1: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
                        toolbar2: 'print preview media | forecolor backcolor emoticons',
                        image_advtab: true,
                        templates: [
                            { title: 'Test template 1', content: 'Test 1' },
                            { title: 'Test template 2', content: 'Test 2' }
                        ],
                        content_css: [
                            '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
                            '//www.tinymce.com/css/codepen.min.css'
                        ]
                    });
                }
                else {
                    jqBut.html("Edit");
                    console.log("trying to remove");
                    //https://stackoverflow.com/questions/17759111/tinymce-4-remove-or-destroy
                    tinymce.remove('#'+projDivId);
                    //tinymce.execCommand('mceRemoveControl', true, '#'+projDivId);
                }
                setTimeout(() => {
                    $('.grid').masonry({
                        itemSelector: '.grid-item',
                        fitWidth: true,
                        columnWidth: 500
                    });

                }, 100);

                ///inst.launchEditProject(project.id);
            });
        }
        return div;
    }

    async download(fname) {
        fname = fname || "projs.json";
        var projs = await this.loadProjects();
        downloadFromBrowser(fname, projs);
    }
}


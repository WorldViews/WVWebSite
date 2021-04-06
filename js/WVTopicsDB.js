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


class WVTopicsDB {
    constructor(opts) {
        opts = opts || {};
        this.opts = opts;
        this.projectsObj = null;
        this.projectsById = {};
        this.allowEdits = false;
        this.callbacks = [];
        this.watchers = [];
        var dbRoot = getParameterByName("dbRoot");
        this.dbRoot = dbRoot || opts.dbRoot || "/branches/v0_1/topics";

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
        var inst = this;
        var promise = new Promise((res, rej) => {
            inst.callbacks.push(obj => {
                console.log("resolving DB projlist", obj);
                res(obj)
            });
        });
        var db = this.getFirebaseDB();
        console.log("db:", db);
        var dbRef = db.ref(this.dbRoot);
        console.log("Got dbRef", dbRef);
        dbRef.on('value', snap => {
            console.log("Got", snap);
            var obj = snap.val();
            console.log("obj", obj);
            window.OBJ = obj;
            //var jstr = JSON.stringify(obj, null, 3);
            //console.log("projects", jstr);
            inst.handleUpdateDB(obj);
        });
        return promise;
    }

    handleUpdateDB(obj) {
        console.log("Handle updated DB", obj);
        this.callbacks.forEach(cb => cb(obj));
        this.callbacks = [];
        this.watchers.forEach(watcher => watcher(obj));
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
        console.log("got projects ", projectsObj);
        for (var key in projectsObj) {
            var proj = projectsObj[key];
            inst.checkId(proj);
            this.projectsById[proj.id] = proj;
            proj.tags = inst.getTags(proj.projectType);
        }
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
        for (var key in projectsObj) {
            var proj = projectsObj[key];
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

    async updateDB(proj) {
        //return this.updateProjectsFile();
        return this.updateFirebaseDB(proj);
    }

    async updateFirebaseDB(proj) {
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
        await dbRef.child(proj.id).set(proj);
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

    async download(fname) {
        fname = fname || "projs.json";
        var projs = await this.loadProjects();
        downloadFromBrowser(fname, projs);
    }
}


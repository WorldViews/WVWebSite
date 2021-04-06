"""
Module for backing up Garden DB from firestore.

To use this, get python 3.6+ and do 
pip install firebase-admin

"""
import json, os, time
import firebase_admin
from firebase_admin import auth
from firebase_admin import credentials

firebaseConfig = {
    "apiKey": "AIzaSyABtA6MxppX03tvzqsyO7Mddc606DsHLT4",
    "authDomain": "gardendatabase-1c073.firebaseapp.com",
    "databaseURL": "https://gardendatabase-1c073.firebaseio.com",
    "projectId": "gardendatabase-1c073",
    "storageBucket": "gardendatabase-1c073.appspot.com",
    "messagingSenderId": "601117522914",
    "appId": "1:601117522914:web:90b28c88b798e45f5fd7bb",
    "serviceAccount": "firebaseServiceAccountKey.json"
}

SERVICE_ACCOUNT = "private/gardendatabase-1c073-firebase-adminsdk-l9my9-44a29d49d9.json"
DATABASE_URL = "https://gardendatabase-1c073.firebaseio.com"

def verifyDir(dir):
    if not os.path.exists(dir):
        print("Creating dir", dir)
        os.mkdir(dir)

def timeStr(t=None):
    if t == None:
        t = time.localtime()
    return time.strftime("%Y_%m_%d_%H_%M_%S", t)

class FireDB():
    def __init__(self):     
        print("Starting")
        print("credentials", credentials)
        print()
        cred = credentials.Certificate(SERVICE_ACCOUNT)
        print("cred", cred)
        firebase_admin.initialize_app(cred, {
            'databaseURL' : DATABASE_URL
        })
        from firebase_admin import db
        self.db = db
        print("db", db)
        print()
        #root = db.reference()
        """
        root = db.reference("/topics")
        print("root", root)
        print()
        print(root.get())
        """

    def getUsers(self):
        print("listing users")
        usersPage = firebase_admin.auth.list_users()
        print("usersPage", usersPage)
        userObjs = []
        for user in usersPage.users:
            #print(user)
            obj = {}
            print(" ", user.email, user.uid, user.display_name)
            for key in dir(user):
                if key in ["user_data", "user_metadata", "provider_data"]:
                    continue
                if key[0] == "_":
                    continue
                obj[key] = getattr(user, key)
            #print("userObj", obj)
            userObjs.append(obj)
        return userObjs

    def backupUsers(self, jsonPath="backups/users.json"):
        verifyDir("backups")
        print("Getting users")
        users = self.getUsers()
        print("Saving users to", jsonPath)
        json.dump(users, open(jsonPath, "w"), indent=3)

    def backupDB(self, dbPath="/topics", jsonPath="backups/topics.json"):
        verifyDir("backups")
        print("Getting", dbPath)
        ref = self.db.reference(dbPath)
        data = ref.get()
        print("Got data")
        print("Saving to", jsonPath)
        json.dump(data, open(jsonPath, "w"), indent=3)

    def projects(self, projRoot="/topics/projects"):
        projsRef = self.db.reference(projRoot)
        projs = projsRef.get()
        return projs

    def dump(self):
        projs = self.projects()
        for proj in projs:
            print(proj)
            print()

    def save(self, obj, root="/private/don/foo"):
        ref = self.db.reference(root)
        ref.set(obj)

    def migrate_0_0_to_0_1(self, srcRoot="/topics/projects/", dstRoot="/branches/v0_1/topics"):
        projs = self.db.reference(srcRoot).get()
        dstRef = self.db.reference(dstRoot)
        for proj in projs:
            print(proj)
            id = proj['id']
            print(id)
            destPath = dstRoot+"/"+id
            dstRef.child(id).set(proj)
            print()
            """
            pid = dstRef.push()
            proj['key'] = pid.key
            print("key", pid.key)
            pid.set(proj)
            """

    
def transferProjs(dstRoot="/branches/don/topics/projects"):
    fdb = FireDB()
    projs = fdb.projects()
    fdb.save(projs, dstRoot)

def backup():
    fdb = FireDB()
    fdb.backupUsers()
    ts = timeStr()
    fdb.backupDB(jsonPath="backups/topics_%s.json" % (ts,))
    fdb.backupDB("/branches/don/topics", "backups/don_topics_%s.json" % (ts,))

def migrate():
    fdb = FireDB()
    fdb.migrate_0_0_to_0_1()



if __name__ == '__main__':
    #transferProjs()
    #migrate()
    backup()






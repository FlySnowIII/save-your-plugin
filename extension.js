// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const execSync = require('child_process').execSync;
var admin = require("firebase-admin");
var serviceAccount = require("./keys/vscode-save-your-plugin-firebase-adminsdk-1l6s7-e647d4b6b5.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://vscode-save-your-plugin.firebaseio.com"
});
var firebaseAuth     = admin.auth();
var firebaseDatabase = admin.database();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "save-your-plugin" is now active!');

    // Process Init for get Extension List
    try {
        process.chdir('bin');
    } catch (error) {
        console.log("Run from no windows");        
    }
    console.log("CWD is Change:",process.cwd());

    
    let getpluginlist_subscription = vscode.commands.registerCommand('extension.getPluginList', function(){
        vscode.window.showInformationMessage(getPluginList());

    });
    context.subscriptions.push(getpluginlist_subscription);

    let loginorRegist_subscription = vscode.commands.registerCommand('extension.loginorRegist', function (){

        vscode.window.showInputBox({ placeHolder: "Please input your Email for Login or Register" }).then(useremail => {
			if (!useremail) {
				return;
			}
            console.log(useremail);
            var userpassword = "0pp00pp0";

            firebaseAuth.getUserByEmail(useremail)
                .then(function(userRecord) {
                    // See the UserRecord reference doc for the contents of userRecord.
                    console.log("Successfully fetched user data:", userRecord.toJSON());
                    vscode.window.showInformationMessage("Login Successful: "+userRecord.email+". Please wait a moment.");
                    uploadyourplugin(userRecord.uid);
                })
                .catch(function(error) {
                    console.log("Error fetching user data:", error);
                    firebaseAuth.createUser({
                        email: useremail,
                        emailVerified: false,
                        // phoneNumber: "+11234567890",
                        password: userpassword,
                        // displayName: "John Doe",
                        // photoURL: "http://www.example.com/12345678/photo.png",
                        disabled: false
                    })
                    .then(function(userRecord) {
                        // See the UserRecord reference doc for the contents of userRecord.
                        console.log("Successfully created new user:", userRecord.uid);
                        vscode.window.showInformationMessage("Register Successful: "+userRecord.email);
                        uploadyourplugin(userRecord.uid);

                    })
                    .catch(function(error) {
                        console.log("Error creating new user:", error);
                        vscode.window.showErrorMessage("Sorry, Register is falied. Please change other email and try again.");

                    });
                });


            });

    });
    context.subscriptions.push(loginorRegist_subscription);

    let rewritePluginlistfromThisWorkplace_subscription = vscode.commands.registerCommand('extension.rewritePluginListOnServer', function (){

        vscode.window.showInputBox({ placeHolder: "Please input your Email for Login or Register" }).then(useremail => {
			if (!useremail) {
				return;
			}
            console.log(useremail);
            var userpassword = "0pp00pp0";

            firebaseAuth.getUserByEmail(useremail)
                .then(function(userRecord) {
                    // See the UserRecord reference doc for the contents of userRecord.
                    console.log("Successfully fetched user data:", userRecord.toJSON());
                    vscode.window.showInformationMessage("Login Successful: "+userRecord.email+". Please wait a moment.");
                    rewritePluginList(userRecord.uid);
                })
                .catch(function(error) {
                    console.log("Error fetching user data:", error);
                    firebaseAuth.createUser({
                        email: useremail,
                        emailVerified: false,
                        // phoneNumber: "+11234567890",
                        password: userpassword,
                        // displayName: "John Doe",
                        // photoURL: "http://www.example.com/12345678/photo.png",
                        disabled: false
                    })
                    .then(function(userRecord) {
                        // See the UserRecord reference doc for the contents of userRecord.
                        console.log("Successfully created new user:", userRecord.uid);
                        vscode.window.showInformationMessage("Register Successful: "+userRecord.email);
                        rewritePluginList(userRecord.uid);

                    })
                    .catch(function(error) {
                        console.log("Error creating new user:", error);
                        vscode.window.showErrorMessage("Sorry, Register is falied. Please change other email and try again.");

                    });
                });


            });

    });
    context.subscriptions.push(rewritePluginlistfromThisWorkplace_subscription);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;


function getPluginList(){
        var result =  execSync('code --list-extensions',{cwd:process.cwd()});
        return result.toString();

}

// --install-extension (<extension-id>)
function installPlugin(str_extension_id = null){

    if(!str_extension_id || str_extension_id==""){
        return "Nothing is runing.";
    }

    try {
        console.log(process.cwd());
        var result =  execSync('code --install-extension '+str_extension_id,{cwd:process.cwd()});
        console.log("Result is : ",result.toString()); 
        vscode.window.showInformationMessage(result.toString());
        return result.toString();
    } catch (error) {
        
    }

}

function uploadyourplugin(uid){
    console.log("uploadyourplugin:",uid);
    var pluginlist = getPluginList().split('\n');
    firebaseDatabase.ref().child(uid).once('value').then(function(snapshort){
        var dataObj = snapshort.val();
        var concatPluginList = null;
        if(!dataObj){
            console.log("No Data!");
            concatPluginList = pluginlist;
            firebaseDatabase.ref().child(uid).update(pluginlist);
            vscode.window.showInformationMessage("First Upload your plugin Successful!");

        }
        else{
            concatPluginList = concatArrayRemoveSame(pluginlist,Object.values(dataObj));
            firebaseDatabase.ref().child(uid).set(concatPluginList);

            var installedPluginArray = [];
            
            vscode.window.showInformationMessage("There are "+Object.values(dataObj).length+" change will be install");

            Object.values(dataObj).forEach(element => {
                if(-1 == pluginlist.indexOf(element) && element.length>0){
                    installedPluginArray.push(element);
                    installPlugin(element);
                }
            });

            vscode.window.showInformationMessage("Plugin is Loaded.Please reboot vscode.");
        }
    });
}

function rewritePluginList(uid){
    console.log("rewritePluginList:",uid);
    var pluginlist = getPluginList().split('\n');
    firebaseDatabase.ref().child(uid).set(pluginlist);
    vscode.window.showInformationMessage("Rewrite your Pluginlist on Firebase server is Successful!");
}


function concatArrayRemoveSame(array1,array2){

    if(array1 == null && array2 == null){
        return [];
    }

    var array3 = (array1 == null) ? array2 : (array2 == null ? array1 : array1.concat(array2));
    var array4 = array3.filter(function (x, i, self) {
        return self.indexOf(x) === i;
    });

    return array4;
}
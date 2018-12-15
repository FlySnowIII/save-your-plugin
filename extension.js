// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
// const path = require('path');
const request = require('request');
const execSync = require('child_process').execSync;
var exec = require('child_process').exec;


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

    /**
     *
     */
    let loginorRegist_subscription = vscode.commands.registerCommand('extension.loginorRegist', function (){
        var URL = 'https://us-central1-vscode-save-your-plugin.cloudfunctions.net/logincreate';

        vscode.window.showInputBox({ placeHolder: "Please input your Email for Login or Register" }).then(useremail => {
            vscode.window.showInputBox({ placeHolder: "Please input your password for Login or Register" }).then(password => {
                request.post({
                    uri: URL,
                    headers: { "Content-type": "application/json" },
                    json: {
                        email:useremail,
                        password:password
                    }
                }, (err, res, data) => {
                    console.log(data);
                    if (data.hasOwnProperty('code')) {
                        vscode.window.showErrorMessage("Sorry, Register is falied. Please change other email and try again.");
                        return;
                    }

                    vscode.window.showInformationMessage("Login Successful: "+useremail+". Please wait a moment.");
                    uploadyourplugin(data);
                });
            });

        });
    });
    context.subscriptions.push(loginorRegist_subscription);

    let removeAllPlugin_subscription = vscode.commands.registerCommand('extension.removeAllPlugin', function(){
        var pluginlist = getPluginList().split('\n');

        vscode.window.withProgress({
            location:vscode.ProgressLocation.Notification,
            title:'Remove Plugin: ',
            cancellable:false
        }, async (progress, token)=>{
    
            progress.report({ increment: 0,message: pluginlist.length+" plugin will be remove."});
    
            var posentNum = pluginlist.length/100;
    
            const someProcedure = async n =>
            {
                for (let i = 0; i < pluginlist.length; i++) {
                    const x = await new Promise(r => {
                        removePlugin(pluginlist[i]).then(returnObj=>{
                            progress.report({ increment: posentNum*i,message: returnObj});
                            r();
                        })
                    })
                    console.log (i);
                }
                return 'done'
            }
    
            await someProcedure(pluginlist.length).then(x => console.log(x))
    
            console.log("Over");
            vscode.window.showInformationMessage("All Plugin was Removed. Please Reload Window.", { modal: false }, 'Reload','Close')
            .then(result => {
                if(result == "Reload"){
                    console.log("Windows will reload");
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });
    
        });

    });
    context.subscriptions.push(removeAllPlugin_subscription);

    /**
     *
     */
    let rewritePluginlistfromThisWorkplace_subscription = vscode.commands.registerCommand('extension.rewritePluginListOnServer', function (){
        var pluginlist = getPluginList().split('\n');

        var URL = 'https://us-central1-vscode-save-your-plugin.cloudfunctions.net/logincreate';

        vscode.window.showInputBox({ placeHolder: "Please input your Email for Login or Register" }).then(useremail => {
            vscode.window.showInputBox({ placeHolder: "Please input your password for Login or Register" }).then(password => {
                request.post({
                    uri: URL,
                    headers: { "Content-type": "application/json" },
                    json: {
                        email:useremail,
                        password:password,
                        pluginlist:pluginlist
                    }
                }, (err, res, data) => {
                    console.log(data);
                    if (data.hasOwnProperty('code')) {
                        vscode.window.showErrorMessage("Sorry, Register is falied. Please change other email and try again.");
                        return;
                    }

                    vscode.window.showInformationMessage("Rewrite your Pluginlist on Firebase server is Successful!");
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
    return new Promise(function(resolve,reject){
        exec('code --install-extension '+str_extension_id,{cwd:process.cwd()}, function (error, stdout, stderr) {
            if(stderr){
                console.log('stderr: ' + stderr);
                reject(error);
                return;
            }
            if (error !== null) {
                console.log('Exec error: ' + error);
                reject(error);
                return;
            }
            console.log('stdout: ' + stdout);
            resolve(stdout.toString());
        });
    });

}

// --uninstall-extension (<extension-id>)
function removePlugin(str_extension_id = null){
    return new Promise(function(resolve,reject){
        if(str_extension_id != 'pengfeit.save-your-plugin'){
            exec('code --uninstall-extension '+str_extension_id,{cwd:process.cwd()}, function (error, stdout, stderr) {
                if(stderr){
                    console.log('stderr: ' + stderr);
                    reject(error);
                    return;
                }
                if (error !== null) {
                    console.log('Exec error: ' + error);
                    reject(error);
                    return;
                }
                console.log('stdout: ' + stdout);
                resolve(stdout.toString());
            });
        }
    });

}


function uploadyourplugin(dataObj){
    var pluginlist = getPluginList().split('\n');
    var concatPluginList = pluginlist;
    var installedPluginArray = [];
    var upload_URL = "https://us-central1-vscode-save-your-plugin.cloudfunctions.net/uploadpluginlist";

    if(dataObj.data.length<1){
        request.post({
            uri: upload_URL,
            headers: { "Content-type": "application/json" },
            json: {
                uid:dataObj.uid,
                pluginlist:pluginlist
            }
        }, (err, res, data) => {
            console.log(data);
            if (data.hasOwnProperty('code')) {
                vscode.window.showErrorMessage("Sorry, Register is falied. Please change other email and try again.");
                return;
            }
            vscode.window.showInformationMessage("Your workplace is the newest. And First time Upload your plugin Successful!");

        });
        return;
    }

    concatPluginList = concatArrayRemoveSame(pluginlist,dataObj.data);

    dataObj.data.forEach(element => {
        if(-1 == pluginlist.indexOf(element) && element.length>0){
            installedPluginArray.push(element);
        }
    });

    if(installedPluginArray.length == 0){
        vscode.window.showInformationMessage("Your workplace is the newest.");
        return ;
    }

    request.post({
        uri: upload_URL,
        headers: { "Content-type": "application/json" },
        json: {
            uid:dataObj.uid,
            pluginlist:concatPluginList
        }
    }, (err, res, data) => {
        console.log(data);

    });



    vscode.window.withProgress({
        location:vscode.ProgressLocation.Notification,
        title:'Install new plugin: ',
        cancellable:false
    }, async (progress, token)=>{

        progress.report({ increment: 0,message: installedPluginArray.length+" plugin will be installed."});

        var posentNum = installedPluginArray.length/100;

        const someProcedure = async n =>
        {
            console.log("SSSSSSSSSSSSSSSSSTart");
            for (let i = 0; i < installedPluginArray.length; i++) {
                const x = await new Promise(r => {
                    installPlugin(installedPluginArray[i]).then(returnObj=>{
                        progress.report({ increment: posentNum*i,message: returnObj});
                        r();
                    })
                })
                console.log (i);
            }
            return 'done'
        }

        await someProcedure(installedPluginArray.length).then(x => console.log(x))

        console.log("Over");
        vscode.window.showInformationMessage("Plugin is installed.Please Reload Window.", { modal: false }, 'Reload','Close')
        .then(result => {
            if(result == "Reload"){
                console.log("Windows will reload");
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        });

    });


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
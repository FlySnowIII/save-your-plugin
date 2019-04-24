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
        vscode.window.showInformationMessage(`You have ${getPluginList().length-1} plugins in this machine.`);
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
        let pluginlist = getPluginList();
        vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Plugin is Removing",
			cancellable: true
		}, async (progress, token) => {
			token.onCancellationRequested(() => {
				console.log("User canceled the long running operation")
			});

            progress.report({ increment: 0 });

            for (let index = 0; index <= pluginlist.length; index++) {
                //Forが終わったら、非同期操作を終わらせるための処理
                if(index == pluginlist.length){
                    return new Promise(resolve => resolve('Over'));
                }
                const element = pluginlist[index];

                // await new Promise((resolve,reject)=>{
                //     setTimeout(() => {
                //         progress.report({ increment: (index+1)*3/pluginlist.length, message: `I am long running! - still going...${index}...${(index+1)*5/pluginlist.length}%...length:${pluginlist.length}` });
                //         resolve();
                //     }, 1000);
                // })
                console.log('Start-------------');
                await removePlugin(element);
                progress.report({ increment: (index+1)*3/pluginlist.length, message: `(${index+1}/${pluginlist.length}):${element}` });
                console.log('End-------------');

            }

        })
        .then((val)=>{
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
        var pluginlist = getPluginList();

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
        return result.toString().split('\n');

}

// --install-extension (<extension-id>)
function installPlugin(str_extension_id = null){
    return new Promise(function(resolve,reject){
        exec('code --install-extension '+str_extension_id,{cwd:process.cwd()}, function (error, stdout, stderr) {
            if(stderr){
                console.log('stderr: ' + stderr.toString());
                resolve(stderr.toString());
                return;
            }
            if (error !== null) {
                console.log('Exec error: ' + error.toString());
                resolve(error.toString());
                return;
            }
            console.log('stdout: ' + stdout.toString());
            resolve(stdout.toString());
        });
    });

}

// --uninstall-extension (<extension-id>)
function removePlugin(str_extension_id = null){
    return new Promise(function(resolve,reject){
        if(str_extension_id != 'pengfeit.save-your-plugin'){
            console.log("str_extension_id:",str_extension_id);
            exec('code --uninstall-extension '+str_extension_id,{cwd:process.cwd()}, function (error, stdout, stderr) {
                if(stderr){
                    console.log('stderr: ' + stderr.toString());
                    resolve(stderr.toString());
                    return;
                }
                if (error !== null) {
                    console.log('Exec error: ' + error.toString());
                    resolve(error.toString());
                    return;
                }
                console.log('stdout: ' + stdout.toString());
                resolve(stdout.toString());
            });
        }
        else{
            resolve("Save your plugin");
        }
    });
}


function uploadyourplugin(dataObj){
    var localpluginlist = getPluginList();
    var upload_URL = "https://us-central1-vscode-save-your-plugin.cloudfunctions.net/uploadpluginlist";

    //1. まずFirebase上のデータをチェックする
    //Firebase上もしデータがなかったら、ローカルにあるプラグインリストをFirebaseにアップロードする
    if(dataObj.data.length<1){
        request.post({
            uri: upload_URL,
            headers: { "Content-type": "application/json" },
            json: {
                uid:dataObj.uid,
                pluginlist:localpluginlist
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

    let firebasepluginlist = dataObj.data;
    let difference = firebasepluginlist.concat(localpluginlist).filter(v => firebasepluginlist.includes(v) && !localpluginlist.includes(v)) // [1,3]
    let union = firebasepluginlist.concat(localpluginlist.filter(v => !firebasepluginlist.includes(v)))
    difference.splice(difference.findIndex(v => v === ""), 1);
    union.splice(union.findIndex(v => v === ""), 1);

    //2. Firebaseとローカルのプラグインリストを照合し、もし差分がなかったらプログラムを中止する
    if(difference.length == 0){
        vscode.window.showInformationMessage("Your workplace is the newest.");
        return ;
    }

    //3.1 もし差分があった場合、まず合併したプラグインリストをFirebaseへ更新する
    request.post({
        uri: upload_URL,
        headers: { "Content-type": "application/json" },
        json: {
            uid:dataObj.uid,
            pluginlist:union
        }
    }, (err, res, data) => {
        console.log(data);
    });

    //3.2 差分のプラグインをインストールする
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Plugin Install",
        cancellable: true
    }, async (progress, token) => {
        token.onCancellationRequested(() => {
            console.log("User canceled the long running operation")
        });

        progress.report({ increment: 0 });

        for (let index = 0; index <= difference.length; index++) {
            //Forが終わったら、非同期操作を終わらせるための処理
            if(index == difference.length){
                return new Promise(resolve => resolve('Over'));
            }
            const element = difference[index];

            console.log('Start-------------');
            try {
                await installPlugin(element);
            } catch (error) {
            }
            progress.report({ increment: (index+1)*3/difference.length, message: `(${index+1}/${difference.length}):${element}` });
            console.log('End-------------');

        }

    })
    .then((val)=>{
        vscode.window.showInformationMessage("Plugin is installed.Please Reload Window.", { modal: false }, 'Reload','Close')
        .then(result => {
            if(result == "Reload"){
                console.log("Windows will reload");
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        });
    });


}

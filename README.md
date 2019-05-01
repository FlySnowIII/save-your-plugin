# Save Your Plugin

v.0.0.10 by Pengfei Tang 2019.05.01

This Plugin can help you to save your plugin list on Cloud and Download your plugin list when you will set another computer.

There are three command you can use(Press Ctrl + Shitf + P, and input that):

1.You can use this command to get plugin list which you instaled in this computer.

    saveplugin:Get Plugin List from this computer

2.Sync your plugin list from Cloud.If there are some new data in Cloud, that will install new plugin for you.

    saveplugin:Download Your Plugin from Cloud Server

3.Just upload plugin list from this computer. Cloud data will be reset.

    saveplugin:Upload Your Plugin List Base from this computer

4.Remove all plugin

    saveplugin:Remove all plugin

-----------------------------
日本語：

ディスクトップパソコンに色んないいプラグインをインストールしたのに、社外でノートパソコンを使って作業すると使いこなしたプラグインが一個もないという絶望を体験したことはあるでしょうか。その問題点を解決するために当プラグインを開発しました。

Emailアドレスがあれば、インストールしたプラグインをクラウド上にバックアップすることができ、そしてほかのパソコンにてクラウドにバックアップしたプラグインを一括でインストールすることができます。

操作方法：

    基本: Ctrl + Shift + P (Windows) / Cmd + Shift + P (Mac)

1.インストールしたプラグイン一覧を表示する：

    saveplugin:Get Plugin List from this computer

2.クラウドにあるプラグインリストを同期し、このPCがないプラグインを一括インストールする：

    saveplugin:Download Your Plugin from Cloud Server

3.このPCのプラグインリストを基準として、クラウド上のデータを上書きする：

    saveplugin:Upload Your Plugin List Base from this computer

----------------------------

中文：

在公司的台式机安装好多好用的VSCode插件，突然被客户叫去调试的时候发现手里拿的笔记本电脑里什么插件也没有...这种惆怅又绝望的感受不知道大家有过没。为解决这种问题，这个插件应运而生。

你只需要提供一个Email地址，便可将你工作环境的插件列表上传到云端保存(Firebase)。

操作方法：

    基础操作(激活命令执行面板): Ctrl + Shift + P (Windows) / Cmd + Shift + P (Mac)

1.查看本机安装过的插件列表：

    saveplugin:Get Plugin List from this computer

2.将本机的插件列表同步到云端备份，并自动安装云端存在但本机尚未安装的插件：

    saveplugin:Download Your Plugin from Cloud Server

3.将本机插件列表作为基准，重写云端备份的插件列表：

    saveplugin:Upload Your Plugin List Base from this computer

----------------------------
## History

v 0.0.10: Fix bug: npm ERR! 404 Not Found: event-stream@3.3.6

v 0.0.9: Fix some bug when install plugin, and make source code better.

v 0.0.7: Fix some bug

v 0.0.6: Add "Remove All Plugin"

v 0.0.5: Souce Diet

v 0.0.4: Add "Reload Button" at the last showInformationMessage box.

v 0.0.3: 在插件安装过程中加入滚动条同步显示功能
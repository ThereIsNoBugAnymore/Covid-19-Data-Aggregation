window.onload = function() {
    var tbody = $("#tbody").get(0);
    $.ajax({
        url: '/getAllUser',
        method: 'POST',
        dataType: 'JSON',
        success: function(res) {
            if (res.status_code == 200) {
                var data = res.data;
                for (index in data) {
                    var id = data[index].id;
                    var account = data[index].account;
                    var tr = newTr(id, account);
                    tbody.appendChild(tr);
                }
                // 修改
                $(".btn-update").click(function() {
                    var tr = this.parentNode.parentNode.parentNode;
                    var id = tr.firstChild.innerText;
                    var account = tr.firstChild.nextSibling.innerText;
                    $("#id_update").val(id);
                    $("#account_update").val(account);
                    $("#updatePage").show();
                })
                // 删除
                $(".btn-del").click(function() {
                    var tr = this.parentNode.parentNode.parentNode;
                    var id = tr.firstChild.innerText;
                    $.ajax({
                        url: 'delUser',
                        type: 'post',
                        data: {
                            'id': id
                        },
                        success: function() {
                            window.location.reload();
                        }
                    })
                })
            } else {
                alert("查询失败");
            }
        }
    })
}

function hiddenAddPage() {
    $("#addPage").hide();
}

function showAddPage() {
    $("#addPage").show();
}

function hiddenUpdatePage() {
    $("#updatePage").hide();
}

// 添加用户
function addUser() {
    var account = $("#account_add").val();
    var pwd = $("#pwd_add").val();
    var repwd = $("#repwd_add").val();
    if (account == '' || pwd == '' || repwd == '') {
        alert("信息不完整");
        return;
    }
    if (pwd != repwd) {
        alert("密码不一致！");
        return;
    }
    $.ajax({
        url: '/register',
        type: 'post',
        data: {
            'account': account,
            'password': pwd
        },
        dataType: 'json',
        success: function(data) {
            if (data.status) {
                window.location.reload(true);
            } else {
                alert(data.message);
            }
        },
        error: function(xhr, message, exception) {
            alert(message);
        }
    })
}

// 修改用户信息
function updateUser() {
    var id = $("#id_update").val();
    var account = $("#account_update").val();
    var pwd = $("#pwd_update").val();
    var repwd = $("#repwd_update").val();
    if (account == '' || pwd == '' || repwd == '') {
        alert("信息不完整");
        return;
    }
    if (pwd != repwd) {
        alert("密码不一致");
        return;
    }
    $.ajax({
        url: '/updateUser',
        type: 'post',
        data: {
            'id': id,
            'account': account,
            'password': pwd
        },
        success: function(res) {
            if (res.status_code == 200) {
                window.location.reload();
            } else {
                alert(res.message);
            }
        }
    })
}

function search() {
    var key = $("#key").val();
    if (key == '') {
        alert("请输入关键字");
        return;
    }
    var tbody = $("#tbody").get(0);
    $.ajax({
        url: '/searchUser',
        type: 'post',
        data: {
            'key': key
        },
        dataType: 'json',
        success: function(res) {
            if (res.status_code == 200) {
                tbody.innerHTML = "";
                var id = res.data.id;
                var account = res.data.account;
                var tr = newTr(id, account);
                tbody.appendChild(tr);
                // 修改
                $(".btn-update").click(function() {
                    var tr = this.parentNode.parentNode.parentNode;
                    var id = tr.firstChild.innerText;
                    var account = tr.firstChild.nextSibling.innerText;
                    $("#id_update").val(id);
                    $("#account_update").val(account);
                    $("#updatePage").show();
                })
                // 删除
                $(".btn-del").click(function() {
                    var tr = this.parentNode.parentNode.parentNode;
                    var id = tr.firstChild.innerText;
                    $.ajax({
                        url: 'delUser',
                        type: 'post',
                        data: {
                            'id': id
                        },
                        success: function() {
                            window.location.reload();
                        }
                    })
                })
            } else {
                alert(res.message);
            }
        }
    })
}

function newTr(id, account) {
    var tr = document.createElement("tr");
    var td_id = document.createElement("td");
    td_id.innerText = id;
    var td_account = document.createElement("td");
    td_account.innerText = account;
    var td_option = document.createElement("td");
    var div = document.createElement("div");
    var btn_update = document.createElement("button");
    btn_update.setAttribute("class", "btn btn-primary btn-update");
    btn_update.innerText = "修改";
    var btn_del = document.createElement("button");
    btn_del.setAttribute("class", "btn btn-danger btn-del");
    btn_del.innerText = "删除";
    div.appendChild(btn_update);
    div.appendChild(btn_del);
    td_option.appendChild(div);
    tr.appendChild(td_id);
    tr.appendChild(td_account);
    tr.appendChild(td_option);
    return tr;
}
window.onload = function() {
    var tbody = $("#tbody").get(0);
    $.ajax({
        url: '/getAllTopic',
        type: 'post',
        dataType: 'json',
        success: function(res) {
            if (res.status_code == 200) {
                data = res.data;
                for (index in data) {
                    var id = data[index].id;
                    var topic = data[index].topic;
                    var time = data[index].time;
                    var tr = newTr(id, topic, time);
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
                        url: 'delTopic',
                        type: 'post',
                        data: {
                            'id': id
                        },
                        dataType: 'json',
                        success: function(res) {
                            window.location.reload();
                        }
                    })
                })
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

// 添加主题
function addTopic() {
    var topic = $("#topic_add").val();
    if (topic == '') {
        alert("请填写主题信息！");
        return;
    }
    $.ajax({
        url: '/addTopic',
        type: 'post',
        data: {
            'topic': topic
        },
        dataType: 'json',
        success: function() {
            window.location.reload();
        }
    })
}

// 修改话题
function updateTopic() {
    var id = $("#id_update").val();
    var topic = $("#topic_update").val();
    if (id == '' || topic == '') {
        alert("信息不完整");
        return;
    }
    $.ajax({
        url: '/updateTopic',
        type: 'post',
        data: {
            'id': id,
            'topic': topic
        },
        dataType: 'json',
        success: function(res) {
            window.location.reload();
        }
    })
}

// 查询话题
function search() {
    var key = $("#key").val();
    if (key == '') {
        alert("请输入关键字");
        return;
    }
    var tbody = $("#tbody").get(0);
    $.ajax({
        url: '/searchTopic',
        type: 'post',
        data: {
            'key': key
        },
        dataType: 'json',
        success: function(res) {
            if (res.status_code == 200) {
                tbody.innerHTML = "";
                var data = res.data;
                for (index in data) {
                    var id = data[index].id;
                    var topic = data[index].topic;
                    var time = data[index].time;
                    var tr = newTr(id, topic, time);
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
                        url: 'delTopic',
                        type: 'post',
                        data: {
                            'id': id
                        },
                        dataType: 'json',
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

function newTr(id, topic, time) {
    var tr = document.createElement("tr");

    var td_id = document.createElement("td");
    td_id.innerText = id;

    var td_topic = document.createElement("td");
    td_topic.innerText = topic;

    var td_time = document.createElement("td");
    td_time.innerText = time;

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
    tr.appendChild(td_topic);
    tr.appendChild(td_time);
    tr.appendChild(td_option);
    return tr;
}
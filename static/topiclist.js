window.onload = function() {
    var div = $("#listContainer").get(0);
    $.ajax({
        url: '/getAllTopic',
        type: 'post',
        dataType: 'json',
        success: function(res) {
            if (res.status_code == 200) {
                var data = res.data;
                for (index in data) {
                    var id = data[index].id;
                    var topic = data[index].topic;
                    var num = data[index].commentNum;
                    var a = newItem(id, topic, num);
                    div.appendChild(a);
                }
            }
        }
    })
}

function newItem(id, topic, num) {
    var a = document.createElement("a");
    a.setAttribute("href", "comment.html?id=" + id);
    a.setAttribute("target", "_blank");
    a.setAttribute("class", "list-group-item");
    a.innerText = topic;
    var span = document.createElement("span");
    span.setAttribute("class", "badge");
    span.innerText = num;
    a.appendChild(span);
    return a;
}
function showUserManagePage() {
	resetNav();
	$("#userNav").addClass("active");
	var iframe = $("#iframe").get(0);
	iframe.setAttribute("src", "usermanage.html");
}

function showTopicManagePage() {
	resetNav();
	$("#topicNav").addClass("active");
	var iframe = $("#iframe").get(0);
	iframe.setAttribute("src", "topicmanage.html");
}

function showTopicList() {
	resetNav();
	$("#commentNav").addClass("active");
	var iframe = $("#iframe").get(0);
	iframe.setAttribute("src", "topiclist.html");
}

function resetNav() {
	$("#userNav").removeAttr("class");
	$("#topicNav").removeAttr("class");
	$("#commentNav").removeAttr("class");
}

// 注销
function logout() {
    $.ajax({
        url: "/logout",
        type: "POST",
        success: function(data) {
            if (data.status) {
                window.location.replace('/home.html');
            } else {
                alert("状态异常");
            }
        },
        error: function(xhr, message, exception) {
            alert(message);
        }
    })
}
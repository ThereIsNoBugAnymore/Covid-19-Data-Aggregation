window.onload = function() {
	var ul = $("#ul").get(0);
	// 删除
	$(".del").click(function() {
		var div = this.parentNode;
		// console.log(div.firstChild.nextSibling);
		// console.log(div.firstChild.nextSibling.nextSibling);
		// console.log(div.firstChild.nextSibling.nextSibling.nextSibling);
		// var account = div.firstChild.innerText;
		var account = div.firstChild.nextSibling.innerText;
		var content = div.firstChild.nextSibling.nextSibling.nextSibling.innerText;
		var href = window.location.href;
		var id = href.split('=')[1];
		$.ajax({
			url: '/delComment',
			type: 'post',
			data: {
				'id': id,
				'account': account,
				'comment': content
			},
			success: function(res) {
				window.location.reload();
			}
		})
	})
}

function newItem(account, content) {
	var div = document.createElement("div");
	div.setAttribute("class", "commentItem");

	var li_account = document.createElement("li");
	li_account.setAttribute("class", "list-group-item account");
	li_account.innerText = account;

	var li_content = document.createElement("li");
	li_content.setAttribute("class", "list-group-item content");
	li_content.innerText = content;

	var button = document.createElement("button");
	button.setAttribute("class", "btn btn-danger del");
	button.innerText = "删除";

	div.appendChild(li_account);
	div.appendChild(li_content);
	div.appendChild(button);
	return div;
}

function submitComment() {
	var content = $("#comment").val();
	if (content == '') {
		alert("请填写评论内容");
		return;
	}
	var url = window.location.href;
	var id = url.split('=')[1];
	$.ajax({
		url: '/submitComment',
		type: 'post',
		data: {
			'id': id,
			'comment': content
		},
		dataType: 'json',
		success: function(res) {
			if (res.status_code == 200) {
				window.location.reload();
			} else {
				window.location.href="/login.html";
			}
		}
	})
}
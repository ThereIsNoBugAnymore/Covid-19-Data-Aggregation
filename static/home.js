var page = 1;
var url = ''

window.onload = function() {
    showEpidemicData();
    $("#dropdownMenu1").hover(
        function() {
            $("#dropDownCur").show();
            $.ajax({
                url: '/getHistory',
                type: 'post',
                dataType: 'json',
                success: function(data) {
                    if (data.status_code == 200) {
                        newsList = data.data;
                        historyContainer = $("#dropDownCur").get(0);
                        historyContainer.innerHTML = "";
                        for (index in newsList) {
                            title = newsList[index].title;
                            time = newsList[index].time;
                            url = newsList[index].url;
                            var li = document.createElement("li");
                            li.setAttribute("style", "display: flex; width: 500px");
                            var a_title = document.createElement("a");
                            a_title.setAttribute("href", url);
                            a_title.setAttribute("target", "_blank");
                            a_title.setAttribute("style", "width: 350px; overflow: hidden; float: left; text-overflow: ellipsis; padding: 3px 8px;");
                            a_title.innerText = title;
                            var a_time = document.createElement("a");
                            a_time.setAttribute("href", url);
                            a_time.setAttribute("target", "_blank");
                            a_time.setAttribute("style", "width: 150px; float: left; padding: 3px 8px;");
                            a_time.innerText = time;
                            li.appendChild(a_title);
                            li.appendChild(a_time);
                            historyContainer.appendChild(li);
                        }
                    } else {
                        alert(data.message);
                    }
                },
                error: function(xhr, message, exception) {
                    alert(message);
                }
            });
        });
    $("#dropDownCur").hover(function() {
        $(this).show();
    }, function() {
        $(this).hide();
    });
}

function resetNav() {
    $("#dataNav").removeAttr("class");
    $("#fakeNewsNav").removeAttr("class");
    $("#realTimeNav").removeAttr("class");
    $("#reWorkNav").removeAttr("class");
    $("#emergenceNav").removeAttr("class");
    $("#topicNav").removeAttr("class");
}

function showEpidemicData() {
    resetNav();
    $("#dataNav").addClass("active");
    var container = $(".container").get(0);
    container.innerHTML = '';
    $.ajax({
        url: '/loadEpidemic',
        type: 'post',
        dataType: 'json',
        success: function(data) {
            if (data.status_code == 200) {
                var deadline = data.data.deadline;

                var allData = data.data.allData
                createAllDataTable(allData, deadline);

                var areaData = data.data.area;
                createAreaDataTable(areaData);

                var overseasData = data.data.overseasData;
                createOverseasDataTable(overseasData, deadline);

                var epidemicData = data.data.overseas;
                createEpidemicDataTable(epidemicData);

            } else {
                alert(data.message);
            }
        },
        error: function(xhr, message) {
            alert(message);
        }
    })
}

function createAllDataTable(allData, deadline) {
    var container = $(".container");
    var allDatatable = $('<h4 style="text-align: center; font-weight: bolder;">国内疫情总况<font style="font-size: x-small;">(' + deadline + ')</font></h4><table class="table table-hover table-striped"><thead><tr><th>现有确诊</th><th>累计确诊</th><th>累计治愈</th><th>累计死亡</th></tr></thead><tbody id="allDataContainer"></tbody></table>');
    container.append(allDatatable);
    var allDataContainer = $("#allDataContainer");
    var tr = $('<tr></tr>');
    var td_diagnosed = $('<td><font style="color: red; font-weight: bold; font-size: 20px;">' + allData.diagnosed + '</font></td>')
    var td_currentConfirmedCount = $('<td><font style="color: #E25D4F; font-weight: bold; font-size: 20px;">' + allData.currentConfirmedCount + '</font></td>')
    var td_cured = $('<td><font style="color: #77B634; font-weight: bold; font-size: 20px;">' + allData.cured + '</font></td>')
    var td_death = $('<td><font style="color: grey; font-weight: bold; font-size: 20px;">' + allData.death + '</font></td>')
    tr.append(td_currentConfirmedCount);
    tr.append(td_diagnosed);
    tr.append(td_cured);
    tr.append(td_death);
    allDataContainer.append(tr);
}

function createAreaDataTable(areaData) {
    var container = $(".container");
    var areatable = $('<h4 style="text-align: center; font-weight: bolder;">国内疫情</h4><table class="table table-hover table-striped"><thead><tr><th>地区</th><th>现有确诊</th><th>累计确诊</th><th>治愈</th><th>死亡</th><th>增长情况</th></tr></thead><tbody id="areaDataContainer"></tbody></table>');
    container.append(areatable);
    var areaDataContainer = $("#areaDataContainer");
    for (index in areaData) {
        provinceName = areaData[index].provinceName;
        currentConfirmedCount = areaData[index].currentConfirmedCount;
        confirmedCount = areaData[index].confirmedCount;
        curedCount = areaData[index].curedCount;
        deadCount = areaData[index].deadCount;
        increase = areaData[index].increase;
        var tr = document.createElement("tr");
        var td_country = document.createElement("td");
        td_country.innerText = provinceName;
        var td_confirmedIncr = document.createElement("td");
        td_confirmedIncr.setAttribute("class", "confirmedIncrRow");
        td_confirmedIncr.innerText = currentConfirmedCount;
        var td_confirmedCount = document.createElement("td");
        td_confirmedCount.setAttribute("class", "confirmedCountRow");
        td_confirmedCount.innerText = confirmedCount;
        var td_curedCount = document.createElement("td");
        td_curedCount.setAttribute("class", "curedRow");
        td_curedCount.innerText = curedCount;
        var td_deadCount = document.createElement("td");
        td_deadCount.setAttribute("class", "deathRow");
        td_deadCount.innerText = deadCount;
        var td_increase = document.createElement("td");
        td_increase.innerText = increase;
        tr.appendChild(td_country);
        tr.appendChild(td_confirmedIncr);
        tr.appendChild(td_confirmedCount);
        tr.appendChild(td_curedCount);
        tr.appendChild(td_deadCount);
        tr.appendChild(td_increase);
        areaDataContainer.append(tr);
    }
}

function createOverseasDataTable(overseasData, deadline) {
    var container = $(".container");
    var allDatatable = $('<h4 style="text-align: center; font-weight: bolder;">国外疫情总况<font style="font-size: x-small;">(' + deadline + ')</font></h4><table class="table table-hover table-striped"><thead><tr><th>新增确诊</th><th>累计确诊</th><th>累计治愈</th><th>累计死亡</th></tr></thead><tbody id="overseasDataContainer"></tbody></table>');
    container.append(allDatatable);
    var allDataContainer = $("#overseasDataContainer");
    var tr = $('<tr></tr>');
    var td_diagnosed = $('<td><font style="color: red; font-weight: bold; font-size: 20px;">' + overseasData.confirmedIncr + '</font></td>')
    var td_currentConfirmedCount = $('<td><font style="color: #E25D4F; font-weight: bold; font-size: 20px;">' + overseasData.confirmedCount + '</font></td>')
    var td_cured = $('<td><font style="color: #77B634; font-weight: bold; font-size: 20px;">' + overseasData.curedCount + '</font></td>')
    var td_death = $('<td><font style="color: grey; font-weight: bold; font-size: 20px;">' + overseasData.deadCount + '</font></td>')
    tr.append(td_currentConfirmedCount);
    tr.append(td_diagnosed);
    tr.append(td_cured);
    tr.append(td_death);
    allDataContainer.append(tr);
}

function createEpidemicDataTable(epidemicData) {
    var container = $(".container");
    var table = $('<h4 style="text-align: center; font-weight: bolder;">国际疫情</h4><table class="table table-hover table-striped"><thead><tr><th>地区</th><th>新增确诊</th><th>确诊</th><th>治愈</th><th>死亡</th></tr></thead><tbody id="tableDataContainer"></tbody></table>');
    container.append(table);
    var tableDataContainer = $("#tableDataContainer");
    for (index in epidemicData) {
        country = epidemicData[index].country;
        confirmedIncr = epidemicData[index].confirmedIncr;
        confirmedCount = epidemicData[index].confirmedCount;
        curedCount = epidemicData[index].curedCount;
        deadCount = epidemicData[index].deadCount;
        var tr = document.createElement("tr");
        var td_country = document.createElement("td");
        td_country.innerText = country;
        var td_confirmedIncr = document.createElement("td");
        td_confirmedIncr.setAttribute("class", "confirmedIncrRow");
        td_confirmedIncr.innerText = confirmedIncr;
        var td_confirmedCount = document.createElement("td");
        td_confirmedCount.setAttribute("class", "confirmedCountRow");
        td_confirmedCount.innerText = confirmedCount;
        var td_curedCount = document.createElement("td");
        td_curedCount.setAttribute("class", "curedRow")
        td_curedCount.innerText = curedCount;
        var td_deadCount = document.createElement("td");
        td_deadCount.setAttribute("class", "deathRow");
        td_deadCount.innerText = deadCount;
        tr.appendChild(td_country);
        tr.appendChild(td_confirmedIncr);
        tr.appendChild(td_confirmedCount);
        tr.appendChild(td_curedCount);
        tr.appendChild(td_deadCount);
        tableDataContainer.append(tr);
    }
}

// 辟谣信息
function showFakeNews() {
    resetNav();
    $("#fakeNewsNav").addClass("active");
    page = 0;
    url = '/loadFakeNews';
    showNextPage(true);
}

// 实时播报
function showRealTimeNews() {
    resetNav();
    $("#realTimeNav").addClass("active");
    page = 0;
    url = '/loadRealTimeNews';
    showNextPage(true);
}

// 复工信息
function showReworkNews() {
    resetNav();
    $("#reWorkNav").addClass("active");
    page = 0;
    url = '/loadReworkNews';
    showNextPage(false);
}

// 紧急援助
function showEmergenceNews() {
    resetNav();
    $("#emergenceNav").addClass("active");
    page = 0;
    url = '/loadEmergenceNews';
    showNextPage(false);

}

// 评论区
function showTopic() {
    resetNav();
    $("#topicNav").addClass("active");
    page = 0;
    var container = $(".container").get(0);
    container.innerHTML = "";
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
                    container.appendChild(a);
                }
            }
        }
    })
}

// 话题条目
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

// 下一页
function showNextPage(isShowPageNav) {
    var container = $(".container").get(0);
    container.innerHTML = '';
    page++;
    loadMoreNews(page, isShowPageNav);
}

// 上一页
function showPriviousPage() {
    if (page <= 1) {
        alert("当前为首页！");
        return;
    }
    var container = $(".container").get(0);
    container.innerHTML = '';
    page--;
    loadMoreNews(page, true);
}

// 加载信息
function loadMoreNews(page, isShowPageNav) {
    var container = $(".container");
    $.ajax({
        url: url,
        type: 'post',
        data: {
            'page': page
        },
        dataType: 'json',
        success: function(data) {
            if (data.status_code == 200) {
                var newsList = data.data;
                for (index in newsList) {
                    var title = newsList[index].title;
                    var author = newsList[index].author;
                    var date = newsList[index].date;
                    var url = newsList[index].url;
                    var id = newsList[index]._id;
                    var img = newsList[index].img;
                    var summary = newsList[index].summary;
                    var newsItem = undefined;
                    if (summary == undefined) {
                        summary = '';
                    }
                    if (img == undefined) {
                        newsItem = createMediaObjectWithoutImg(id, title, summary, author, date, url);
                    } else {
                        newsItem = createMediaObject(id, title, summary, author, date, url, img);
                    }
                    container.append(newsItem);
                }
                if (isShowPageNav) {
                    container.append(createPageNav());
                }
            } else {
                alert(data.message);
                page--;
            }
        },
        error: function(xhr, message) {
            alert(message);
            page--;
        }
    });
}

function createMediaObject(id, title, message, author, date, url, img) {
    var html = '<div class="media"><div class="media-left"><a href="' + url + '" target="_blank" news-id="' + id + '" onclick="addHistory(this)"><img class="media-object" src="' + img + '" alt="' + title + '"></a></div><div class="media-body"><a href="' + url + '" target="_blank" news-id="' + id + '" onclick="addHistory(this)"><h4 class="media-heading">' + title + '</h4></a><a href="' + url + '" target="_blank" news-id="' + id + '" onclick="addHistory(this)">' + message + '</a><div class="media-tail"><div class="source">' + author + '</div><div class="date">' + date + '</div></div></div></div>';
    return $(html);
}


function createMediaObjectWithoutImg(id, title, message, author, date, url) {
    var html = '<div class="media"><div class="media-body"><a href="' + url + '" target="_blank" news-id="' + id + '" onclick="addHistory(this)"><h4 class="media-heading">' + title + '</h4></a><a href="' + url + '" target="_blank" news-id="' + id + '" onclick="addHistory(this)">' + message + '</a><div><div class="source">' + author + '</div><div class="date">' + date + '</div></div></div></div>';
    return $(html);
}


function createPageNav() {
    var html = '<nav aria-label="..."><ul class="pager"><li onclick="showPriviousPage()" class="previous"><a href="#"><span aria-hidden="true">&larr;</span> Older</a></li><li class="next" onclick="showNextPage(true)"><a href="#">Newer <span aria-hidden="true">&rarr;</span></a></li></ul></nav>';
    return $(html);
}

function addHistory(obj) {
    var id = obj.getAttribute("news-id");
    $.ajax({
        url: '/addHistory',
        type: 'post',
        data: {
            'id': id
        }
    })
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
from flask import Flask, request, jsonify, render_template, redirect, url_for, session, make_response
from flask_cors import CORS
import os
from spider import FakeNews, RealTimeNews, ReWork, Emergence, Epidemic, User, Topic
import time
from database import MongoDB

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
CORS(app, resources=r'/*')


# 首页
@app.route('/home.html', methods=['POST', 'GET'])
def homePage():
	isLogin = session.get('isLogin')
	account = None
	if isLogin:
		account = session.get('account')
	return render_template('home.html', isLogin=isLogin, account=account)


# 登录页面
@app.route('/login.html')
def loginPage():
	return render_template('login.html')


# 管理员首页
@app.route('/admin.html')
def adminHomePage():
	isLogin = session.get('isLogin')
	account = session.get('account')
	return render_template('admin.html', isLogin=isLogin, account=account)


# 用户管理
@app.route('/usermanage.html')
def userManage():
	return render_template('usermanage.html')


# 评价
@app.route('/comment.html', methods=['POST', 'GET'])
def comment():
	_id = request.args.get('id')
	topic = Topic()
	topicItem = topic.getTopicById(_id)
	comments = []
	if not topicItem.get('comments') is None:
		comments = topicItem.get('comments')
	isLogin = session.get('isLogin')
	isAdmin = False
	if isLogin:
		isAdmin = session.get('isAdmin')
	return render_template('comment.html', isAdmin=isAdmin, comments=comments)


# 话题列表
@app.route('/topiclist.html')
def topicList():
	return render_template('topiclist.html')


# 话题管理
@app.route('/topicmanage.html')
def topicManage():
	return render_template('topicmanage.html')


# 注册
@app.route('/register', methods=['POST'])
def register():
	account = request.form.get('account')
	password = request.form.get('password')
	user = User()
	isExist = user.checkUser(account, None)
	result = {}
	if not isExist is None:
		result = {'status': False, 'message': '账户已存在'}
	else:
		_id = user.addUser(account, password)
		if _id is None:
			result = {'status': False, 'message': '意料之外的错误'}
		else:
			result = {'status': True}
	return result


# 登录
@app.route('/login', methods=['POST', 'GET'])
def login():
	account = request.form.get('account')
	password = request.form.get('password')
	user = User()
	result = user.checkUser(account, password)
	if not result is None:
		session['id'] = result.get('id')
		session['isLogin'] = True
		session['account'] = account
		if account == 'admin':
			session['isAdmin'] = True
			return redirect(url_for('adminHomePage'))
		else:
			session['isAdmin'] = False
			return redirect(url_for('homePage'))
	else:
		return createErrorMessage("账户或密码错误");


# 注销
@app.route('/logout', methods=['POST'])
def logout():
	try:
		session['id'] = None
		session['isLogin'] = False
		session['account'] = None
		session['isAdmin'] = False
		return jsonify({'status': True})
	except:
		return jsonify({'status': False})


# 加载辟谣信息
@app.route('/loadFakeNews', methods=['POST', 'GET'])
def loadFakeNews():
	page = int(request.form.get('page'))
	# page = int(request.args.get('page'))
	fakeNews = FakeNews()
	newsList = fakeNews.loadMore(page)
	result = None
	if len(newsList) > 0:
		result = createOKMessage(newsList)
	else:
		result = createErrorMessage('暂无更多数据')
	return jsonify(result)


# 加载实时信息
@app.route('/loadRealTimeNews', methods=['POST', 'GET'])
def loadRealTimeNews():
	page = int(request.form.get('page'))
	# page = int(request.args.get('page'))
	realTimeNews = RealTimeNews()
	newsList = realTimeNews.loadMore(page)
	result = None
	if len(newsList) > 0:
		result = createOKMessage(newsList)
	else:
		result = createErrorMessage('暂无更多数据')
	return jsonify(result)


# 加载复工信息
@app.route('/loadReworkNews', methods=['POST', 'GET'])
def loadReworkNews():
	rework = ReWork()
	newsList = rework.loadMore()
	result = None
	if len(newsList) > 0:
		result = createOKMessage(newsList)
	else:
		result = createErrorMessage('暂无更多数据')
	return jsonify(result)


# 加载紧急援助
@app.route('/loadEmergenceNews', methods=['POST', 'GET'])
def loadEmergenceNews():
	emergence = Emergence()
	newsList = emergence.loadMore()
	result = None
	if len(newsList) > 0:
		result = createOKMessage(newsList)
	else:
		result = createErrorMessage('暂无更多数据')
	return jsonify(result)


# 世界疫情数据
@app.route('/loadEpidemic', methods=['POST', 'GET'])
def loadEpidemic():
	epidemic = Epidemic()
	overseasList, areaList, allData, deadline, overseasData = epidemic.loadData()
	result = None
	if (not len(overseasList) > 0) and (not len(areaList) > 0):
		result = createErrorMessage('暂无更多数据')
	else:
		dataList = {
			'overseas': overseasList,
			'area': areaList,
			'allData': allData,
			'deadline': deadline,
			'overseasData': overseasData
		}
		result = createOKMessage(dataList)
	return jsonify(result)


# 添加历史
@app.route('/addHistory', methods=['POST', 'GET'])
def addHistory():
	newsId = request.form.get('id')
	isLogin = session.get('isLogin')
	# 添加历史
	if isLogin:
		userId = session.get('id')
		user = User()
		historyList = user.getHistory(userId)
		if historyList is None:
			historyList = []
		# 访问标志
		hasSeen = False
		for item in historyList:
			# 已访问过
			if newsId == item.get('newsId'):
				hasSeen = True
				break;
		# 未访问，添加历史记录
		if not hasSeen:
			historyItem = {
				'newsId': newsId,
				'time': time.strftime("%Y-%m-%d %H:%M", time.localtime(time.time()))
			}
			historyList.append(historyItem)
			if len(historyList) > 10:
				del historyList[0]
			user.updateHistory(userId, historyList)
		return jsonify({'status_code': 200})
	return jsonify({'status_code': 500})


# 历史内容
@app.route('/getHistory', methods=['POST'])
def getHistory():
	if session.get('isLogin'):
		userId = session.get('id')
		user = User()
		historyArray = user.getHistory(userId)
		mongoDB = MongoDB('news')
		historyList = []
		if not historyArray is None:
			for item in historyArray:
				# 新闻id
				newsId = item.get('newsId')
				# 查询新闻内容
				news = mongoDB.getObjectById(newsId)
				newsItem = {
					'title': news.get('title'),
					'url': news.get('url'),
					'time': item.get('time')
				}
				historyList.append(newsItem)
			return createOKMessage(historyList)
		else:
			return createErrorMessage('暂无数据')


# 查找
@app.route('/search', methods=['POST', 'GET'])
def search():
	keyword = request.form.get('keyword')
	condition = {
		'title': {
			'$regex': '.*' + keyword + '.*'
		}
	}
	mongoDB = MongoDB('news')
	newsList = mongoDB.getObjects(condition)
	return render_template('result.html', newsList=newsList)


# 获取全部用户
@app.route('/getAllUser', methods=['POST', 'GET'])
def getAllUser():
	mongoDB = MongoDB('user')
	userList = []
	userArray = mongoDB.getObjects({'account': {'$regex': '.*'}})
	for user in userArray:
		_id = user.get('id')
		account = user.get('account')
		userList.append({'id': _id, 'account': account})
	return createOKMessage(userList)


# 修改用户
@app.route('/updateUser', methods=['POST', 'GET'])
def updateUser():
	_id = request.form.get('id')
	account = request.form.get('account')
	password = request.form.get('password')
	user = User()
	isExist = user.checkUser(account, None)
	if not isExist is None:
		if (isExist.get('id') != _id):
			return createErrorMessage("账户已存在")
	user.updateUser(_id, account, password)
	return createOKMessage(None)


# 删除用户
@app.route('/delUser', methods=['POST', 'GET'])
def delUser():
	_id = request.form.get('id')
	user = User()
	user.delUser(_id)
	return createOKMessage(None)


# 查找用户
@app.route('/searchUser', methods=['POST', 'GET'])
def searchUser():
	key = request.form.get('key')
	user = User()
	isExist = user.checkUser(key, None)
	if not isExist is None:
		return createOKMessage(isExist)
	return createErrorMessage('不存在该用户')


# 获取全部话题
@app.route('/getAllTopic', methods=['POST', 'GET'])
def getAllTopic():
	topic = Topic()
	topicList = topic.getAllTopic()
	return createOKMessage(topicList)


# 添加话题
@app.route('/addTopic', methods=['POST', 'GET'])
def addTopic():
	topicName = request.form.get('topic')
	topic = Topic()
	topic.addTopic(topicName)
	return createOKMessage(None)


# 删除话题
@app.route('/delTopic', methods=['POST', 'GET'])
def delTopic():
	_id = request.form.get('id')
	topic = Topic()
	topic.delTopic(_id)
	return createOKMessage(None)


# 修改话题
@app.route('/updateTopic', methods=['POST', 'GET'])
def updateTopic():
	_id = request.form.get('id')
	topicName = request.form.get('topic')
	topic = Topic()
	topic.updateTopic(_id, topicName)
	return createOKMessage(None)


# 查找话题
@app.route('/searchTopic', methods=['POST', 'GET'])
def searchTopic():
	key = request.form.get('key')
	topic = Topic()
	topicList = topic.searchTopic(key)
	if len(topicList) > 0:
		return createOKMessage(topicList)
	else:
		return createErrorMessage("无相关话题")


# 提交评论
@app.route('/submitComment', methods=['POST', 'GET'])
def submitComment():
	isLogin = session.get('isLogin')
	if isLogin and (isLogin is not None):
		topicId = request.form.get('id')
		comment = request.form.get('comment')
		account = session.get('account')
		topic = Topic()
		topicItem = topic.getTopicById(topicId)
		commentItem = {
			'account': account,
			'comment': comment
		}
		if topicItem.get('comments') is None:
			topic.saveComment(topicId, [commentItem])
		else:
			comments = topicItem.get('comments');
			comments.append(commentItem)
			topic.saveComment(topicId, comments)
		return createOKMessage(None)
	else:
		return createErrorMessage(None)


# 删除评论
@app.route('/delComment', methods=['POST', 'GET'])
def delComment():
	_id = request.form.get("id");
	account = request.form.get('account')
	comment = request.form.get('comment')
	topic = Topic()
	topicItem = topic.getTopicById(_id)
	comments = topicItem.get('comments')
	comments.remove({'account': account, 'comment': comment})
	topic.saveComment(_id, comments)
	return createOKMessage(None)


def createOKMessage(data):
	result = {
		'status_code': 200,
		'data': data
	}
	return result


def createErrorMessage(message):
	result = {
		'status_code': 500,
		'message': message
	}
	return result


if __name__ == '__main__':
	app.run(host='0.0.0.0', debug=True)
import requests
from lxml import etree
import json
import re
from database import MongoDB
from bson.objectid import ObjectId
import datetime

# 辟谣
class FakeNews(object):
	"""docstring for FakeNews"""
	fakeNewsUrl = 'https://vp.fact.qq.com/loadmore'

	def __init__(self):
		super(FakeNews, self).__init__()
		
	def loadMore(self, page=1):
		fakeNews = requests.get(self.fakeNewsUrl + '?page=' + str(page - 1))
		content = json.loads(fakeNews.text).get('content')
		newsList = []
		collection = MongoDB('news')
		for item in content:
			title = item.get('title')
			author = item.get('author')
			_id = item.get('id')
			date = item.get('date')
			img = item.get('cover')
			url = 'https://vp.fact.qq.com/article?id=' + _id
			news = {
				'title': title,
				'author': author,
				# '_id': _id,
				'date': date,
				'img': img,
				'url': url
			}
			_id = collection.save(news)
			news['_id'] = _id
			newsList.append(news)
		return newsList


# 实时播报
class RealTimeNews(object):
	"""docstring for ClassName"""
	realTimeNewsUrl = 'https://file1.dxycdn.com/2020/0130/492/3393874921745912795-115.json'
	def __init__(self, pageSize = 10):
		super(RealTimeNews, self).__init__()
		res = requests.get(self.realTimeNewsUrl)
		self.data = json.loads(res.text).get('data')
		self.pageSize = pageSize

	def loadMore(self, page=1):
		newsArray = self.data[(page - 1) * self.pageSize: page * self.pageSize]
		newsList = []
		collection = MongoDB('news')
		for newsItem in newsArray:
			title = newsItem.get('title')
			author = newsItem.get('infoSource')
			date = newsItem.get('pubDateStr')
			summary = newsItem.get('summary')
			url = newsItem.get('sourceUrl')
			news = {
				'title': title,
				'author': author,
				'date': date,
				'summary': summary,
				'url': url
			}
			_id = collection.save(news)
			news['_id'] = _id
			newsList.append(news)
		return newsList


# 复工信息
class ReWork(object):
	"""docstring for ReWork"""
	reworkUrl = 'https://view.inews.qq.com/k/NEW2020022703629500?cratype=feiyanh5'
	def __init__(self):
		super(ReWork, self).__init__()

	def loadMore(self):
		res = requests.get(self.reworkUrl).text.replace(' ', '')
		data = re.findall('<script>window.__initData=(.*?);</script>', res)[0].encode('utf-8').decode('unicode_escape').replace('\\', '')
		data = json.loads(data)
		sectionList = data.get('content').get('sectionList')
		newsList = []
		collection = MongoDB('news')
		for section in sectionList:
			newsArray = section.get('newsList')
			for news in newsArray:
				title = news.get('title')
				author = news.get('source')
				date = news.get('pub_time')
				img = news.get('img_small')
				url = news.get('link')
				newsItem = {
					'title': title,
					'author': author,
					'date': date,
					'img': img,
					'url': url
				}
				_id = collection.save(newsItem)
				newsItem['_id'] = _id
				newsList.append(newsItem)
		return newsList


# 紧急援助
class Emergence(object):
	"""docstring for Emegency"""
	emergenceUrl = 'https://sa.sogou.com/new-weball/page/sgs/epidemic?type_page=VR&tdsourcetag=s_pctim_aiomsg'
	def __init__(self):
		super(Emergence, self).__init__()

	def loadMore(self):
		res = requests.get(self.emergenceUrl)
		res.encoding = 'utf-8'
		data = re.findall('window.__INITIAL_STATE__=(.*?)</script>', res.text.replace(' ', ''))[0]
		emergenceList = json.loads(data).get('data').get('columns')[1].get('list')
		newsList = []
		collection = MongoDB('news')
		for item in emergenceList:
			title = item.get('title')
			author = item.get('source')
			date = item.get('up_time')
			img = item.get('img')[2: -2]
			url = item.get('url')
			newsItem = {
				'title': title,
				'author': author,
				'date': date,
				'img': img,
				'url': url
			}
			_id = collection.save(newsItem)
			newsItem['_id'] = _id
			newsList.append(newsItem)
		return newsList


# 疫情数据
class Epidemic(object):
	"""docstring for Epidemic"""
	epidemicUrl = 'https://sa.sogou.com/new-weball/page/sgs/epidemic?type_page=VR&tdsourcetag=s_pctim_aiomsg'
	def __init__(self):
		super(Epidemic, self).__init__()

	def loadData(self):
		res = requests.get(self.epidemicUrl)
		res.encoding = 'utf-8'
		data = re.findall('window.__INITIAL_STATE__=(.*?)</script>', res.text.replace(' ', ''))[0]
		# 截止日期
		deadLine = json.loads(data).get('data').get('domesticStats').get('times')
		# 海外疫情
		overseas = json.loads(data).get('data').get('overseas')
		overseasList = []
		for item in overseas[:20]:
			# 国家
			country = item.get('provinceName')
			# 新增
			confirmedIncr = item.get('confirmedIncr')
			# 总确诊
			confirmedCount = item.get('confirmedCount')
			# 总治愈
			curedCount = item.get('curedCount')
			# 总死亡
			deadCount = item.get('deadCount')
			dataItem = {
				'country': country,
				'confirmedIncr': confirmedIncr,
				'confirmedCount': confirmedCount,
				'curedCount': curedCount,
				'deadCount': deadCount
			}
			overseasList.append(dataItem)
		# 海外情况汇总
		confirmedCountSum = 0; # 确诊总数
		confirmedIncrSum = 0; # 新增总数
		curedCountSum = 0; # 治愈总数
		deadCountSum = 0; # 死亡总数
		for item in overseas:
			try:
				confirmedCountSum = confirmedCountSum + int(item.get('confirmedCount'))
				confirmedIncrSum = confirmedIncrSum + int(item.get('confirmedIncr'))
				curedCountSum = curedCountSum + int(item.get('curedCount'))
				deadCountSum = deadCountSum + int(item.get('deadCount'))
			except:
				None
		overseasData = {
			'confirmedCount': confirmedCountSum,
			'confirmedIncr': confirmedIncrSum,
			'curedCount': curedCountSum,
			'deadCount': deadCountSum
		}
		# 国内疫情
		areas = json.loads(data).get('data').get('area')
		areaList = []
		for item in areas:
			# 省份
			provinceName = item.get('provinceName')
			# 现有确诊
			currentConfirmedCount = item.get('currentConfirmedCount')
			# 累计确诊
			confirmedCount = item.get('confirmedCount')
			# 治愈
			curedCount = item.get('curedCount')
			# 死亡
			deadCount = item.get('deadCount')
			# 增长情况
			increase = None;
			confirmAdd = item.get('provinceCompare').get('confirmAdd')
			if (confirmAdd > 0):
				increase = "较昨日+" + str(confirmAdd)
			else:
				zero = item.get('provinceCompare').get('zero')
				increase = str(zero) + "天0新增"
			dataItem = {
				'provinceName': provinceName,
				'currentConfirmedCount': currentConfirmedCount,
				'confirmedCount': confirmedCount,
				'curedCount': curedCount,
				'deadCount': deadCount,
				'increase': increase
			}
			areaList.append(dataItem)

		# 国内疫情数据汇总
		domesticStats = json.loads(data).get('data').get('domesticStats')
		# 累计确诊
		diagnosed = domesticStats.get('diagnosed')
		# 现有确诊
		currentConfirmedCount = domesticStats.get('currentConfirmedCount')
		# 累计治愈
		cured = domesticStats.get('cured')
		# 累计死亡
		death = domesticStats.get('death')
		allData = {
			'diagnosed': diagnosed,
			'currentConfirmedCount': currentConfirmedCount,
			'cured': cured,
			'death': death
		}
		return overseasList, areaList, allData, deadLine, overseasData


class User(object):
	"""docstring for User"""
	def __init__(self):
		self.collection = MongoDB('user')

	def checkUser(self, account, password):
		condition = {
			'account': account,
			'password': password
		}
		if password is None:
			condition.pop('password')
		result = self.collection.getObject(condition)
		if not result is None:
			user = {
				'id': str(result.get('_id')),
				'account': result.get('account')
			}
			return user
		else:
			return None

	def addUser(self, account, password):
		content = {
			'account': account,
			'password': password
		}
		_id = self.collection.save(content)
		return _id


	def getHistory(self, id):
		result = self.collection.getObjectById(id)
		historyList = result.get('history')
		return historyList


	def updateUser(self, userId, account, password):
		condition = {
			'_id': ObjectId(userId)
		}
		content = {
			'account': account,
			'password': password
		}
		self.collection.updateObject(condition, content)


	def updateHistory(self, userId, newsList):
		condition = {
			'_id': ObjectId(userId)
		}
		content = {
			'history': newsList
		}
		self.collection.updateObject(condition, content)


	def delUser(self, userId):
		condition = {
			'_id': ObjectId(userId)
		}
		self.collection.delObject(condition)


class Topic(object):
	"""docstring for Topic"""
	def __init__(self):
		self.collection = MongoDB('topic')


	def getTopicById(self, topicId):
		condition = {
			'_id': ObjectId(topicId)
		}
		topic = self.collection.getObject(condition)
		_id = topic.get('_id')
		topicName = topic.get('topic')
		topicItem = {
			'id': str(_id),
			'topic': topicName
		}
		try:
			comments = topic.get('comments')
			topicItem['comments'] = comments
		except:
			topicItem['comments'] = []
		return topicItem


	def getAllTopic(self):
		topics = self.collection.getObjects({'topic': {'$regex': '.*'}})
		topiclist = []
		for item in topics:
			_id = item.get('id')
			topic = item.get('topic')
			time = item.get('time')
			topicItem = {
				'id': _id,
				'topic': topic,
				'time': time
			}
			try:
				commentNum = len(item.get('comments'))
				topicItem['commentNum'] = commentNum
			except:
				topicItem['commentNum'] = 0 
			topiclist.append(topicItem)
		return topiclist


	def addTopic(self, topic):
		curr_time = datetime.datetime.now()
		content = {
			'topic': topic,
			'time': datetime.datetime.strftime(curr_time, '%Y-%m-%d %H:%M:%S')
		}
		self.collection.save(content)


	def updateTopic(self, topicId, topic):
		condition = {
			'_id': ObjectId(topicId)
		}
		content = {
			'topic': topic
		}
		self.collection.updateObject(condition, content)


	def delTopic(self, topicId):
		condition = {
			'_id': ObjectId(topicId)
		}
		self.collection.delObject(condition)


	def searchTopic(self, key):
		condition = {
			'topic': {'$regex': '.*' + key + '.*'}
		}
		topics = self.collection.getObjects(condition)
		topiclist = []
		for item in topics:
			_id = item.get('id')
			topic = item.get('topic')
			time = item.get('time')
			topicItem = {
				'id': _id,
				'topic': topic,
				'time': time
			}
			try:
				commentNum = len(item.get('comment'))
				topicItem['commentNum'] = commentNum
			except:
				topicItem['commentNum'] = 0
			topiclist.append(topicItem)
		return topiclist


	def saveComment(self, topicId, comments):
		condition = {
			'_id': ObjectId(topicId)
		}
		content = {
			'comments': comments
		}
		self.collection.updateObject(condition, content)

if __name__ == '__main__':
	# fakenews = FakeNews()
	# fakenews.loadMore(1)

	# realTimeNews = RealTimeNews()
	# realTimeNews.loadMore(1)

	# rework = ReWork()

	# emergence = Emergence()
	epidemic = Epidemic()
	epidemic.loadData()
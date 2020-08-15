import pymongo
import chardet
from bson.objectid import ObjectId
from bson import json_util

class MongoDB:
	"""docstring for MongoDB"""
	def __init__(self, collectionName):
		self.client = pymongo.MongoClient('localhost', 27017)
		self.mydb = self.client['epidemic']
		self.collection = self.mydb[collectionName]


	def getObjectById(self, id):
		id = ObjectId(id)
		result = self.collection.find_one({'_id': id})
		return result


	def getObject(self, condition):
		result = self.collection.find_one(condition)
		return result

	def updateObject(self, condition, content):
		self.collection.update_one(condition, {'$set': content})


	def save(self, content):
		result = list(self.collection.find(content)[:])
		if not len(result) > 0:
			result = self.collection.insert_one(content)
			_id = result.inserted_id
			return str(_id)
		else:
			item = dict(result[0])
			_id = item.get('_id')
			_id = str(_id)
			item.pop('_id')
			return _id


	def getObjects(self, condition, dataNum=None, sortKey='_id', reverse=1):
		result = []
		objectList = []
		if dataNum == None:
			result = self.collection.find(condition).sort([(sortKey, reverse)])
		else:
			result = self.collection.find(condition).sort([('_id', -1)]).limit(dataNum)
		for item in result:
			temp = {}
			for key in item.keys():
				temp[key] = item.get(key)
			temp['_id'] = str(temp.get('_id'))
			temp['id'] = str(temp.get('_id'))
			objectList.append(temp)
		return objectList


	def delObject(self, condition):
		self.collection.delete_one(condition)

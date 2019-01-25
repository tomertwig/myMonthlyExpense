from flask import *
from json import *
from flask_cors import CORS, cross_origin
from flask import request
import mysql.connector
from sqlwrapper import mysqlwrapper


DATABASE = 'test123'
app = Flask(__name__)
CORS(app)
db = mysqlwrapper()
db.connect("db", "root", "root")
try:
    db.create_db(DATABASE)
except Exception as e:
    print 'db already initalized'

db.connect_db(DATABASE)
EXPENSES_TABLE = 'tom'

@app.route('/monthlyExpenses')
def get_monthly_expenses():
    #db.is_table_exist('dogs', ['id','breed','color','weight'],[1,'Labrador','yellow',29.4])
    print 'get_monthly_expenses !!!! '

    fetched_data = db.fetch_all(EXPENSES_TABLE)
    mountly_expenses = 0
    for data in fetched_data:
        mountly_expenses += data['amount']

    jsonResp = {'monthlyExpenses': mountly_expenses}
    return jsonify(jsonResp)

@app.route('/deleteLatestTransaction')
def deleteLatestTransaction():
    print ('deleteLatestTransaction !!!! ')
    db.delete_latest_transaction(EXPENSES_TABLE)
    return ''


@app.route('/pay')
def pay():
    print 'pay !!!! '
    amount = request.args.get('amount', default=0, type=int)
    spent_type = request.args.get('spent_type', default=0, type=int)
    if amount == 0 or spent_type == 0:
        print 'failed pay !!!! '
        jsonResp = {'result': 'failed'}
        return jsonify(jsonResp)

    db.create_transactional_table(EXPENSES_TABLE, ['spent_type','amount',],['integer','integer'])
    db.insert(EXPENSES_TABLE, ['spent_type','amount'],[spent_type, amount] )  

    jsonResp = {'result': 'succeeded'}
    return jsonify(jsonResp)



@app.route('/expenses')
def getLestExpenses():
    print ('request.args.get(all, default=False, type=bool)')

    all = request.args.get('all', default=0, type=int) == 1
    number_of_rows = 10 if not all else None

    jsonResp = None
    data = []
    fetched_data = db.fetch_last_rows(EXPENSES_TABLE, number_of_rows)
    for d in fetched_data:
        data.append([d[0].strftime("%Y-%m-%d"), d[1], d[2]])
    
    jsonResp = {'expenses': data}

    return jsonify(jsonResp)

if __name__ == '__main__':
    app.run(host='0.0.0.0')

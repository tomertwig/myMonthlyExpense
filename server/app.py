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
db.create_transactional_table(EXPENSES_TABLE, ['spent_type','amount',],['integer','integer'])

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

    db.insert(EXPENSES_TABLE, ['spent_type','amount'],[spent_type, amount] )  

    jsonResp = {'result': 'succeeded'}
    return jsonify(jsonResp)



@app.route('/expenses')
def getLestExpenses():
    all = request.args.get('all', default=0, type=int) == 1

    data = []
    mountly_expenses = 0
    jsonResp = {'expenses': [data], 'expensesSum': mountly_expenses}

    fetched_data = db.fetch_last_rows(EXPENSES_TABLE)
    
    if fetched_data:
        number_of_rows = len(fetched_data) if all else min (10, len(fetched_data))

        i = 0
        for d in fetched_data[:number_of_rows]:
            data.append([d[0].strftime("%Y-%m-%d"), d[1], d[2]])
            mountly_expenses += int(d[2])
            i += 1

        for d in fetched_data[i:]:
            mountly_expenses += int(d[2])

        jsonResp = {'expenses': data, 'expensesSum': mountly_expenses}
    return jsonify(jsonResp)

if __name__ == '__main__':
    app.run(host='0.0.0.0')

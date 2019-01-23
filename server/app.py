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

    fetched_data = db.fetch_all(EXPENSES_TABLE)
    print (fetched_data)
    mountly_expenses = 0
    for data in fetched_data:
        mountly_expenses += data['amount']

    jsonResp = {'monthlyExpenses': mountly_expenses}
    return jsonify(jsonResp)


@app.route('/pay')
def pay():
    amount = request.args.get('amount', default=0, type=int)
    spent_type = request.args.get('spent_type', default=0, type=int)
    if amount == 0 or spent_type == 0:
        return ''

    db.create_transactional_table(EXPENSES_TABLE, ['spent_type','amount',],['integer','integer'])
    db.insert(EXPENSES_TABLE, ['spent_type','amount'],[spent_type, amount] )  

    return ''

@app.route('/lestTenExpenses')
def getLestTenExpenses():
    fetched_data = db.fetch_last_ten(EXPENSES_TABLE)
    jsonResp = {'lestTenExpenses': fetched_data}
    return jsonify(jsonResp)

if __name__ == '__main__':
    app.run(host='0.0.0.0')

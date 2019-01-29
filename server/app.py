from flask import *
from json import *
from flask_cors import CORS, cross_origin
from flask import request
import mysql.connector
from sqlwrapper import mysqlwrapper
import random
from datetime import datetime

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
EXPENSES_TABLE = 'with_user_id' # 'tom'
MONTHLY_EXPENSES_TABLE = 'monthly'
USERS_TABLE = 'users2' # 'tom'
db.create_transactional_table(EXPENSES_TABLE, ['user_id', 'spent_type','amount',],['integer', 'integer','integer'])
db.create_transactional_table(MONTHLY_EXPENSES_TABLE, ['user_id', 'spent_type','amount',],['integer', 'integer','integer'])
db.create_table(USERS_TABLE, ['user_name', 'password','user_id',],['VARCHAR(20)', 'VARCHAR(64)','integer'], primary_key='user_name')

@app.route('/deleteLatestTransaction')
def deleteLatestTransaction():
    user_id = request.args.get('user_id', default=0, type=int)
    deletePermenentExpense = request.args.get('deletePermenentExpense') == 'true'
    table = MONTHLY_EXPENSES_TABLE if deletePermenentExpense else EXPENSES_TABLE
    db.delete_latest_transaction(table, user_id)
    return ''


@app.route('/pay')
def pay():
    print 'pay !!!! '
    user_id = request.args.get('user_id', default=0, type=int)
    amount = request.args.get('amount', default=0, type=int)
    spent_type = request.args.get('spent_type', default=0, type=int)
    is_monthly_expense = request.args.get('is_monthly_expense') == 'true'
    print 'is_monthly_expense'
    print is_monthly_expense

    if amount == 0 or spent_type == 0:
        print user_id
        print amount
        print spent_type

        print 'failed pay !!!! '
        jsonResp = {'result': 'failed'}
        return jsonify(jsonResp)
    
    table = MONTHLY_EXPENSES_TABLE if is_monthly_expense else EXPENSES_TABLE
    db.insert(table, ['user_id', 'spent_type', 'amount'], [user_id, spent_type, amount])  

    jsonResp = {'result': 'succeeded'}
    return jsonify(jsonResp)

@app.route('/expenses')
def getLestExpenses():
    user_id = request.args.get('user_id', default=0, type=int)

    data = []
    mountly_expenses = 0
    jsonResp = {'expenses': data, 'expensesSum': mountly_expenses}

    fetched_mountly_data = db.fetch_last_rows(EXPENSES_TABLE, user_id) or ()
    permanent_index = len(fetched_mountly_data)

    fetched_permanent_data = db.fetch_last_rows(MONTHLY_EXPENSES_TABLE, user_id) or ()

    now = datetime.now() 

    fetched_data = fetched_mountly_data + fetched_permanent_data
    print('len(fetched_data')

    print(len(fetched_data))
    if fetched_data:
        i = 0
        for d in fetched_data:
            if i >= len(fetched_mountly_data):
                data.append([now.replace(day=1).strftime("%d-%m"), d[2], d[3]])
            else:
                data.append([d[0].strftime("%d-%m"), d[2], d[3]])
            
            mountly_expenses += int(d[3])
            i += 1


        jsonResp = {'expenses': data, 'expensesSum': mountly_expenses, 'permanentIndex':permanent_index}
    return jsonify(jsonResp)

@app.route('/login')
def login():
    print 'login !!!! '
    user_name = request.args.get('user_name')
    password = request.args.get('password')

    fetched_data = db.fetch_all(USERS_TABLE)

    result = 'failed'

    fetched_data = db.fetch_by(USERS_TABLE, 'user_name= ' +"'" + str(user_name) +"'" )
    print fetched_data

    user_id = 0
    if len(fetched_data) == 1 and fetched_data[0]['password'] == password:
        result = 'succeeded' 
        user_id = fetched_data[0]['user_id']

    jsonResp = {'result': result, 'userID': user_id}
    return jsonify(jsonResp)

def _get_next_unique_user_id():
    fetched_data = db.fetch_all(USERS_TABLE)

    unique = False 
    user_id = None
    while not unique:
        unique = True
        user_id = random.randint(1,1000000)

        for d in fetched_data:
            if d['user_id'] == user_id:
                unique = False
                break
    
    return user_id

@app.route('/signin')
def sign_in():
    user_name = request.args.get('user_name')
    password = request.args.get('password')
    user_id = _get_next_unique_user_id()
    
    db.insert(USERS_TABLE, ['user_name', 'password', 'user_id'], [user_name, password, user_id])  
    jsonResp = {'result': 'succeeded'}
    return jsonify(jsonResp)

if __name__ == '__main__':
    app.run(host='0.0.0.0')

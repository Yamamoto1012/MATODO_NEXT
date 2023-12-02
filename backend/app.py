from flask import Flask
from bs4 import BeautifulSoup
import requests
import time
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)


# 履修中の科目情報を取得
def kamoku_info():
    url = "https://navi.mars.kanazawa-it.ac.jp/portal/student/KITP00500"
    response = session.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    data = []
    targets = soup.find_all('td', class_='rsColor')

    for target in targets:
        unit = [target.get('data-risyu'), target.get('data-nendo')]
        if unit not in data:
            data.append(unit)

    return data


# 科目のページに入る
def enter_kamoku():

    kamoku_info = {
        "OPEN_YEAR": "2023",  # 年度
        "RISYU_CODE":"G224012006"  # 科目コード(?)
    }

    request_url = "https://mars41.mars.kanazawa-it.ac.jp/eSylla/eSRefSummaryPortalAuth"
    #m_res = session.post(request_url, data=kamoku_info)
    m_res = session.post(request_url, params=kamoku_info, verify=False)
    
    return m_res


def main_scrape():
    
    #2 環境変数の呼び出し
    uid = os.environ.get("uid")
    pw = os.environ.get("pw")

    # セッションを開始
    url = "https://navi.mars.kanazawa-it.ac.jp/portal/student"

    global session
    session = requests.session()
    response = session.get(url)

    soup = BeautifulSoup(response.text, 'html.parser')
    
    # ログインフォームの情報を取得
    form = soup.find('form', {'name': 'loginform'})
    
    # ログインフォーム内のCSRFトークンを取得
    authenticity = form.find(attrs={'name': '_csrf'}).get('value')
    
    # ログインに必要な情報
    loginfo = {
        "_csrf": authenticity,
        "uid": uid,  # ここに学籍番号を入力
        "pw": pw  # ここにパスワードを入力
    }
    
    # ログイン用のURLを指定し、POSTリクエストを送信
    login_url = "https://navi.mars.kanazawa-it.ac.jp/portal/student/inKITP0000001Login" #エンドポイント設定
    res = session.post(login_url, data=loginfo)
    
    time.sleep(1)


    #履修中の科目情報を取得する関数呼びだし
    #data = kamoku_info()
    #time.sleep(1)
    
    
    # 科目のページに入る関数
    data2 = enter_kamoku()
    time.sleep(1)
    
    return data2.text


@app.route("/")
def index():
    
    return 

if __name__ == "__main__":
    app.run(debug=True)
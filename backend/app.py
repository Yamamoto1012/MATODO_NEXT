from flask import Flask
from bs4 import BeautifulSoup
import requests

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


def scrape_gakupo():
    
    # ターゲットのURLを指定
    url = "https://navi.mars.kanazawa-it.ac.jp/portal/student"
    
    # セッションを開始して、指定したURLにGETリクエストを送信
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
        "uid": "your_id",  # ここに学籍番号を入力
        "pw":"your_password"  # ここにパスワードを入力
    }
    
    # ログイン
    login_url = "https://navi.mars.kanazawa-it.ac.jp/portal/student/inKITP0000001Login" #エンドポイント設定
    res = session.post(login_url, data=loginfo)
    res.raise_for_status() #エラー時に例外発生
    
    return res.text


@app.route("/")
def index():
    # 例: スクレイピング処理を呼び出して結果を表示
    url_to_scrape = "https://example.com"
    result = scrape_gakupo(url_to_scrape)
    
    return f"Index page\n{result}"

if __name__ == "__main__":
    app.run(debug=True)
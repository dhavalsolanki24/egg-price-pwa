import requests
import json
from datetime import datetime
from lxml import html
import traceback

URL = "https://www.e2necc.com/home/eggprice"

payload = {
    "ddlMonth": datetime.now().strftime("%m"),
    "ddlYear": datetime.now().strftime("%Y"),
    "rblReportType": "DailyReport",
    "btnReport": "Get Sheet"
}

headers = {"User-Agent": "Mozilla/5.0"}

r = requests.post(URL, data=payload, headers=headers)
res = html.fromstring(r.text)
table = res.xpath('//table//tr//th[contains(text(),"Name Of Zone")]/ancestor::table//tr')
if table is not None:
    print("response: {}".format(len(table)))
    cities = ["Ahmedabad", "Surat", "Mumbai (CC)", "Delhi (CC)"]
    output = {}

    for tr in table:
        td = tr.xpath('./td/text()')
        if td and any(city in td for city in cities):
            city = None
            price_list = []
            for k,v in enumerate(td):
                if k == 0:
                    city = v.replace(" (CC)", "").strip().lower()
                    print("found city: {}".format(v))
                else:
                    try:
                        price_list.append({ 
                            "date": k,
                            "price": v.strip(),
                            })
                    except Exception as e:
                        print("error: {}, index: {}".format(e, k))
                        traceback.print_exc()
            output[city] = price_list
    
    with open("prices.json", "w") as f:
        json.dump(output, f, indent=2)
    
    print("prices.json updated successfully")
else:
    print("Price table not found in the response")

import requests
import pandas as pd
from datetime import datetime
import json

url = "https://www.e2necc.com/home/eggprice"

payload = {
    "ddlMonth": datetime.now().strftime("%m"),
    "ddlYear": datetime.now().strftime("%Y"),
    "rblReportType": "DailyReport",
    "btnReport": "Get Sheet"
}

r = requests.post(url, data=payload)

df = pd.read_html(r.text)[0]
df = df.rename(columns={"Name Of Zone / Day": "City"})

cities = ["Ahmedabad","Surat","Mumbai (CC)","Delhi (CC)"]

df = df[df["City"].isin(cities)]

df = df.set_index("City")

df = df.replace("-", pd.NA)

day_cols = [str(i) for i in range(1,32)]
last_days = [c for c in day_cols if df[c].notna().any()][-6:]

output = {}

for city in cities:

    city_key = city.replace(" (CC)","")

    output[city_key] = []

    for d in last_days:
        price = float(df.loc[city,d]) / 100

        date = datetime(datetime.now().year,
                        datetime.now().month,
                        int(d)).strftime("%d-%b")

        output[city_key].append({
            "date": date,
            "price": round(price,2)
        })

with open("prices.json","w") as f:
    json.dump(output,f,indent=2)
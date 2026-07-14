import json
from pydoc import plain
import requests
from datetime import datetime
from zoneinfo import ZoneInfo

API_URL = "https://new-wapi.sandesh.com/api/v1/e-paper"

params = {
    "slug": "vadodara",
    "date": datetime.now().strftime("%Y-%m-%d")
}

headers = {
    "accept": "application/json, text/plain, */*",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,gu;q=0.7,hi;q=0.6"
}

print("Fetching newspaper...")

try:
    response = requests.get(API_URL, params=params, headers=headers)
    response.raise_for_status()
    api = response.json()

    output = {
        "_metadata": {
            "paper": "Sandesh",
            "source": "Sandesh",
            "updated_at": datetime.now(
                ZoneInfo("Asia/Kolkata")
            ).strftime("%d-%b-%Y %I:%M:%S %p"),

            "paper_date": params["date"],
            "edition": api["data"]["name"],
            "page_count": 12
        },
        "pages": []
    }

    BASE_URL = "https://resize-img.sandesh.com/epapercdn.sandesh.com/"
    page = 1

    for item in api["data"]["sub"]:
        photo = item.get("photo")
        if photo:
            output["pages"].append({
                "page": page,
                "image": BASE_URL + photo,
                "thumb": "",
            })
            page += 1

    if output["pages"]:
        with open("newspaper.json", "w") as f:
            json.dump(output, f, indent=2)

        print("newspaper.json updated")

    else:
        print("No pages found. Keeping existing newspaper.json")

except Exception as e:
    print(e)
    print("Keeping existing newspaper.json")

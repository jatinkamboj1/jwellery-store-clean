import requests
from bs4 import BeautifulSoup
import json

def fetch_product_data(url):
    # URL of the product page
    # url = "https://www.hranipex.com/en/product/riextouch-xh02-handle-160-mm-matt-black-fwf001246/"

    # Send a GET request
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    }
    response = requests.get(url, headers=headers)

    # Parse the content using BeautifulSoup
    soup = BeautifulSoup(response.text, "html.parser")

    # Extract breadcrumbs
    breadcrumbs = {}
    for row in soup.select(".breadcrumbs .breadcrumbs-item"):
        key = row.text.strip()
        value = row.get('href')
        breadcrumbs[key] = value

    # Extract title
    title = soup.find("h1", class_="productDetailHeader-title").text.strip()

    # Extract image URL
    image_tag = soup.select_one(".productGallery-main img")
    image_url = image_tag["src"] if image_tag else None

    # Extract product code
    code_element = soup.select_one(".variantsTable-rowTop .text-left")
    code = code_element.text.strip().replace("Code: ", "") if code_element else None

    # Extract product description
    desc_element = soup.select_one("#product-description .cmsHtmlBlock")
    description = desc_element.text.strip() if desc_element else None

    # Extract parameters
    parameters = {}
    for row in soup.select("#parameters tr"):
        head = row.find("th")
        name = row.find("td")
        key = head.text.strip()
        value = name.text.strip()
        parameters[key] = value

    # Print extracted data
    product_data = {
        "breadcrumbs": breadcrumbs,
        "title": title,
        "imageUrl": image_url,
        "code": code,
        "description": description,
        "parameters": parameters
    }

    return product_data


def fetch_urls(urls):
    pageData=[]
    for url in urls:
        try:
            data = fetch_product_data(url)
            pageData.append(data)
        except:
            pass
    return pageData


def fetch_product_urls():
    # Send a GET request
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    }
    base_url = "https://www.hranipex.com"
    urls=[]
    for i in range(1,5):
        # URL of the search page
        url = f"https://www.hranipex.com/en/search/?page={i}&q=F002265,F002796,F002794,F002798,F003035,F003031,F001586,F001245,F002804,F001616,F002186,F001246,F001441,F001236,F001487,F002816,F001489,F002184,F002231,F002227,F002815,F002124,F002231,F001619,F001655,F001618,F001620,F001248,F001586,F001443,F002186,F001227,F001246,F001234,F001230,F001236,F001233,F001246,F000808,F000809,F000810,F000811,F000812,F000813,F000814,F000014,F000036,F002266,F000040,F000038,F002273,F002250,Fpp1604,F002138,F002137,F001444,F001443,F001798,F000549,F000548,F000547,F000545,F000550,F000552,F000546,F000165,F000162,F000164,F000166,F000446,F003283,F003280,F003274,F003271,F003284,F003281,F003275,F003272,F008441,F001433,F001432,F001443,F002230,F002229,F002233,F002225,F002126,F002804,F002810,F002803,F002261,F002262,F002263,F002265,F002266,F002183,F001591,F001589,F001584,F001664,F001616,F001604,F001666,F001671,F001228,F000815,F000816,F000817,F000818,F000819,F000820,F000821,F003275,F000174,F003057,F002798,F000843,F001941,F001939,F002915,F002916,F004315,F003205,F004322,F003105,F003118,F003204,F004322"

        response = requests.get(url, headers=headers)

        # Parse the content using BeautifulSoup
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract all product links
        product_links = [base_url + a["href"] for a in soup.select(".productListItem-open-in")]

        urls.extend(product_links)
        # # Print extracted URLs
        # for link in product_links:
        #     print(link)
    return urls

def save_in_json(data):
    # Save to JSON file
    with open("product_urls.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print(f"Saved {len(data)} product URLs to product_urls.json")


urls = fetch_product_urls()
# print(len(urls))
# urls=[
#     "https://www.hranipex.com/en/product/riextouch-xh02-handle-160-mm-matt-black-fwf001246/",
# ]

productData = fetch_urls(urls)
save_in_json(productData)
# print(productData)

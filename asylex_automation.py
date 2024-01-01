
import gspread
from oauth2client.service_account import ServiceAccountCredentials

import pandas as pd
import os
import json
import geojson 
import datetime

## Get environment variables
GCP_SERVICE_ACCOUNT_KEY = os.environ["GCP_SERVICE_ACCOUNT_KEY"]
SHEET_ID = os.environ["SHEET_ID"]

GEOJSON_SMALL = "data/countries_small_updated_Aug2023.geojson"
TREATY_BODIES = "data/UNTrendyBodyAndRegionalOnes.json"

## SOURCE: https://medium.com/geekculture/2-easy-ways-to-read-google-sheets-data-using-python-9e7ef366c775
# Set up the credentials
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/spreadsheets",
         "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"]

creds = ServiceAccountCredentials.from_json_keyfile_dict(json.loads(GCP_SERVICE_ACCOUNT_KEY), scope)
client = gspread.authorize(creds)

# Open the Google Sheet using its name
# 1F3XoC8hm-AgPMALQxoXAMS-DyGfAnRtcV27ysGRS4J8 - Asylex
# 1Qt48KMf-04KXTGCyutH6cKAocKDWB5kJNSZnv-mOvjA - sample
sheet = client.open_by_key(SHEET_ID)

#Read the treaty bodies
untreatybodies = sheet.worksheet('UNTreatyBodies').get_all_records()
regionalbodies = sheet.worksheet('Regional').get_all_records()

all_bodies = { "UNTrendyBody" : untreatybodies,
              "regionalOnes" : regionalbodies,
             "datetime": str(datetime.datetime.now())}

#write to the specified json file
with open(TREATY_BODIES, "w+") as fp:
         json_load = json.dumps(all_bodies, indent=2)
         fp.write(json_load)

# Reading the sheet 1 - with country data
sheet = client.open_by_key(SHEET_ID)
country_df = pd.DataFrame(sheet.sheet1.get_all_records())

# Reading the geojson file
with open(GEOJSON_SMALL) as fp:
         geojson_small = geojson.load(fp)


def row2json_reg(row):
         json_d = dict()
         
         if row[5]  == "-" or pd.isnull(row[5]) or row[5]  == "":
                  return -1 

         json_d["Institution"] = "-" if pd.isnull(row[5]) else row[5]
         json_d["IndividualComplaint"] = "-" if pd.isnull(row[6]) else row[6]
         return json_d

def row2json_un(row):
         json_d = dict()

         if row[1]  == "-" or pd.isnull(row[1]) or row[1]  == "":
                  return -1

         json_d[row.index[1]] = "-" if pd.isnull(row[1]) else row[1]
         json_d[row.index[2].replace(" ", "")] = "-" if pd.isnull(row[2]) else row[2]
         json_d[row.index[3]] = "-" if pd.isnull(row[3]) else row[3]
         json_d[row.index[4].replace(" ", "")] = "-" if pd.isnull(row[4]) else row[4]
         return json_d         

for bbox in geojson_small["features"]:
         country = bbox["properties"]["ADMIN"]

         temp = country_df[country_df["Country"] == country] 
         hr_list=list()
         reg_list=list()

         for idx, row in temp.iterrows():
                  hr_list.append(row2json_un(row))
                  if hr_list[-1] == -1:
                           hr_list.pop(-1)

                  reg_list.append(row2json_reg(row))
                  if reg_list[-1] == -1:
                           reg_list.pop(-1)

         
         bbox["properties"]["UNTreatyBody"] = hr_list
         bbox["properties"]["regionalHumanRightsMechanism"] = reg_list

geojson_small["datetime"] = str(datetime.datetime.now())
with open(GEOJSON_SMALL, "w+") as fp:
         json_load = json.dumps(geojson_small, indent=2)
         fp.write(json_load)

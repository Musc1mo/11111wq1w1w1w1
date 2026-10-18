# Упрощенный скрипт чтения Google Sheets (заглушка на чтение)
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import requests, json

scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name('/root/google_creds.json', scope)
client = gspread.authorize(creds)
sheet = client.open_by_key('1BEes78yNXRTl4baYlPTGEjXDT1-X5t4BAE7_xLe_2Tg').sheet1

print("Дашборд подключен. Готов к чтению задач.")

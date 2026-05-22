from service.mockdata import get_chargers

def fetch_charger_data():
    chargers = get_chargers()
    return chargers
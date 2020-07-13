"""
This tool pulls live data from EIA.gov
"""
import requests
import json
# import numpy
import pandas as pd
import os
import time
import sys


class Dashboard:

    def __init__(self):

        path = os.path.join(os.path.dirname(__file__), 'data/state_list.json')
        state_df = pd.read_json(path)
        state_df = state_df.sort_values(by=['State'])
        self.state_df = state_df.applymap(str)
        self.data = pd.DataFrame({})
        self.usa_data = pd.DataFrame({})
        self.config = {'key': sys.argv[1],
                       'b_color': '#2F2F2F',
                       'text_color': '#00ffbf',
                       'fuel_codes': {'ALL': 'All',
                                      'COW': 'Coal',
                                      'NG':  'Natural Gas',
                                      'NUC':  'Nuclear',
                                      'HYC':  'Hydro',
                                      'WND':  'Wind',
                                      'TSN':  'All Solar',
                                      'GEO':  'Geothermal',
                                      'PEL':  'Petroleum Liquids',
                                      'PC':  'Petroleum Coke',
                                      'WWW': 'Biomass'
                                      }
                       }

        self.elec_price = 0
        self.count = 0
        self.emissions = 0

        self.pull_data()

    def pull_data(self):

        """
        Pulls the necessary data from EIA.gov
        """

        for abv in self.state_df.Abbreviation:
            # Clear state data
            self.data = pd.DataFrame()

            # Loop through available fuels
            for fuel in self.config['fuel_codes'].keys():
                self.pull_elec_data(abv, fuel)

            # Pull emissions data
            emissions_data = self.pull_emissions_data(abv)
            emissions_data.dropna(inplace=True)

            # Pull price data
            price_data = self.pull_price_data(abv)
            price_data.dropna(inplace=True)

            plot_summary = pd.DataFrame({
                'elec_price': [price_data.loc[0, 'Electricity price [cents/kWh]']],
                'total_power_gen': [self.data.loc[len(self.data)-12:, 'All'].sum()],
                'total_emissions': [emissions_data.loc[0, 'Emissions [CO2]']]
            })

            self.emissions += emissions_data.loc[0, 'Emissions [CO2]']
            self.elec_price += price_data.loc[0, 'Electricity price [cents/kWh]']
            self.count += 1

            # Save data
            self.save_data(abv, plot_summary)

            # Add data to total USA data
            state_data = self.data.copy()
            state_data = state_data.set_index(['DateTime'])
            self.usa_data = self.usa_data.add(state_data, fill_value=0)
            # Pause so we don't over-request the API
            time.sleep(0.3)

        # Save USA data
        path = os.path.join(os.path.dirname(__file__), 'data', 'USA.json')
        self.usa_data.reset_index().to_json(path)
        total_gen = self.usa_data['All'].reset_index()
        total_gen = total_gen.iloc[len(total_gen)-12:].sum()[0]

        path = os.path.join(os.path.dirname(__file__), 'data', 'USA_sum.csv')
        usa_sum = pd.DataFrame({
            'elec_price': [self.elec_price/self.count],
            'total_power_gen': [total_gen],
            'total_emissions': [self.emissions]
        })
        usa_sum.to_csv(path)

    def pull_elec_data(self, abv, fuel):
        """
        Pulls monthly electricity generation by fuel source from the EIA API
        """
        series_id = 'ELEC.GEN.{}-{}-99.M'.format(fuel, abv)

        # Pull data
        try:
            request = requests.request('GET',
                                       'http://api.eia.gov/series/?api_key=' +
                                       self.config['key'] +
                                       '&series_id=' + series_id
            )
        except requests.exceptions.RequestException as e:
            return {}

        # Load data into json
        try:
            request_data_json = json.loads(request.content)['series'][0]
        except KeyError:
            return {}

        # Select series name, and load into df
        request_data = pd.DataFrame(request_data_json['data'],
                                    columns=['DateTime', request_data_json['name']])
        request_data.rename(
            columns={request_data_json['name']: self.config['fuel_codes'][fuel]},
            inplace=True)
        request_data.DateTime = pd.to_datetime(request_data['DateTime'], format="%Y%m")

        # Convert to rolling mean
        request_data.loc[:, self.config['fuel_codes'][fuel]] = request_data[
            self.config['fuel_codes'][fuel]].rolling(12, min_periods=6).mean()
        if len(request_data) > 6:
            request_data = request_data.drop(range(6))

        # Merge with other data
        if self.data.empty:
            self.data = request_data
            self.data = self.data.sort_values(by=['DateTime'])
        else:
            self.data = self.data.merge(request_data, how='outer', on='DateTime')
            self.data = self.data.sort_values(by=['DateTime'])

    def pull_emissions_data(self, abv):
        """
        Pulls average annual total CO2 emissions from the EIA API
        """
        series_id = 'EMISS.CO2-TOTV-EC-TO-{}.A'.format(abv)

        request = requests.request('GET',
                                   'http://api.eia.gov/series/?api_key=' +
                                   self.config['key'] +
                                   '&series_id=' + series_id
                                   )

        # Load data into DataFrame
        request_data_json = json.loads(request.content)['series'][0]
        request_data = pd.DataFrame(request_data_json['data'],
                                    columns=['DateTime', request_data_json['name']])

        request_data.rename(
            columns={request_data_json['name']: 'Emissions [CO2]'},
            inplace=True)
        request_data.DateTime = pd.to_datetime(request_data.DateTime)

        return request_data

    def pull_price_data(self, abv):
        """
        Pulls monthly residential electricity prices from the EIA API
        """
        series_id = 'ELEC.PRICE.{}-RES.M'.format(abv)

        request = requests.request('GET',
                                   'http://api.eia.gov/series/?api_key=' +
                                   self.config['key'] +
                                   '&series_id=' + series_id
                                   )

        # Load data into DataFrame
        request_data_json = json.loads(request.content)['series'][0]
        request_data = pd.DataFrame(request_data_json['data'],
                                    columns=['DateTime', request_data_json['name']])
        request_data.DateTime = pd.to_datetime(request_data['DateTime'], format="%Y%m")
        # Format dataframe
        request_data.rename(
            columns={request_data_json['name']: 'Electricity price [cents/kWh]'},
            inplace=True)

        return request_data

    def save_data(self, abv, plot_summary):
        """
        Saves the data to a JSON
        """
        path = os.path.join(os.path.dirname(__file__), 'data', abv + '.json')
        self.data.to_json(path)

        path = os.path.join(os.path.dirname(__file__), 'data', abv + '_sum.csv')
        plot_summary.to_csv(path)


Dashboard()

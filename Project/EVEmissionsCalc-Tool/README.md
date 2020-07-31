# This work was done as part of Data and Visual Analytics coursework in collaboration with 3 other members, Michael Karsten, Erich Rasch and Corey McCann.

# Vehicle Lifecycle Cost and Emission Impact Tool
To educate consumers on the effective environmental and financial impact of their vehicle use.

# Description

This package contains all files/scripts necessary to run the Vehicle Lifecycle Cost and Emission Impact Tool.  The main directory contains index.html, style.css, and script.js; the three main files to run the tool.  Inside eia_api is a python script which connects to the EIAs API to collect and clean the data used, which is also stored in that directory.  The images directory contains website images, and the lib directory contains extra JavaScript librairies such as D3.

All of these files come together as a web browser based tool.  Designed to be used from our GitHub hosted website, the tool can also be run locally, though some computer security issues may limit it's functionality offline.

# Installation
The tool can be accessed without any installation by going to our [website](https://github.gatech.edu/pages/Keeping-It-On-The-DL/EVEmissionsCalc/).  This is the prefered method to use the tool, which works best in Mozilla Firefox.

Minimal installation is necessary to run the tool locally.  However, some setup must happen before the tool will run properly locally.  Should you wish to run the tool locally, follow the guidelines below.  

1. Collect Grid Data: 
 - Run eia_api.py in the command line, a required input is an EIA API key, see below
 - Standard Python libraries are used, plus Pandas.
 - An EIA key is necessary to run, one can be registered for free at https://www.eia.gov/opendata/
 - The key is an input, like so: `python eia_api.py <key>`

2. Collect Vehicle Data:
 - The raw vehicle data used in this project can be found at www.fueleconomy.gov.

3. Collect Fuel Prices:
- Raw vehicle prices can be collected into a csv file from www.gasprices.aaa.com

# Execution
Once the necessary data has been loaded, simply running index.html will open the tool.
- The tool has been tested in Mozilla Firefox only, other browsers may or may not be supported.
- First, select a state of interest.  Emissions/kwh, fuel prices, and other important data is state-specific.
- Next, select a primary car for comparison with "Vehicle 1".  This vehicle will be used for clustering.
- Additional vehicles can be added to the emissions plot with Vehicle 2 & 3.
- Check the clustering plot to the left to see a vehicles lifetime cost in dollars and emissions, and similar vehicles

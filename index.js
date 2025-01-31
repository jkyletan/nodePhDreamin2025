import {getJsonDataFromCsv, createCsvFileFromJson, bulkInsertToSalesforce} from '@_kyletan/sftoolkit'
import { GetLatLngByAddress } from '@geocoder-free/google';
import units from "simple-units";

const filePath = 'sourceFiles/phWindFarms.csv';
const orgAlias = 'phd25';
const typeMapping = {
    'ON' : 'Onshore',
    'OF' : 'Offshore',
    'HY' : 'Hybrid',
};

const main = async () => {
    //1. GET DATA FROM CSV FILE IN JSON FORMAT
    let windFarmCsvData = await getJsonDataFromCsv(filePath);

    //2. START DATA TRANSFORMATION
    let transformedList = [];

    await Promise.all(windFarmCsvData.map(async (row) => {
        let geocode = await GetLatLngByAddress(row['Location']);
        transformedList.push({
            'Name' : row['Farm Name'],
            'Location__c' : row['Location'],
            'NumberOfTurbines__c' : row['Number of Turbines'],
            'TotalCapacityMW__c' : row['Total Capacity (MW)'],
            'WindFarmOperator__c' : row['Wind Farm Operator'],
            'AnnualEnergyProductionGWh__c' : row['Annual Energy Production (GWh)'],
            'Country__c' : row['Country'],
            'TotalAreaHectares__c' : units.from(row['Total Area (Square Feet)'], "ft2").to("ha"),
            'HasOffshoreCapabilities__c' : (row['Has Offshore Capabilities'] === 'Yes'),
            'DateOfCommissioning__c' : new Date(row['Date of Commissioning']).toISOString().substring(0,10),
            'Type__c' : typeMapping[row['Type']],
            'Geocode__Latitude__s' : geocode[0],
            'Geocode__Longitude__s' : geocode[1]
        });
    }))
    //END DATA TRANSFORMATION

    //3. CREATE NEW CSV FILE WITH TRANSFORMED DATA
    let csvFilePath = await createCsvFileFromJson(transformedList);

    //4. INSERT CSV TO SALESFORCE
    await bulkInsertToSalesforce(csvFilePath, 'WindFarmSite__c', orgAlias);
}

main();
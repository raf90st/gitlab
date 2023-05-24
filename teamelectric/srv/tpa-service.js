const cds = require('@sap/cds')

cds.once('listening', ({ server }) => {
    server.keepAliveTimeout = 3 * 60 * 1000 // > 3 mins
})
module.exports = cds.server

cds.env.features.assert_integrity = false

const {
    T_CHARGEINFO,
    T_DATAQUALITY,
    T_LOG
} = cds.entities('tpa');

class tpaService extends cds.ApplicationService {
    init() {
        const got = require('got');
        const arraySort = require('array-sort');

        function dbInsert(aInserts, insertEntity, insertEntityName, transaction) {
            var aRun = [];

            for (var i = 0; i < aInserts.length; i++) {
                var oInsertData = aInserts[i];
                aRun.push(transaction.insert(oInsertData).into(insertEntity));
            }

            if (aInserts.length > 0) {
                writeLog(transaction, insertEntityName, 'Insert', aInserts.length);
            }

            return aRun;
        }

        function dbUpdate(aUpdates, updateEntity, updateEntityName, transaction) {
            var aRun = [];

            for (var i = 0; i < aUpdates.length; i++) {
                var oUpdateData = aUpdates[i];
                //var sUpdateKey = oUpdateData[sTableKey];
                aRun.push(transaction.update(updateEntity, {CI_ACTUALDATE: oUpdateData.CI_ACTUALDATE, 
                CI_CHARGEDURATION: oUpdateData.CI_CHARGEDURATION, CI_CHARGEID: oUpdateData.CI_CHARGEID,
                CI_LICENSEPLATE: oUpdateData.CI_LICENSEPLATE}).with(oUpdateData));
            }

            if (aUpdates.length > 0) {
                writeLog(transaction, updateEntityName, 'Update', aUpdates.length);
            }

            return aRun;
        }

        async function writeLog(tx, sTableName, sChangeType, sNumRecords) {
            var d = new Date().toISOString().slice(0,-5)+"Z"; //new Date().toISOString().slice(0, 19).replace('T', ' ');
            var date = new Date(d);
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var logDate = day + "-" + month + "-" + year;
            var oUpdateLog = {
                TimeStamp: d,
                formattedDate: logDate,
                TableName: sTableName,
                ChangeType: sChangeType,
                NumberOfRecords: sNumRecords
            }
            await tx.insert(oUpdateLog).into(T_LOG);
        }

        function mapStringsToEntityTypes(oElement, oEntity) {
            for (const property in oElement) {
                var oEntityProperty = oEntity.elements[property];
                if (oEntityProperty) {
                    switch (oEntityProperty.type) {
                        case 'cds.Boolean':
                            if (oElement[property] === 'true') {
                                oElement[property] = true;
                            }
                            if (oElement[property] === 'false') {
                                oElement[property] = false;
                            }
                            break;
                        case 'cds.Integer':
                            oElement[property] = parseInt(oElement[property]);
                            if(Number.isNaN(oElement[property])) {
                                oElement[property] = 0;
                            }
                            break;
                        case 'cds.Date':
                            var dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/
                            if (oElement[property].match(dateReg) && 
                                oElement[property] !== "") {
                                oElement[property] = oElement[property].substring(6, 10) + '-' +
                                oElement[property].substring(3, 5) + '-' +
                                oElement[property].substring(0, 2);
                            } else {
                                oElement[property] = "";
                            }
                            break;
                        case 'cds.DateTime':
                            oElement[property] = new Date(oElement[property]).toISOString().slice(0,-5)+"Z";
                            break;
                        case 'cds.Decimal':
                            if (property === "CI_GROSSCOST" || 
                                property === "CI_NETCOST"  ||
                                property === "CI_KWH" ) {
                                if (oElement[property].includes(",")) {
                                    oElement[property] = oElement[property].replace(",", ".");
                                }
                                oElement[property] = parseFloat(oElement[property]).toFixed(2).toString();
                            } else {
                                oElement[property] = oElement[property] + "";
                            }
                            break;
                        /*default:
                            if (property === "CI_GROSSCOST" || 
                                property === "CI_NETCOST"  ||
                                property === "CI_KWH" ) {
                                oElement[property] = parseInt(oElement[sKey]).toFixed(2).toString();
                            }
                            break;*/
                    }
                }
            }
            return oElement;
        }

        function mapTruncateNumberStrings(aDatabaseEntries) {
            for (var i = 0; i < aDatabaseEntries.length; i++) {
                var oElement = aDatabaseEntries[i];

                const aObjectKeys = Object.keys(oElement);

                for (var n = 0; n < aObjectKeys.length; n++) {
                    var sKey = aObjectKeys[n];

                    if(sKey === "CI_KWH" || sKey === "CI_NETCOST" || 
                    sKey === "CI_GROSSCOST") {
                        oElement[sKey] = parseFloat(oElement[sKey]).toFixed(2).toString();
                    }

                    
                    if (sKey === "CI_LATITUDE" || 
                    sKey === "CI_LONGITUDE") {
                        oElement[sKey] = parseFloat(oElement[sKey]).toString();
                    }
                }
            }
        }

        function correctLocationData(oCsvRow, aCorrectionResult) {
            //Correct the data if neccessary
            for (var n = 0; n < aCorrectionResult.length; n++) {
                if (oCsvRow.CI_CHARGEID === aCorrectionResult[n].DQ_CHARGEID) {
                    oCsvRow.CI_LOCATION = aCorrectionResult[n].DQ_CORRECTION;
                }
            }
        }

        this.on('updateChargeInfo', async req => {
            let {
                aCsvData
            } = req.data;
    
            const tx = cds.tx(req);

            let aGotRequests = [];

            //Read data corrections
            let aCorrections = await tx.read(T_DATAQUALITY);

            //Read db Data
            writeLog(tx, "T_CHARGEINFO", "Lesen der Datenbank", 0);
            let aDbRead = await tx.read(T_CHARGEINFO);
            //Remove trailing zeroes of Hana DB read
            mapTruncateNumberStrings(aDbRead);            

            //Remove last element of csv data array (faulty/empty data)
            aCsvData.pop();
            
            //Reading DB data finished
            writeLog(tx, "T_CHARGEINFO", "Lesen der Datenbank beendet", aDbRead.length);

            //Looping over csv data
            for (var i = 0; i < aCsvData.length; i++) {
                var oCsvRow = aCsvData[i];
            
                //Data correction via db/tpa-T_DATAQUALITY.csv file
                correctLocationData(oCsvRow, aCorrections);

                //Build search string for HERE API
                var hereURL = "https://geocoder.api.here.com/6.2/geocode.json?app_id=iMSP70w5B8Mp4WEmXFcQ&app_code=QISnqOjeZCgmeVOLzEmaDQ&searchtext=" +
                oCsvRow.CI_LOCATION.replace(/ /g, "+");

                //push got requests into array
                aGotRequests.push(got(hereURL).json());
            }

            //Run all got requests in parallel and await their promises
            let aResponse = await Promise.all(aGotRequests);

            //Fill location data from Here API
            for (var i = 0; i < aCsvData.length; i++) {
                var oCsvRow = aCsvData[i];

                //Init additional location columns
                oCsvRow.CI_LATITUDE = 0.000000;
                oCsvRow.CI_LONGITUDE = 0.000000;
                oCsvRow.CI_COUNTRY = "";
                oCsvRow.CI_STATE = "";
                oCsvRow.CI_CITY = "";
                oCsvRow.CI_STREET = "";
                oCsvRow.CI_HOUSENUMBER = "";
                oCsvRow.CI_POSTALCODE = "";

                //Check response body for empty results
                if (aResponse[i].Response.View[0]) {
                    var oLocationFromApi = aResponse[i].Response.View[0].Result[0].Location;
                    oCsvRow.CI_LOCATION = oLocationFromApi.Address.Label;
                    oCsvRow.CI_LATITUDE = oLocationFromApi.DisplayPosition.Latitude
                    oCsvRow.CI_LONGITUDE = oLocationFromApi.DisplayPosition.Longitude
                    oCsvRow.CI_COUNTRY = oLocationFromApi.Address.Country;
                    oCsvRow.CI_STATE = oLocationFromApi.Address.State;
                    oCsvRow.CI_CITY = oLocationFromApi.Address.City;
                    oCsvRow.CI_STREET = oLocationFromApi.Address.Street === undefined ? '': oLocationFromApi.Address.Street;
                    oCsvRow.CI_HOUSENUMBER = oLocationFromApi.Address.HouseNumber === undefined ? '': oLocationFromApi.Address.HouseNumber;
                    oCsvRow.CI_POSTALCODE = oLocationFromApi.Address.PostalCode;
                }
                //Parse row to corresponding cds data types
                oCsvRow = mapStringsToEntityTypes(oCsvRow, T_CHARGEINFO);
            }

            //Sort csv data and db data by key(s)            
            /*const aDbRead = arraySort(aDbRead, "CI_ACTUALDATE");
            const aCsvData = arraySort(aCsvData, "CI_ACTUALDATE");*/

            //Compare db data with csv data (determining delta)
            //Find data to insert with key properties of data model
            var aAddedEntities = aCsvData.filter(objectA => !aDbRead.some(objectB => 
                objectA.CI_ACTUALDATE === objectB.CI_ACTUALDATE &&
                objectA.CI_CHARGEDURATION === objectB.CI_CHARGEDURATION &&
                objectA.CI_CHARGEID === objectB.CI_CHARGEID &&
                objectA.CI_LICENSEPLATE === objectB.CI_LICENSEPLATE
            ));

            //Find data to update, compare all properties
            var aEntitiesToUpdate = aDbRead.filter(objectA => !aCsvData.some(objectB => 
                objectA.CI_DATASOURCE === objectB.CI_DATASOURCE &&
                objectA.CI_ACTUALDATE === objectB.CI_ACTUALDATE &&
                objectA.CI_KWH === objectB.CI_KWH && 
                objectA.CI_CHARGEDURATION === objectB.CI_CHARGEDURATION &&
                objectA.CI_NETCOST === objectB.CI_NETCOST &&
                objectA.CI_CURRENCY === objectB.CI_CURRENCY &&
                objectA.CI_GROSSCOST === objectB.CI_GROSSCOST &&
                objectA.CI_CHARGEID === objectB.CI_CHARGEID &&
                objectA.CI_PROVIDER === objectB.CI_PROVIDER &&
                objectA.CI_LOCATION === objectB.CI_LOCATION &&
                objectA.CI_LICENSEPLATE === objectB.CI_LICENSEPLATE &&
                objectA.CI_LATITUDE === objectB.CI_LATITUDE &&
                objectA.CI_LONGITUDE === objectB.CI_LONGITUDE &&
                objectA.CI_COUNTRY === objectB.CI_COUNTRY &&
                objectA.CI_STATE === objectB.CI_STATE &&
                objectA.CI_CITY === objectB.CI_CITY &&
                objectA.CI_STREET === objectB.CI_STREET &&
                objectA.CI_HOUSENUMBER === objectB.CI_HOUSENUMBER &&
                objectA.CI_POSTALCODE === objectB.CI_POSTALCODE
            ));

            //Get delta between db and csv
            var aUpdatedEntities = aCsvData.filter(objectA => aEntitiesToUpdate.some(objectB => 
                objectA.CI_ACTUALDATE === objectB.CI_ACTUALDATE &&
                objectA.CI_CHARGEDURATION === objectB.CI_CHARGEDURATION &&
                objectA.CI_CHARGEID === objectB.CI_CHARGEID &&
                objectA.CI_LICENSEPLATE === objectB.CI_LICENSEPLATE
            ));

            //Push inserts and/or updates in tx run arrays
            var aRunInserts = dbInsert(aAddedEntities, T_CHARGEINFO, "T_CHARGEINFO", tx);
            var aRunUpdates = dbUpdate(aUpdatedEntities, T_CHARGEINFO, "T_CHARGEINFO", tx);

            //Run inserts
            if (aRunInserts.length > 0) {
                await tx.run(aRunInserts);
                console.log('RUN INSERT');
            }

            //Run updates
            if (aRunUpdates.length > 0) {
                await tx.run(aRunUpdates);
                console.log('RUN UPDATE');
            }

            return;
        })
    
        return super.init()
    }
}

module.exports = {
    tpaService
}
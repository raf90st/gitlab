const cds = require('@sap/cds')

cds.once('listening', ({ server }) => {
    server.keepAliveTimeout = 3 * 60 * 1000 // > 3 mins
})
module.exports = cds.server

cds.env.features.assert_integrity = false

const {
    WS0101_MD_Competition,
    WS0102_MD_MatchDay,
    WS0103_MD_Stadium,
    WS0104_MD_Club,
    WS0105_MD_Person,
    WS0106_MD_Fixture,
    WS0107_MD_Season,
    WS0303_MD_TeamStatistic,
    WS0303_MD_PlayerStatistic,
    WS0303_MD_MatchStatistic,
    Log,
    Statistics_Log,
    Modes,
    Services,
    Statistic_Services,
    Matches
} = cds.entities('dfl');


class dflService extends cds.ApplicationService {
    init() {

        const got = require('got');
        const xmlGot = got.extend(require("got-xml")({mergeAttrs: true, explicitArray: false}))
        const parseString = require('xml2js').parseString;
        const arraySort = require('array-sort');
        const {
            diff,
            addedDiff,
            deletedDiff,
            detailedDiff,
            updatedDiff
        } = require("deep-object-diff");
        const arrayDiff = require('diff-arrays-of-objects');

        /**
         * Returns Array of DB inserts.
         *
         * @param {array} aInserts array of entites that are in api read but not in db read
         * @param {entity} insertEntity DB entity where to insert.
         * @param {entity} logEntity Log Entity where inserts should be logged
         * @param {string} insertEntityName DB entity w/o namespace
         * @param {object} transaction transaction object
         * @return {array} array of inserts statements to execute
         */
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

        function removeNullProperties(element) {
            for (const property in element) {
                if (element[property] === null) {
                    delete element[property];
                }
            }
            return element;
        }

        function removeNullPropertiesRecursive(oEntity) {
            for (const property in oEntity) {
                var oElement = oEntity[property];

                if (Array.isArray(oElement)) {
                    for (var i = 0; i < oElement.length; i++) {
                        removeNullPropertiesRecursive(oElement[i]);
                    }
                }

                if (oElement === null) {
                    delete oEntity[property];
                }
            }
        }

        function mapXmlStringsToEntityTypesRecursive(oApiRead, oEntity) {
            for (var property in oApiRead) {
                var oEntityProperty = oEntity.elements[property];

                if (oEntityProperty) {
                    switch (oEntityProperty.type) {
                        case 'cds.Composition':
                            var sTableName = "";
                            var aRelations;
                            if (property == "TeamStatistic") {
                                sTableName = "WS0303_MD_TeamStatistic";
                                aRelations = oApiRead.TeamStatistic;
                            }

                            if (property == "PlayerStatistic") {
                                sTableName = "WS0303_MD_PlayerStatistic";
                                aRelations = oApiRead.PlayerStatistic;
                            }
                            var oRelationEntity = getServiceConfig(sTableName);
                            for (var i = 0; i < aRelations.length; i++) {
                                mapXmlStringsToEntityTypesRecursive(aRelations[i], oRelationEntity.oEntity);
                            }
                            break;
                        case 'cds.Boolean':
                            if (oApiRead[property] === 'true') {
                                oApiRead[property] = true;
                            }
                            if (oApiRead[property] === 'false') {
                                oApiRead[property] = false;
                            }
                            break;
                        case 'cds.Integer':
                            oApiRead[property] = parseInt(oApiRead[property]);
                            break;
                        case 'cds.Date':
                            oApiRead[property] = oApiRead[property].substring(6, 10) + '-' +
                                oApiRead[property].substring(3, 5) + '-' +
                                oApiRead[property].substring(0, 2);
                            break;
                        case 'cds.DateTime':
                            oApiRead[property] = new Date(oApiRead[property]).toISOString().slice(0,-5)+"Z";
                            break;
                        case 'cds.Decimal':
                            oApiRead[property] = parseFloat(oApiRead[property]);
                            break;
                    }
                }
            }
            return oApiRead;
        }

        function mapXmlStringsToEntityTypes(oXmlElement, oEntity) {
            for (const property in oXmlElement) {
                var oEntityProperty = oEntity.elements[property];
                if (oEntityProperty) {
                    switch (oEntityProperty.type) {
                        case 'cds.Boolean':
                            if (oXmlElement[property] === 'true') {
                                oXmlElement[property] = true;
                            }
                            if (oXmlElement[property] === 'false') {
                                oXmlElement[property] = false;
                            }
                            break;
                        case 'cds.Integer':
                            oXmlElement[property] = parseInt(oXmlElement[property]);
                            break;
                        case 'cds.Date':
                            oXmlElement[property] = oXmlElement[property].substring(6, 10) + '-' +
                                oXmlElement[property].substring(3, 5) + '-' +
                                oXmlElement[property].substring(0, 2);
                            break;
                        case 'cds.DateTime':
                            oXmlElement[property] = new Date(oXmlElement[property]).toISOString().slice(0,-5)+"Z";
                            break;
                        case 'cds.Decimal':
                            oXmlElement[property] = parseFloat(oXmlElement[property]);
                            break;
                    }
                }
            }
            return oXmlElement;
        }

        /**
         * Returns Array of DB updates.
         *
         * @param {array} aUpdates array of entites that are in api read but not in db read
         * @param {entity} updateEntity DB entity where to update.
         * @param {string} updateEntityName DB entity w/o namespace
         * @param {string} sTableKey primary key of DB entity
         * @param {object} transaction transaction object
         * @return {array} array of update statements to execute
         */
        function dbUpdate(aUpdates, updateEntity, updateEntityName, sTableKey, transaction) {
            var aRun = [];

            for (var i = 0; i < aUpdates.length; i++) {
                var oUpdateData = aUpdates[i];
                var sUpdateKey = oUpdateData[sTableKey];
                aRun.push(transaction.update(updateEntity, sUpdateKey).with(oUpdateData));
            }

            if (aUpdates.length > 0) {
                writeLog(transaction, updateEntityName, 'Update', aUpdates.length);
            }

            return aRun;
        }

        function insertForeignKeysIntoEntity(aEntity) {
            var aTeams = aEntity[0].TeamStatistic;
            var sMatchId = aEntity[0].MatchId;
            
            for (var i = 0; i < aTeams.length; i++) {
                aTeams[i].Match_MatchId = sMatchId;
                var sTeamId = aTeams[i].TeamId;
                var aPlayers = aTeams[i].PlayerStatistic;
                for (var n = 0; n < aPlayers.length; n++) {
                    aPlayers[n].Team_TeamId = sTeamId;
                    aPlayers[n].Team_Match_MatchId = sMatchId;
                }
            }
        }

        async function writeLog(tx, sTableName, sChangeType, sNumRecords) {
            var d = Date.now(); // new Date().toISOString().slice(0, 19).replace('T', ' ');
            var date = new Date(d);
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var logDate = day + ". " + month + ". " + year;
            var oUpdateLog = {
                TimeStamp: d,
                formattedDate: logDate,
                TableName: sTableName,
                ChangeType: sChangeType,
                NumberOfRecords: sNumRecords
            }
            await tx.insert(oUpdateLog).into(Log);
        }

        async function writeStatisticsLog(tx, sTableName, sChangeType, numRecords) {

            var d = Date.now(); // new Date().toISOString().slice(0, 19).replace('T', ' ');
            var date = new Date(d);
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var logDate = day + ". " + month + ". " + year;
            var oUpdateLog = {
                TimeStamp: d,
                formattedDate: logDate,
                TableName: sTableName,
                ChangeType: sChangeType,
                NumberOfRecords: numRecords
            }
            await tx.insert(oUpdateLog).into(Statistics_Log);
        }

        function getServiceConfig(sServiceId) {
            let oConfig = {
                fnMapper: (element) => {
                    for (const property in element) {

                    }
                    return element;
                }
            }
            switch (sServiceId) {
                case 'WS0101_MD_Competition':
                    oConfig.oEntity = WS0101_MD_Competition;
                    break;
                case 'WS0102_MD_MatchDay':
                    oConfig.oEntity = WS0102_MD_MatchDay;
                    break;
                case 'WS0103_MD_Stadium':
                    oConfig.oEntity = WS0103_MD_Stadium;
                    break;
                case 'WS0104_MD_Club':
                    oConfig.oEntity = WS0104_MD_Club;
                    oConfig.fnUrlMod = (url, params) => {
                        url += '/' + params.seasonId + '_' + params.competitionId;
                        return url;
                    };
                    break;
                case 'WS0105_MD_Person':
                    oConfig.oEntity = WS0105_MD_Person;
                    oConfig.fnMapper = (element) => {
                        element.FeedType = element.Type;
                        element.PersonId = element.ObjectId;
                        element.PersonName = element.Name;
                        delete element.ObjectId;
                        delete element.Type;
                        delete element.Name;
                        return element;
                    };
                    oConfig.fnUrlMod = (url, params) => {
                        url += '_Spieler/' + params.seasonId + '_' + params.clubId;
                        return url;
                    };
                    break;
                case 'WS0106_MD_Fixture':
                    oConfig.oEntity = WS0106_MD_Fixture;
                    oConfig.fnUrlMod = (url, params) => {
                        url += '/' + params.seasonId;
                        return url;
                    };
                    break;
                case 'WS0107_MD_Season':
                    oConfig.oEntity = WS0107_MD_Season;
                    break;
                case 'WS0303_MD_TeamStatistic':
                    oConfig.oEntity = WS0303_MD_TeamStatistic;
                    break;
                case 'WS0303_MD_PlayerStatistic':
                    oConfig.oEntity = WS0303_MD_PlayerStatistic;
                    break;
                case 'WS0303_MD_MatchStatistic':
                    oConfig.oEntity = WS0303_MD_MatchStatistic;
                    oConfig.fnUrlMod = (url, params) => {
                        url += '/' + params.matchId;
                        return url;
                    };
                    break;
            }
            return oConfig;
        }

        this.on('updateFromApi', async req => {
            let {
                ModeId,
                clientId,
                serviceId,
                seasonId,
                competitionId,
                clubId
            } = req.data;

            const tx = cds.tx(req);
            let url = "";
            var isProd = false;

            let response;
            let oService = await tx.read(Services, serviceId);

            const oServiceConfig = getServiceConfig(oService.TableName);
            const oEntity = oServiceConfig.oEntity;
            let oMode = await tx.read(Modes, ModeId);
            let protocol = (oMode.Port === '443') ? 'https://' : 'http://';

            if (oMode.ModeId === 1) {
                // clientId = 'sgf-23jk-9nr-ehjk';
                clientId = 'BxHpC5mMRv3JGFUks5oo466xNWpOv3bs1knMMKpQ';

                url = protocol + oMode.Url + ':' + oMode.Port + '/prod/DeliveryPlatform/REST/PullOnce/' + clientId + '/' + serviceId;

                if (oServiceConfig.fnUrlMod) {
                    url = oServiceConfig.fnUrlMod(url, {
                        seasonId: seasonId,
                        competitionId: competitionId,
                        clubId: clubId
                    });
                } else {
                    url = url + '/a';
                }

            } else {
                isProd = true;

                url = protocol + oMode.Url + ':' + oMode.Port + '/DeliveryPlatform/REST/PullOnce/' + clientId + '/' + serviceId;
            
                if (oServiceConfig.fnUrlMod) {
                    url = oServiceConfig.fnUrlMod(url, {
                        seasonId: seasonId,
                        competitionId: competitionId,
                        clubId: clubId
                    });
                }
            }

            console.log(">>> " + url);

            try {
                response = await xmlGot(url);
                //console.log(response.body);
                //=> '<!doctype html> ...'
            } catch (error) {
                console.log(error.response.body);
                //=> 'Internal server error ...'
                return;
            }

            if (response.body.PutDataRequest.Status ) {
                console.log("Fehler beim Lesen der API: " + response.body.PutDataRequest.Status.Description);
                return;
            }

            let aApiRead,
                aApiReadResult = [],
                aRunInserts = [],
                aRunUpdates = [],
                aDbReadResult,
                aNormalizedDB, aNormalizedApi, aDiffResult, aAddedEntities, aUpdatedEntities;

            aApiRead = response.body.PutDataRequest[oService.EntityNamePlural][oService.EntityName];

            //clean json object array
            for (var i = 0; i < aApiRead.length; i++) {
                aApiReadResult.push(mapXmlStringsToEntityTypes(aApiRead[i], oEntity))
            }

            //Function is there because Element with CompetitionId 'DFL-COM-J0000B'
            //exists several times, api delivers this wrong
            if (isProd && oService.EntityName === 'Competition') {
                aApiReadResult = aApiReadResult.filter(function(oApiObject) {
                    return oApiObject.CompetitionId != 'DFL-COM-J0000B';
                });
            }

            //Sorting json object array by given id sTableKey
            aApiReadResult = arraySort(aApiReadResult, oService.sTableKey);

            //DB read
            writeLog(tx, oService.TableName, 'Reading');
            aDbReadResult = await tx.read(oEntity);
            writeLog(tx, oService.TableName, 'Read finished', aDbReadResult.length);
            //Sorting DB read by given id sTableKey
            aDbReadResult = arraySort(aDbReadResult, oService.TableKey);

            //normalize object arrays to be able to compare them
            aNormalizedDB = aDbReadResult.map((item) => removeNullProperties(item));
            aNormalizedApi = aApiReadResult.map((item) => oServiceConfig.fnMapper(item));

            //compare DB json array with API json array
            aDiffResult = arrayDiff(aNormalizedDB, aNormalizedApi, oService.TableKey);
            aAddedEntities = aDiffResult['added'];
            aUpdatedEntities = aDiffResult['updated'];

            //push inserts and/or updates in run arrays
            aRunInserts = dbInsert(aAddedEntities, oEntity, oService.TableName, tx);
            aRunUpdates = dbUpdate(aUpdatedEntities, oEntity, oService.TableName, oService.TableKey, tx);

            //run insert and/or updates if anything is to run/update
            if (aRunInserts.length > 0) {
                await tx.run(aRunInserts);
                console.log('RUN INSERT');
            }

            if (aRunUpdates.length > 0) {
                await tx.run(aRunUpdates);
                console.log('RUN UPDATE');
            }

            writeLog(tx, oService.TableName, 'Finished');

            return;
        })

        this.on('updateStatisticsFromApi', async req => {
            let {
                ModeId,
                clientId,
                serviceId,
                matchId,
                updateAll
            } = req.data;

            const tx = cds.tx(req);
            let url = "";
            var isProd = false;

            let response;
            let oService = await tx.read(Statistic_Services, serviceId);

            const oServiceConfig = getServiceConfig(oService.TableName);
            const oEntity = oServiceConfig.oEntity;
            let oMode = await tx.read(Modes, ModeId);
            let protocol = (oMode.Port === '443') ? 'https://' : 'http://';

            if (oMode.ModeId === 1) {
                // clientId = 'sgf-23jk-9nr-ehjk';
                clientId = 'BxHpC5mMRv3JGFUks5oo466xNWpOv3bs1knMMKpQ';

                url = protocol + oMode.Url + ':' + oMode.Port + '/prod/DeliveryPlatform/REST/PullOnce/' + clientId + '/' + serviceId;

                if (oServiceConfig.fnUrlMod) {
                    url = oServiceConfig.fnUrlMod(url, {
                        matchId: matchId
                    });
                }

            } else {
                isProd = true;
                url = protocol + oMode.Url + ':' + oMode.Port + '/DeliveryPlatform/REST/PullOnce/' + clientId + '/' + serviceId;

                if (oServiceConfig.fnUrlMod) {
                    url = oServiceConfig.fnUrlMod(url, {
                        matchId: matchId
                    });
                }
            }

            console.log(">>> " + url);

            try {
                response = await xmlGot(url);
                //console.log(response.body);
                //=> '<!doctype html> ...'
            } catch (error) {
                console.log(error.response.body);
                //=> 'Internal server error ...'
                return;
            }

            let aApiReadResult = [],
                oApiResponse,
                aAddedEntities = [],
                aUpdatedEntities = [],
                aDbReadResult,
                oApiMappingRes,
                aDiffResult;

            oApiResponse = response.body.PutDataRequest[oService.EntityName];

            writeStatisticsLog(tx, oService.TableName, 'Reading');

            if (updateAll) {
                var oFixturesService = getServiceConfig(WS0106_MD_Fixture);
                aDbMatchIdResult = await tx.read(oFixturesService);
            }

            aDbReadResult = await tx.read(SELECT.from(oEntity, m => {
                m['*'], 
                m["TeamStatistic"](t => {
                    t['*'], 
                    t["PlayerStatistic"]('*')
                })
            }).where({ MatchId: matchId }));

            writeStatisticsLog(tx, oService.TableName, 'Read finished', aDbReadResult.length);

            if (aDbReadResult.length > 0) {
                writeStatisticsLog(tx, "WS0303_MD_TeamStatistic", 'Read finished', aDbReadResult[0]["TeamStatistic"].length);
                writeStatisticsLog(tx, "WS0303_MD_PlayerStatistic", 'Read finished', 
                aDbReadResult[0]["TeamStatistic"][0]["PlayerStatistic"].length + 
                aDbReadResult[0]["TeamStatistic"][1]["PlayerStatistic"].length);
            }

            oApiMappingRes = mapXmlStringsToEntityTypesRecursive(oApiResponse, oEntity);
            aApiReadResult.push(oApiMappingRes);
            
            aDbReadResult = arraySort(aDbReadResult, oService.TableKey);
            aApiReadResult = arraySort(aApiReadResult, oService.TableKey);

            //normalize object arrays to be able to compare them
            removeNullPropertiesRecursive(aDbReadResult[0]);

            aDiffResult = arrayDiff(aDbReadResult, aApiReadResult, oService.TableKey);
            aAddedEntities = aDiffResult['added'];

            if (aAddedEntities.length > 0) {
                await tx.run(INSERT.into(oEntity).entries(aAddedEntities[0]));
                writeStatisticsLog(tx, oService.TableName, 'Insert', aAddedEntities.length);
                writeStatisticsLog(tx, "WS0303_MD_TeamStatistic", 'Insert', aAddedEntities[0]["TeamStatistic"].length);
                writeStatisticsLog(tx, "WS0303_MD_PlayerStatistic", 'Insert', 
                aAddedEntities[0]["TeamStatistic"][0]["PlayerStatistic"].length + 
                aAddedEntities[0]["TeamStatistic"][1]["PlayerStatistic"].length);
            } else {
                insertForeignKeysIntoEntity(aApiReadResult);
                aDiffResult = arrayDiff(aDbReadResult, aApiReadResult, oService.TableKey);
                aUpdatedEntities = aDiffResult['updated'];
            }
            
            if (aUpdatedEntities.length > 0) {
                await tx.run(UPDATE(oEntity).where({MatchId: matchId}).set(aUpdatedEntities[0]));
                writeStatisticsLog(tx, "WS0303_MD_TeamStatistic", 'Update', aUpdatedEntities[0]["TeamStatistic"].length);
                writeStatisticsLog(tx, "WS0303_MD_PlayerStatistic", 'Update', 
                aUpdatedEntities[0]["TeamStatistic"][0]["PlayerStatistic"].length + 
                aUpdatedEntities[0]["TeamStatistic"][1]["PlayerStatistic"].length);
            }

            writeStatisticsLog(tx, oService.TableName, 'Finished');

            return;

        })

        return super.init()
    }
}
module.exports = {
    dflService
}
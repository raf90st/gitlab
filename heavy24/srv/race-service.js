const cds = require('@sap/cds');
const dbClass = require("sap-hdbext-promisfied");
const hdbext = require("@sap/hdbext");       
const { setIntervalAsync } = require('set-interval-async/dynamic');

/*
Description  of the CDS service implementation with different event handlers 
can be found in OpenSAP Course for CAP week 2 Unit 5 and Unit 6:
https://open.sap.com/courses/cp7/items/2DW6s1Zzx1xEy18Aa8IQIN
https://open.sap.com/courses/cp7/items/6G78UFuIFvlAuJvFLRODH6
*/

module.exports = class RaceService extends cds.ApplicationService {    
    async init() {
        await super.init()
        const db = await cds.connect.to('db');
        this.schema = db.options.kind === 'sqlite'?null: cds.env.requires.hana.credentials.schema;
       
        const { Athlete, LapPlan, Heavy24Results, LapResult, MasterData, ApiReads, Splits, SplitResult } = db.entities('tf.heavy24');
        this.Heavy24Results = Heavy24Results;
        this.LapResult = LapResult;
        this.Splits = Splits;
        this.SplitResult = SplitResult;
        this.MasterData = MasterData;
        this.LapPlan = LapPlan;

        // get active Event
        let selEvent =  SELECT.from('Event').where({Active: true});
        let ActiveEventId = await db.run (selEvent);

         if( ActiveEventId.length != 1) {
             this._log('Error: Only one active event is allowed. Active events: ' + ActiveEventId.length);
             return;
         } else {
            this._log('Active event: ' + ActiveEventId[0].EventName + " " + ActiveEventId[0].Year);             
         }

        
        
        this.startAutomaticReads(db, ApiReads, ActiveEventId[0].ID);
        
        // readMasterData as action to allow manual loading via Postman
        this.on('readMasterData', async req => {        
            let aMasterDataApiReads = await db.read(ApiReads).where({Event_Id: 2, Type: "masterData"});
            await this.readMasterData(db, aMasterDataApiReads[0].url); 
        }),

        // deleteResults as action to allow manual deletion via Postman
        this.on('deleteResults', async req => {                
            await db.delete(this.Heavy24Results);
            await db.delete(this.LapResult);
            await db.delete(this.Splits);
            await db.delete(this.SplitResult);
        }),

        this.on('insertLap', async req => {    
            await this._insertLap(req); 
        }),     
        this.on('removeLap', async req => {    
            await this._removeLap(req); 
        }),     

        this.after (['CREATE','UPDATE'], 'LapPlan', this._LapPlanUpdate),

        this.after (['UPDATE'], 'Athletes', async (oAthlete, req) => { 
                const tx = cds.tx(req); 
                var oReadAthlete = await tx.read(Athlete, oAthlete);                
                await this._calcPredictedStartTime(oReadAthlete.Team_ID, req);
            }
        ),  
     

        this.on('changeSortOrder', async req => {
            let { athleteId, refAthleteId, bAfter } = req.data;
            const tx = cds.tx(req);
            
            var selAthlete = SELECT.from ('Athlete')
                .columns('ID', 'Team_ID')
                .where({ ID: athleteId });

            var athleteToBeSorted = await tx.run(selAthlete);

            var selSortedAthletes = SELECT.from ('Athlete')
                .columns('ID', 'StartNumber', 'SortOrder')
                .where({ Team_ID: athleteToBeSorted[0].Team_ID })
                .orderBy`SortOrder, StartNumber`;

            var athletesToBeSorted = await tx.run(selSortedAthletes);
           
            for (var athl = 0; athl < athletesToBeSorted.length; athl++) {
                 if (athletesToBeSorted[athl].ID === athleteId) {
                    var athleteToBeMoved = athletesToBeSorted[athl];
                    athletesToBeSorted.splice(athl, 1);
                    break;
                }
            }
           
            var athlSorted = 0;
            var athletesSorted = [];
            for (var athl2 = 0; athl2 < athletesToBeSorted.length; athl2++) {
                if (athletesToBeSorted[athl2].ID === refAthleteId) {
                    if (bAfter) {
                        athletesSorted[athlSorted] = athletesToBeSorted[athl2];
                        athletesSorted[athlSorted].SortOrder = athlSorted + 1;
                        athlSorted++;
                        athletesSorted[athlSorted] = athleteToBeMoved;
                        athletesSorted[athlSorted].SortOrder = athlSorted + 1;
                        athlSorted++;
                    } else {
                        athletesSorted[athlSorted] = athleteToBeMoved;
                        athletesSorted[athlSorted].SortOrder = athlSorted + 1;
                        athlSorted++;
                        athletesSorted[athlSorted] = athletesToBeSorted[athl2];
                        athletesSorted[athlSorted].SortOrder = athlSorted + 1;
                        athlSorted++;                        
                    }
                } else {
                    athletesSorted[athlSorted] = athletesToBeSorted[athl2];
                    athletesSorted[athlSorted].SortOrder = athlSorted + 1;
                    athlSorted++; 
                }
            }

            let aRunUpdates = [];
            for (var athl3 = 0; athl3 < athletesSorted.length; athl3++) {
                var updAthletesSorted = UPDATE ('Athlete')
                    .with ({SortOrder: athletesSorted[athl3].SortOrder})
                    .where({ID: athletesSorted[athl3].ID});
                aRunUpdates.push(updAthletesSorted);
            }
                       
            await tx.run(aRunUpdates);
            this._log('changeSortOrder for Athletes');
        });        
    }

    async startAutomaticReads(db, ApiReads, eventId) {        
        let aActiveApiReads = await db.read(ApiReads).where({Active: true});
        
        this.startAutomaticRead(aActiveApiReads, 0, db, eventId); 
    }

    startAutomaticRead(aActiveApiReads, index, db, eventId){
        
        if(!aActiveApiReads || aActiveApiReads.length == 0) return;

        let oAutomaticRead = aActiveApiReads[index];
        this._log("startAutomaticRead() " + oAutomaticRead.Type + ", sec: " + oAutomaticRead.frequencyInSeconds); 
        setIntervalAsync( async () => {   
            switch(oAutomaticRead.Type) {
                case 'masterData':
                    await this.readMasterData(db, oAutomaticRead.url, eventId); 
                    break;
                case 'results':
                    await this.readResults(db, oAutomaticRead.url, eventId);                    
                    break; 
                case 'split1':                                       
                    await this.readSplits(db, 1, oAutomaticRead.url, eventId);
                    break;                       
                case 'split2':                                       
                    await this.readSplits(db, 2, oAutomaticRead.url, eventId);
                    break;  
                case 'split3':                                       
                    await this.readSplits(db, 3, oAutomaticRead.url, eventId);
                    break;                                          
            }
           
        }, oAutomaticRead.frequencyInSeconds * 1000);

        // wait two seconds and call function with next array item, until done.
        if (index < aActiveApiReads.length -1 ){
            index += 1;
            setTimeout(() => { this.startAutomaticRead(aActiveApiReads, index, db, eventId)}, 2000);  
        }  
    }   

    async readResults(tx, apiURL, eventId) {     
    
        const got = require('got');   

        try {
            const response = await got(apiURL);
            let json = JSON.parse(response.body);
       
            this._log('readResults - before delete');
            await tx.delete(this.Heavy24Results);

            if( json.data.length === 0) {
                this._log("no data from API " + apiURL);
                return;
            }
            
            let aRunInserts = [];
            json.data.forEach(element => {
                var oResult = {}
                oResult.id = element[0];
                oResult.TeamCategory = element[1];
                oResult.LapNumber = element[2];
                oResult.StartNumber = element[3];
                oResult.AthleteName = element[4];
                oResult.LapTime = element[5];
                oResult.LapEndFromContestBegin = element[6];
                oResult.ContestStanding = element[7];
                oResult.TeamName = element[8];                
                
                // cr = tx.insert(oResult).into(Heavy24Results).then();
                
                //aRunInserts.push(tx.insert(oResult).into(Heavy24Results)); // push inserts into an array
                // feedback from SAP (see ticket: https://launchpad.support.sap.com/#/incident/pointer/002075129400003702602021):
                //aRunInserts.push(tx.run(INSERT.into(Heavy24Results).entries(oResult)));
                aRunInserts.push(oResult);
            });

            
            this._log('readResults - before insert (count: '+ aRunInserts.length + ')');
            //await tx.run(aRunInserts);
            // feedback from SAP:
            //await Promise.all(aRunInserts);
            tx.run(INSERT.into(this.Heavy24Results).entries(aRunInserts));
                                 
            if( tx.options.kind === 'sqlite') return;
        
            // see the following video how to call a procedure from CAP https://www.youtube.com/watch?v=wdfJ4ZP4aQs&ab_channel=SAPDevelopers

            // Pierre: Der Procedureaufruf wird wahrscheinlich das Problem mit den langen Zeiten beim Update
            // verursachen. Wenn die App hier mit Zugriff auf die HANA ausgeführt wird, 
            // so stehen die Daten sehr schnell in der Tabelle Heavy24Results, aber kommen nicht in RaceResults an.
            // Dafür ist die Procedure verantwortlich
                    
            let dbConn = new dbClass(await dbClass.createConnection(tx.options.credentials));
            const sp  = await dbConn.loadProcedurePromisified(hdbext,this.schema,'UpdateResultsImport' );                        
            const params = {"IM_EVENTID": eventId, "IM_SIMLAPS":1};

            const result = await dbConn.callProcedurePromisified(sp, params); 
            this._log('readResults - after Procedure call ');
            return result;  

            
        } catch (error) {
            this._log(error);
        }
        
    }

    async readMasterData(tx, apiURL, eventId) {     
    
        const got = require('got');            
        
        try {
            const response = await got(apiURL);
            let json = JSON.parse(response.body);

            await tx.delete(this.MasterData);

            if( json.data.length === 0) {
                this._log("no data from API " + apiURL);
                return;
            }            
            
            let aRunInserts = [];
            json.data.forEach(async element => {
                var oResult = {}
                oResult.TeamName = element[1];
                oResult.FirstName = element[2];
                oResult.LastName = element[3];
                oResult.StartNumber = element[4];
                oResult.TeamCategory = element[5];
                oResult.GenderCategory = element[6];
                oResult.Gender = element[7];
            
                aRunInserts.push(oResult);
            });
            
            this._log('readMasterData (count: '+ aRunInserts.length + ')');
            tx.run(INSERT.into(this.MasterData).entries(aRunInserts));  
            
            if( tx.options.kind === 'sqlite') return;

          
            let dbConn = new dbClass(await dbClass.createConnection(tx.options.credentials));
            const sp  = await dbConn.loadProcedurePromisified(hdbext,this.schema,'UpdateMasterDataImport' );    
            const params = {"EVENTID":eventId};                    
            
            const result = await dbConn.callProcedurePromisified(sp, params);            
            return result;
  
        } catch (error) {
            this._log(error);            
        }     
    } 

    async readSplits(tx, split, apiURL, eventId) {     
    
        const got = require('got');            

        try {
            const response = await got(apiURL);
            let json = JSON.parse(response.body);
            
            // delete old data for current split
            await tx.delete(this.Splits).where({SplitNr:split});

            if( json.data.length === 0) {
                this._log("no data from API " + apiURL);
                return;
            }
            
            let aRunInserts = [];
            json.data.forEach(element => {
                // get seconds from contest begin from time 14:30:25
                var hours = parseInt(element[2].substring(0, 2));
                var minutes = parseInt(element[2].substring(3, 5));
                var seconds = parseInt(element[2].substring(6, 8));
                var secsFromContestBegin = (hours * 3600 + minutes * 60 + seconds);                            

                var oResult = {}                
                oResult.StartNumber = element[1];
                oResult.SplitNr = split;                
                oResult.SplitStartSecsFromContestBegin = secsFromContestBegin;

                aRunInserts.push(oResult);
            });
           
            this._log('readSplits '+ split +' (count: '+ aRunInserts.length + ')');
            tx.run(INSERT.into(this.Splits).entries(aRunInserts)); 

            if( tx.options.kind === 'sqlite') return;

          
            let dbConn = new dbClass(await dbClass.createConnection(tx.options.credentials));
            const sp  = await dbConn.loadProcedurePromisified(hdbext,this.schema,'CalculateSplits' );    
            const params = {"EVENTID":eventId};     

            const result = await dbConn.callProcedurePromisified(sp, params);     
            this._log('readSplits - after Procedure call ');       
            return result;

        } catch (error) {
            this._log(error);            
        }   
    }

    async _LapPlanUpdate(LapPlan, req) {
        await this._calcPredictedStartTime(LapPlan.TeamID, req);
    }
   
    /** calculate predicted start time for a team after lap plan changes */
    async _calcPredictedStartTime(teamID, req) {                
        const tx = cds.tx(req); 

        // get the last finished lap for the team including the endtime          
        var selMaxLap = SELECT.from ('LapResult')
            .columns('LapNr', 'Athlete_ID', 'EndTime')
            .where({ TeamID: teamID })
            .orderBy`LapNr desc` // IMPORTANT use ` instead of '
            .limit(1);           
              
        var maxLapResults = await tx.run(selMaxLap); // result will be an array but with "limit(1)" there will be one record only
        var maxLapResult = maxLapResults[0];
        this._log("_calcPredictedStartTime() maxLapResult: " + maxLapResult);         

        // calculate the next plan laps. There are two scenarios
        // scenario 1: no actual race result is available (maxLapResult.LapNr = empty) -> calculate from contest start time (all rounds are planned rounds)
        // scenario 2: actual race results are available (maxLapResult.LapNr) -> calculate from end time of last finished round
        let planLaps;
        let startTime;
        if (maxLapResult && maxLapResult.LapNr) {
            // scenario 2: select from LapPlan all laps > maxLapResult and calculate the new predicted start time
            var selPlanLaps = SELECT.from ('LapPlan', l => {
                    l.Athlete(a => {a.DefLapTime})
                })
                .columns('LapNr', 'Athlete_ID', 'PredictedStartTime', 'DefLapTime')
                .where({TeamID: teamID, and: {LapNr: { '>': maxLapResult.LapNr }}}) // where TeamID = xyz and LapNr > maxLapResult.LapNr                
                .orderBy('LapNr'); 
            planLaps = await tx.run(selPlanLaps);
            
            // use last round end time as new start time
            startTime = maxLapResult.EndTime;         

        } else {
            // scenario 1: no lap result available -> calculate from contest start time all plan laps. -> get contest start time
            var raceStart = await tx.run(SELECT.from('Team', t => { // projection
                    t.Contest(c => {c.StartTime}) // nested projection => 1st $expand
                }).where({ ID: teamID }));  
            
            if(raceStart.length == 0) {
                this._log("Error: Contest or Team data missing");
                return;
            }

            startTime = raceStart[0].Contest.StartTime;
            
            // select all plan laps to calculate from contest start time  
            var selPlanLaps2 = SELECT.from ('LapPlan', l => {
                    l.Athlete(a => {a.DefLapTime})
                })
                .columns('LapNr', 'Athlete_ID', 'PredictedStartTime', 'DefLapTime')
                .where({TeamID: teamID})
                .orderBy('LapNr');             
            planLaps = await tx.run(selPlanLaps2);                        
        }

        this._log("next start time: " + startTime);
        this._log(planLaps);

        // loop over all plan laps and calculate the predicted start time
        var parsedStartTime = new Date(Date.parse(startTime));                
        var prevAthleteDefLapTime = 0;

        for (let p of planLaps) {
            // first planned round = end time last actual round (already in startTime)
            // -> prevAthleteDefLapTime = 0

            p.LapTime = p.DefLapTime * 60; // lap time in seconds
            this._log("deflaptime: " + p.LapTime);
            parsedStartTime = new Date(parsedStartTime.getTime() + (1000 * prevAthleteDefLapTime * 60))
            // save Timestamp as DateTime-String without milliseconds
            p.PredictedStartTime =  parsedStartTime.toISOString().replace(".000","");
          
            // TODO: instert update statements in array and execute once after the loop
            var updLapPlan = UPDATE ('LapPlan')
                .with ({PredictedStartTime: p.PredictedStartTime, LapTime: p.LapTime})
                .where({TeamID: teamID, LapNr: p.LapNr});
            await tx.run(updLapPlan);

            // set the default time for the next loop
            prevAthleteDefLapTime = p.DefLapTime;
        }
        
        this._log("predicted start times updated");       
    }

    _log(txt) {
        console.log(new Date(Date.now()).toISOString() + ' ' + txt);        
    }

    async _insertLap(req) {
        let { teamId, lapNr } = req.data;
        const tx = cds.tx(req);
        
        var selMaxLap = SELECT.from('LapPlan')
            .columns('LapNr')
            .where({ TeamID: teamId })
            .orderBy`LapNr desc`
            .limit(1);    
        var maxLapResults = await tx.run(selMaxLap);
        var maxLap = maxLapResults[0];

        if (maxLapResults.length === 0) return;

        var selLaps = SELECT.from('LapPlan')
            .columns('LapNr', 'Athlete_ID', 'PredictedStartTime', 'LapTime')
            .where({ TeamID: teamId })
            .orderBy`LapNr desc`;
        var planLaps = await tx.run(selLaps);   

        let aRunInserts = [];
        let aRunUpdates = [];
        let aRunDeletes = [];
        let lastUpdLapNr;
        let delLapNr;
        if (lapNr < maxLap.LapNr) {  
            for (let lap of planLaps) {
                var nextLapNr = lap.LapNr + 1;
                if ((lastUpdLapNr > nextLapNr) && (nextLapNr > lapNr)) {
                    for (var l = lastUpdLapNr; l > nextLapNr; l--) {
                        var delLap = DELETE.from('LapPlan')
                            .where({TeamID: teamId, LapNr: l});
                        aRunDeletes.push(delLap);
                    }
                }

                if (lap.LapNr === maxLap.LapNr) {
                    delLapNr = lap.LapNr;
                    var oInsert = {}
                    oInsert.TeamID = teamId;
                    oInsert.LapNr = nextLapNr;
                    oInsert.Athlete_ID = lap.Athlete_ID;
                    oInsert.PredictedStartTime = lap.PredictedStartTime;
                    oInsert.LapTime = lap.LapTime;
                    aRunInserts.push(oInsert);
                    lastUpdLapNr = lap.LapNr;
                } else {
                    var updLapNr = lapNr + 1;
                    if (lap.LapNr >= updLapNr) {
                        delLapNr = lap.LapNr;
                        if (nextLapNr === lastUpdLapNr) {
                            var updLapPlan = UPDATE ('LapPlan')
                                .with ({Athlete_ID: lap.Athlete_ID, PredictedStartTime: lap.PredictedStartTime, LapTime: lap.LapTime})
                                .where({TeamID: teamId, LapNr: nextLapNr});
                            aRunUpdates.push(updLapPlan);
                        } else {
                            var oInsert2 = {}
                            oInsert2.TeamID = teamId;
                            oInsert2.LapNr = nextLapNr;
                            oInsert2.Athlete_ID = lap.Athlete_ID;
                            oInsert2.PredictedStartTime = lap.PredictedStartTime;
                            oInsert2.LapTime = lap.LapTime;
                            aRunInserts.push(oInsert2);
                        }
                        lastUpdLapNr = lap.LapNr;
                    }
                }
            }
                       
            tx.run(INSERT.into(this.LapPlan).entries(aRunInserts));
            await tx.run(aRunUpdates);

            var delLap2 = DELETE.from('LapPlan')
                .where({TeamID: teamId, LapNr: delLapNr});
            aRunDeletes.push(delLap2);
            await tx.run(aRunDeletes);
        }

        this._log('Insert new lap in plan data');
    }

    async _removeLap(req) {
        let { teamId, lapNr } = req.data;
        const tx = cds.tx(req);
        
        var selMaxLap = SELECT.from('LapPlan')
            .columns('LapNr')
            .where({ TeamID: teamId })
            .orderBy`LapNr desc`
            .limit(1);    
        var maxLapResults = await tx.run(selMaxLap);
        var maxLap = maxLapResults[0];

        if (maxLapResults.length === 0) return;

        var selLaps = SELECT.from('LapPlan')
            .columns('LapNr', 'Athlete_ID', 'PredictedStartTime', 'LapTime')
            .where({ TeamID: teamId })
            .orderBy`LapNr asc`;
        var planLaps = await tx.run(selLaps);   

        let aRunInserts = [];
        let aRunUpdates = [];
        let aRunDeletes = [];
        var lastUpdLapNr = 0;
        if (lapNr <= maxLap.LapNr) {  
            for (let lap of planLaps) {
                if ((lastUpdLapNr === 0) && (lap.LapNr === maxLap.LapNr)) {
                    var delLap = DELETE.from('LapPlan')
                        .where({TeamID: teamId, LapNr: lap.LapNr});
                    aRunDeletes.push(delLap);                
                } else {
                    if (lap.LapNr >= lapNr) {
                        if ((lastUpdLapNr === 0) && (lap.LapNr === lapNr)) {
                            lastUpdLapNr = lap.LapNr;
                        } else {
                            var prevLapNr = lap.LapNr - 1;
                            if (lastUpdLapNr === prevLapNr) {
                                var updLapPlan = UPDATE ('LapPlan')
                                    .with ({Athlete_ID: lap.Athlete_ID, PredictedStartTime: lap.PredictedStartTime, LapTime: lap.LapTime})
                                    .where({TeamID: teamId, LapNr: prevLapNr});
                                aRunUpdates.push(updLapPlan);
                                lastUpdLapNr = lap.LapNr;
                            } else {
                                if ((lastUpdLapNr != 0) && (prevLapNr > lastUpdLapNr)) {
                                    for (var l = lastUpdLapNr; l < prevLapNr; l++) {
                                        var delLap2 = DELETE.from('LapPlan')
                                            .where({TeamID: teamId, LapNr: l});
                                        aRunDeletes.push(delLap2);
                                    }
                                }

                                var oInsert = {}
                                oInsert.TeamID = teamId;
                                oInsert.LapNr = prevLapNr;
                                oInsert.Athlete_ID = lap.Athlete_ID;
                                oInsert.PredictedStartTime = lap.PredictedStartTime;
                                oInsert.LapTime = lap.LapTime;
                                aRunInserts.push(oInsert);
                                lastUpdLapNr = lap.LapNr;
                            }
                        }
                    }
                }
            }

            if (aRunInserts.length > 0) {
                tx.run(INSERT.into(this.LapPlan).entries(aRunInserts));
            }
            await tx.run(aRunUpdates);

            var delLap3 = DELETE.from('LapPlan')
                .where({TeamID: teamId, LapNr: lastUpdLapNr});
            aRunDeletes.push(delLap3);
            await tx.run(aRunDeletes);
        }

        this._log('Remove lap from plan data');        
    }
}


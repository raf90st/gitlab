using tf.heavy24 as h24 from '../db/data-model';

@path: '/race'
//@impl: './race-service-test.js'
service RaceService {
    entity Athletes as projection on h24.Athlete;
    entity Managers as projection on h24.Manager;
    entity Teams as projection on h24.Team {*, Athletes : redirected to Athletes};    
    entity RaceResultsCombined as projection on h24.RaceResultsCombined;   
    entity RaceResultsCombinedAthlete as projection on h24.RaceResultsCombinedAthlete;            
    entity TeamOverview as projection on h24.TeamOverview;  
    entity AthleteOverview as projection on h24.AthleteOverview;
    entity LapPlan as projection on h24.LapPlan;    
    entity LapResults as projection on h24.LapResult;   
    entity Heavy24Results as projection on h24.Heavy24Results;     
    entity AthletePictures as projection on h24.AthletePicture;
    entity TeamMaxLapFinished as projection on h24.TeamMaxLapFinished;           
    entity SplitResults as projection on h24.SplitResult;
    entity Splits as projection on h24.Splits;
    entity SplitsCombined as projection on h24.SplitsCombined;
    entity LapResultForSplit as projection on h24.LapResultForSplit;
    entity ApiReads as projection on h24.ApiReads;
    entity Contests as projection on h24.Contest;
    entity Events as projection on h24.Event;


    // tmp
    entity TeamGetNextStartAthlete as projection on h24.TeamGetNextStartAthlete; 
    entity RaceResultsAllActual as projection on h24.RaceResultsAllActual;
    entity TeamGetCurrentAthlete as projection on h24.TeamGetCurrentAthlete;
    entity LastFinishedAthleteLap as projection on h24.LastFinishedAthleteLap;
    entity RaceResultsCombinedAthleteLastLap as projection on h24.RaceResultsCombinedAthleteLastLap;   
    entity TeamCurrentRank as projection on h24.TeamCurrentRank;   
    entity TeamLastFinishedLap as projection on h24.TeamLastFinishedLap;    
    entity TeamBehindAndAhead as projection on h24.TeamBehindAndAhead;     
    
         
    action readMasterData();
    action deleteResults();
    action changeSortOrder(athleteId: Integer, refAthleteId: Integer, bAfter: Boolean);
    action insertLap(teamId: Integer, lapNr: Integer);
    action removeLap(teamId: Integer, lapNr: Integer);
}
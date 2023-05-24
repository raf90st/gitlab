namespace tf.heavy24;

entity Athlete {
    key ID          : Integer;
        StartNumber : String(6);
        Gender      : String(1);
        FirstName   : String(20);
        LastName    : String(20);
        FullName    : String(42);
        SortOrder   : Integer;        
        Team        : Association to Team;
        DefLapTime  : Integer;
        Event       : Association to Event;
        PictureUrl  : String(255);
};

entity AthletePicture {  
  key ID        : Integer;    
  image         : LargeBinary @Core.MediaType: 'image/png';  
};

entity Manager {
    key ID      : UUID;
    FirstName   : String(20);
    LastName    : String(20);
    Email       : String(100);
    Teams       : Association to many Team
                    on Teams.Manager = $self;    
};

entity Team  {
    key ID       : Integer;
        Token    : String(32);
        Number   : String(6);
        TeamName : String(80);
        Contest  : Association to Contest;
        Icon     : String(20);
        Event    : Association to Event;
        Manager  : Association to Manager;
        Athletes : Association to many Athlete
                       on Athletes.Team = $self;
};

entity Contest {
    key ID             : Integer;
        ContestName    : String(20);
        Category       : String(20);
        GenderCategory : String(20);
        Event          : Association to Event;
        StartTime      : DateTime;
        EndTime        : DateTime;
};

entity Event {
    key ID        : Integer;
        EventName : String(40);
        Year      : String(4);
        Date      : Date;
        Type      : String(30);
        Timezone  : String(5);
        Active    : Boolean;
};

entity LapResult {
    key TeamID                       : Integer;
    key LapNr                        : Integer;
        Athlete                      : Association to Athlete;
        LapTime                      : Integer;
        LapStartSecsFromContestBegin : Integer;
        StartTime                    : DateTime;        // it's always in UTC 
        EndTime                      : DateTime;        // it's always in UTC
        ContestRank                  : Integer;
};

entity LapPlan {
    key TeamID             : Integer;
    key LapNr              : Integer;
        Athlete            : Association to Athlete;
        PredictedStartTime : DateTime;
        LapTime            : Integer;
};

entity SplitResult {
    key TeamID                         : Integer;
    key LapNr                          : Integer;
    key SplitNr                        : Integer;
        Athlete                        : Association to Athlete;
        SplitTime                      : Integer;
        SplitStartSecsFromContestBegin : Integer;
        StartTime                      : DateTime;
        EndTime                        : DateTime;
};

// view to show how many laps each team can run and when the last start time will be
entity MaxLapAndStartTime  as
    select from LapPlan as L  
    inner join Team as T
        on L.TeamID = T.ID
    {
        key L.TeamID   as TeamID,            
        max(
            L.LapNr
        )          as Highest_Lap : Integer,
        max(
            PredictedStartTime
        )          as LastStart   : DateTime
    
    }
    where
        PredictedStartTime <= T.Contest.EndTime
    group by
        L.TeamID,
        T.TeamName;

define view TeamMaxLapFinished as
    select from Team as T
    left outer join LapResult as L
    on L.TeamID = T.ID {
        key T.ID           as TeamID,
        T.Contest.Event.ID as EVENT_ID,
        // execute different operations and use first result <> NULL
        COALESCE(max(
            L.LapNr
        ),0)                  as TEAM_LAP_MAX: Integer
    }
    group by
        T.ID,
        T.Contest.Event.ID;


define view RaceResultsUnion as
        select from LapResult {
            TeamID as TeamID,
            LapNr  as LapNr
        }
    union
        select from LapPlan {
            TeamID as TeamID,
            LapNr  as LapNr
        }
        where
            TeamID is not null;

define view LapResultForSplit as
    select from LapResult {
        key TeamID,
        key LapNr,
        LapTime,
        LapStartSecsFromContestBegin,
        LapStartSecsFromContestBegin + LapTime as LapEndSecsFromContestBegin : Integer
    }
    where
        TeamID is not null;

define view SplitsCombined as
    select from Splits as S
    left join SplitResult as R
        on  S.StartNumber = R.Athlete.ID
        and S.SplitNr = R.SplitNr
        and S.SplitStartSecsFromContestBegin  = R.SplitStartSecsFromContestBegin
    {
        S.StartNumber as Athlete : Integer,
        S.SplitNr,
        S.SplitStartSecsFromContestBegin,
        R.LapNr
    };

define view RaceResultsAllActual as
    select from RaceResultsUnion as A
    left join LapResult as B
        on  A.TeamID = B.TeamID
        and A.LapNr  = B.LapNr
    {
        A.TeamID,
        A.LapNr,
        B.Athlete,
        B.LapTime,
        B.StartTime,
        B.EndTime,
        B.ContestRank
    };

// entity for Planner view
entity RaceResultsCombined as
    select from RaceResultsAllActual as A
    left join LapPlan as B
        on  A.TeamID = B.TeamID
        and A.LapNr  = B.LapNr
    {
        key A.TeamID as TeamID,
        key A.LapNr,
        case
            when
                A.Athlete.ID is null
            then
                B.Athlete.ID
            else
                A.Athlete.ID
        end      as Athlete : Integer,        
        A.LapTime,
        A.StartTime,
        A.EndTime,
        // The following coding is only working in SQLite:
        // format seconds as MM:SS for SQLite
        /*
        strftime('%M:%S',datetime(A.LapTime, 'unixepoch')) as LapTime : String,
        time(A.StartTime) as StartTime : Time,            
        time(A.EndTime) as EndTime : Time,
        */
        A.ContestRank,            
        //strftime('%H:%M',B.PredictedStartTime) as PredictedStartTime : Time,
        B.PredictedStartTime,
        case
            when
                A.Athlete.ID is null
            then
                0
            else
                1
        end      as FinishedFlag : Integer,
    };

entity LastFinishedAthleteLap as 
    select from LapResult
    {
        key TeamID,
        key Athlete,
        max(LapNr) as LapNr : Integer,
        max(StartTime) as LastFinishedStartTime : DateTime
    }
    group by TeamID, Athlete;

entity RaceResultsCombinedAthleteLastLap as
    select from RaceResultsCombinedAthlete as A
    left join LastFinishedAthleteLap as B
        on A.TeamID = B.TeamID
        and A.Athlete = B.Athlete.ID
        and A.LapNr = B.LapNr
        {
            key A.TeamID as TeamID,
            key A.LapNr,
            A.Athlete,
            A.FullName,
            A.PictureUrl,
            A.PredictedStartTime,
            A.EndTime,
            A.SplitTime1,
            A.SplitTime2,
            A.SplitTime3,
            A.LapTime,
        };
          
// entity for Athlete view table
entity RaceResultsCombinedAthlete as
    select from RaceResultsAllActual as A
    left join LapPlan as B
        on  A.TeamID = B.TeamID
        and A.LapNr  = B.LapNr
    left join SplitResult as S1
        on  S1.TeamID = A.TeamID
        and S1.LapNr  = A.LapNr     
        and S1.SplitNr = 1
    left join SplitResult as S2
        on  S2.TeamID = A.TeamID
        and S2.LapNr  = A.LapNr     
        and S2.SplitNr = 2
    left join SplitResult as S3
        on  S3.TeamID = A.TeamID
        and S3.LapNr  = A.LapNr     
        and S3.SplitNr = 3
    {
        key A.TeamID as TeamID,
        key A.LapNr,
        // check which athlete should be used:
        // 1: athlete from result record
        // 2: athlete from split record
        // 3: athlete from plan record
        case
            when
                A.Athlete.ID is null
            then                
                case
                    when
                        S1.Athlete.ID is null
                    then
                        B.Athlete.ID    // plan 
                    else
                        S1.Athlete.ID // split
                end
            else
                A.Athlete.ID // result
        end      as Athlete : Integer,
        case
            when
                A.Athlete.ID is null
            then                
                case
                    when
                        S1.Athlete.ID is null
                    then
                        B.Athlete.FullName
                    else
                        S1.Athlete.FullName
                end                
            else
                A.Athlete.FullName
        end      as FullName  : String(42),      
        case
            when
                A.Athlete.ID is null
            then                
                case
                    when
                        S1.Athlete.ID is null
                    then
                        B.Athlete.PictureUrl
                    else
                        S1.Athlete.PictureUrl // split
                end
            else
                A.Athlete.PictureUrl // result
        end      as PictureUrl : String(255),               
        A.LapTime,
        A.StartTime,
        A.EndTime,
        A.ContestRank,                    
        B.PredictedStartTime,
        case
            when
                A.Athlete.ID is null
            then
                0
            else
                1
        end      as FinishedFlag : Integer,
        case
            when
                A.Athlete.ID is null
            then
                B.PredictedStartTime
            else
                A.StartTime
        end      as CombinedTime : DateTime,
        S1.SplitTime as SplitTime1,
        S1.EndTime as EndTimeSplit1,
        S2.SplitTime as SplitTime2,
        S2.EndTime as EndTimeSplit2,
        S3.SplitTime as SplitTime3,
        S2.SplitTime - S1.SplitTime as SplitTime2Delta : Integer,
        S3.SplitTime - S2.SplitTime as SplitTime3Delta : Integer,
        S3.EndTime as EndTimeSplit3
    };

entity TeamLastFinishedLap as
    select from LapResult as A 
    {
        key A.TeamID as TeamID,
        max(A.LapNr) as LapNr : Integer
    }
    group by A.TeamID;

entity TeamCurrentRank as
    select from TeamLastFinishedLap as A
    inner join LapResult as B
        on  B.TeamID = A.TeamID
        and B.LapNr = A.LapNr  
    inner join Team as T
        on T.ID = A.TeamID            
    {   
        key A.TeamID,
        A.LapNr as LastFinishedLap,
        B.ContestRank,
        B.LapStartSecsFromContestBegin,
        B.LapTime,
        B.EndTime,
        T.TeamName,
        T.Number,
        T.Contest.ID as ContestID        
    };

entity TeamBehindAndAhead as
    select from TeamCurrentRank as A 
    left join TeamCurrentRank as B
       on B.ContestRank = A.ContestRank + 1
       and B.ContestID = A.ContestID
    left join TeamCurrentRank as C
       on C.ContestRank = A.ContestRank - 1
       and C.ContestID = A.ContestID       
    {   
        key A.TeamID,  
        A.ContestID, 
        A.LapStartSecsFromContestBegin, 
        A.LapTime,                  
        A.EndTime as EndTime, 
        A.LastFinishedLap, 
        B.TeamName as TeamBehind,
        B.LastFinishedLap as TeamBehindLapNr,
        B.Number as TeamBehindNumber,
        B.ContestRank as TeamBehindContestRank,
        B.LapStartSecsFromContestBegin as TeamBehindLapStartSec,
        B.LapTime as TeamBehindLapTime,        
        B.EndTime as TeamBehindEndTime,
        C.TeamName as TeamAhead,
        C.LastFinishedLap as TeamAheadLapNr,
        C.Number as TeamAheadNumber,
        C.ContestRank as TeamAheadContestRank,
        C.LapStartSecsFromContestBegin as TeamAheadLapStartSec,       
        C.LapTime as TeamAheadLapTime,         
        C.EndTime as TeamAheadEndTime
    };

entity TeamFastestLap as
    select from LapResult
    {
        key TeamID,                
        min(LapTime) as FastestLap : Integer      
    }
    where LapNr > 1 
    group by TeamID;

entity TeamFastestLapAthlete as
    select from TeamFastestLap as A
    inner join LapResult as B
        on  A.TeamID = B.TeamID
        and A.FastestLap = B.LapTime
    {   
        key A.TeamID,
        A.FastestLap,
        B.LapNr,
        B.Athlete.ID,
        B.Athlete.FullName        
    };

entity AthleteGetNextStart as
    select from RaceResultsAllActual as A
    left join LapPlan as B
        on  A.TeamID = B.TeamID
        and A.LapNr  = B.LapNr
    left join SplitResult as S1
        on  S1.TeamID = A.TeamID
        and S1.LapNr  = A.LapNr     
        and S1.SplitNr = 1          
    {        
        key B.Athlete.ID,
        min(
            B.PredictedStartTime
        )   as NextStartTime   : DateTime
    }
    where A.Athlete.ID is null
        and S1.SplitTime is null // split 1 is not finished
    group by        
        B.Athlete.ID;

entity AthleteOverview as
    select from Athlete as A
    left join AthleteGetNextStart as N
        on  A.ID = N.ID        
    {        
        key A.ID,        
        A.FirstName,
        A.LastName,
        A.FullName,
        A.PictureUrl,
        A.Team,        
        A.Team.Token,
        A.Team.TeamName,
        N.NextStartTime    
    };       

// get next start time for the team
entity TeamGetNextStart as
    select from RaceResultsAllActual as A
    left join LapPlan as B
        on  A.TeamID = B.TeamID
        and A.LapNr  = B.LapNr
    left join SplitResult as S1
        on  S1.TeamID = A.TeamID
        and S1.LapNr  = A.LapNr     
        and S1.SplitNr = 1        
    {
        key B.TeamID as TeamID,   
        min(B.PredictedStartTime) as NextStartTime   : DateTime
    }
    where A.Athlete.ID is null
        and S1.SplitTime is null // split 1 is not finished
    group by B.TeamID;

entity TeamGetCurrentLap as
    select from RaceResultsAllActual as A  
    {
        key A.TeamID as TeamID,   
        min(A.LapNr) as LapNr   : Integer
    }
    where A.Athlete.ID is null
    group by A.TeamID;


entity TeamGetCurrentAthlete as
    select from TeamGetCurrentLap as A
    left join LapPlan as B
        on  B.TeamID = A.TeamID
        and B.LapNr = A.LapNr
    left join SplitResult as S1
        on  S1.TeamID = A.TeamID
        and S1.LapNr  = A.LapNr     
        and S1.SplitNr = 1    
    {
        key A.TeamID,
        B.PredictedStartTime as CurrentStartTime,
        case
            when
                S1.Athlete.ID is null
            then
                B.Athlete.ID
            else
                S1.Athlete.ID
        end      as Athlete : Integer,
        case
            when
                S1.Athlete.ID is null
            then
                B.Athlete.FullName
            else
                S1.Athlete.FullName
        end      as FullName : String(42),
        case
            when
                S1.Athlete.ID is null
            then
                B.Athlete.FirstName
            else
                S1.Athlete.FirstName
        end      as FirstName : String(42),
        case
            when
                S1.Athlete.ID is null
            then
                B.Athlete.PictureUrl
            else
                S1.Athlete.PictureUrl
        end      as PictureUrl : String(255),        
        B.LapNr,
    };

entity TeamGetNextStartAthlete as
    select from TeamGetNextStart as A
    left join LapPlan as B
        on  A.TeamID = B.TeamID
        and A.NextStartTime  = B.PredictedStartTime
    {
        key A.TeamID, 
        A.NextStartTime,
        B.Athlete.ID,
        B.Athlete.FullName
    };

entity TeamOverview as
    select from Team as T    
    left join TeamCurrentRank as A
        on  A.TeamID = T.ID 
    left join TeamFastestLapAthlete as B
        on  B.TeamID = T.ID 
    left join TeamGetNextStartAthlete as C
        on  C.TeamID = T.ID
    left join TeamGetCurrentAthlete as D
        on  D.TeamID = T.ID
    left join RaceResultsCombinedAthlete as E
        on  E.TeamID = T.ID
        and E.Athlete = D.Athlete
        and E.LapNr = D.LapNr
    left join LastFinishedAthleteLap as F 
        on F.TeamID = T.ID
        and F.Athlete.ID = D.Athlete
    left join RaceResultsCombinedAthleteLastLap as G
        on  G.TeamID = T.ID
        and G.LapNr = F.LapNr
    left outer join MaxLapAndStartTime as H
        on H.TeamID = T.ID
    left outer join TeamBehindAndAhead as I
        on I.TeamID = T.ID
                  
    {
        key T.ID as TeamID,         
        T.TeamName,
        T.Contest.Category,
        T.Contest.GenderCategory,
        T.Token as Token,
        T.Number as Number,
        A.ContestRank as CurrentRank,           
        B.FastestLap,
        B.LapNr as FastestLapNr,
        B.ID as FastestAthleteID,       
        B.FullName as FastestFullName,
        C.NextStartTime,
        C.ID as NextAthleteID,       
        C.FullName as NextFullName,
        D.FirstName,
        D.FullName as CurrentFullName,
        D.Athlete as CurrentAthleteID,
        D.PictureUrl as PictureUrl,
        D.LapNr as CurrentLapNr,
        D.CurrentStartTime,
        G.LapNr as PreviousLapNr, // the previous lap for the current athlete
        E.SplitTime1 as CurrentLapAthleteSplit1,
        E.EndTimeSplit1 as CurrentEndTimeSplit1,
        E.SplitTime2 as CurrentLapAthleteSplit2,
        E.EndTimeSplit2 as CurrentEndTimeSplit2,
        E.SplitTime3 as CurrentLapAthleteSplit3,
        E.EndTimeSplit3 as CurrentEndTimeSplit3,
        E.FinishedFlag as CurrentFinishedFlag,
        G.SplitTime1 as PreviousLapAthleteSplit1,
        G.SplitTime2 as PreviousLapAthleteSplit2,
        G.SplitTime3 as PreviousLapAthleteSplit3,
        G.LapTime as PreviousLapTime,
        H.Highest_Lap as Highest_Lap,
        H.LastStart as LastStart,
        I.LastFinishedLap,
        I.LapStartSecsFromContestBegin, 
        I.LapTime,                  
        I.EndTime,
        I.TeamBehind,
        I.TeamBehindLapNr,
        I.TeamBehindLapStartSec,
        I.TeamBehindLapTime,        
        I.TeamBehindEndTime,
        I.TeamAhead,
        I.TeamAheadLapNr,
        I.TeamAheadLapStartSec,       
        I.TeamAheadLapTime,         
        I.TeamAheadEndTime,
        F.LastFinishedStartTime,
        case
            when
                (I.TeamBehindLapStartSec + I.TeamBehindLapTime) - (I.LapStartSecsFromContestBegin + I.LapTime) < 0
            then
                -((I.TeamBehindLapStartSec + I.TeamBehindLapTime) - (I.LapStartSecsFromContestBegin + I.LapTime))
            else
                (I.TeamBehindLapStartSec + I.TeamBehindLapTime) - (I.LapStartSecsFromContestBegin + I.LapTime)
        end      as BehindDeltaMinutes : Integer,
        case
            when
                (I.LapStartSecsFromContestBegin + I.LapTime) - (I.TeamAheadLapStartSec + I.TeamAheadLapTime) < 0
            then
                -((I.LapStartSecsFromContestBegin + I.LapTime) - (I.TeamAheadLapStartSec + I.TeamAheadLapTime))
            else
                (I.LapStartSecsFromContestBegin + I.LapTime) - (I.TeamAheadLapStartSec + I.TeamAheadLapTime)
        end      as AheadDeltaMinutes : Integer,
        I.LastFinishedLap - I.TeamBehindLapNr as BehindDeltaRounds : Integer,
        I.TeamAheadLapNr - I.LastFinishedLap as AheadDeltaRounds : Integer
    };

entity MasterData {
    TeamName       : String(80);
    FirstName      : String(20);
    LastName       : String(20);
    StartNumber    : String(6);
    TeamCategory   : String(20);
    GenderCategory : String(20);
    Gender         : String(1);
};

entity Heavy24Results {
    id                     : String(10);
    TeamCategory           : String(20);
    LapNumber              : Integer;
    StartNumber            : String(20);
    AthleteName            : String(42);
    LapTime                : String(8);
    LapEndFromContestBegin : String(8);
    ContestStanding        : String(20);
    TeamName               : String(80);
};

entity Splits {
    StartNumber                    : Integer;
    SplitNr                        : Integer;
    SplitStartSecsFromContestBegin : Integer;
};

entity ApiReads {
    key Event                   : Association to Event;
    key Type                    : String(10);
    url                         : String;
    frequencyInSeconds          : Integer;    
    Active                      : Boolean;
};

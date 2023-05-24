using { dfl } from '../db/data-model';

service dflService {
    entity Log as select from dfl.Log {*};
    entity Competitions as select from dfl.WS0101_MD_Competition {*};
    entity Matchdays as select from dfl.WS0102_MD_MatchDay {*};
    entity Stadiums as select from dfl.WS0103_MD_Stadium {*};
    entity Clubs as select from dfl.WS0104_MD_Club {*};
    entity Person as select from dfl.WS0105_MD_Person {*};
    entity Fixtures as select from dfl.WS0106_MD_Fixture {*};
    entity Seasons as select from dfl.WS0107_MD_Season {*};
    entity Services as select from dfl.Services {*};
    entity Modes as select from dfl.Modes {*};
    entity MatchStatistics as select from dfl.WS0303_MD_MatchStatistic {*};
    entity TeamStatistics as select from dfl.WS0303_MD_TeamStatistic {*};
    entity PlayerStatistics as select from dfl.WS0303_MD_PlayerStatistic {*};
    entity Statistic_Services as select from dfl.Statistic_Services {*};
    entity Statistics_Log as select from dfl.Statistics_Log {*};
    
    //@requires: 'authenticated-user'
    action updateFromApi(ModeId : String, clientId : String, serviceId : String, seasonId : String, 
        competitionId : String, clubId : String);
    
    //@requires: 'authenticated-user'
    action updateStatisticsFromApi(ModeId : String, clientId : String, serviceId : String, matchId : String, updateAll: Boolean);
}

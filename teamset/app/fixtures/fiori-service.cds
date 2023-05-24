using from '../../srv/dfl-service';

annotate dflService.Fixtures with @(
    UI: {
        Identification: [ 
            {Value: MatchId},
            {Value: CompetitionId},
            {Value: SeasonId},
        ],
        SelectionFields: [ CompetitionName, CompetitionType, MatchDay, Season],
        LineItem: [
            {Value: Season},
            {Value: MatchDay },
            {Value: HomeTeamName},
            {Value: GuestTeamName},
            {Value: CompetitionName}
            
        ],
        HeaderInfo: {
            TypeName: '{i18n>Fixture}',
            TypeNamePlural: '{i18n>Fixtures}',
            Title: {Value: CompetitionName},
            Description: {Value: CompetitionType}
        },
        Facets: [
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>General}', Target: '@UI.FieldGroup#General'},
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>Details}', Target: '@UI.FieldGroup#Details'}
		],
        FieldGroup#General: {
			Data: [
				{Value: CompetitionName},
                {Value: PlannedKickoffTime},
                 {Value: StadiumName}				
			]
		},
		FieldGroup#Details: {
			Data: [
                {Value: MatchId},
				{Value: CompetitionId},
                {Value: SeasonId}
			]
		}
    }
);



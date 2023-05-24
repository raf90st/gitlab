using from '../../srv/dfl-service';

annotate dflService.Matchdays with @(
     UI: {
        Identification: [ 
            {Value: MatchDayId}, 
            {Value: SeasonId} 
        ],
        SelectionFields: [ MatchDay, Season ],
        LineItem: [
            {Value: MatchDay},
            {Value: Season},
        ],
        HeaderInfo: {
            TypeName: '{i18n>Match Day}',
            TypeNamePlural: '{i18n>Match Days}',
            Title: {Value: MatchDay},
            Description: {Value: Season}
        },
        Facets: [
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>General}', Target: '@UI.FieldGroup#General'},
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>Details}', Target: '@UI.FieldGroup#Details'}
		],
        FieldGroup#General: {
			Data: [
				{Value: MatchDay},
				{Value: Season},			
			]
		},
		FieldGroup#Details: {
			Data: [
				{Value: MatchDayId},
                {Value: SeasonId},
			]
		}
    }
);



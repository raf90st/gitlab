using from '../../srv/dfl-service';

annotate dflService.Competitions with @(
    UI: {
        Identification: [ {Value: CompetitionId} ],
        SelectionFields: [ CompetitionName, CompetitionType,Country ],
        LineItem: [
            
            {Value: CompetitionName},
            {Value: CompetitionType},
            {Value: Country}
            
        ],
        HeaderInfo: {
            TypeName: '{i18n>Competition}',
            TypeNamePlural: '{i18n>Competitions}',
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
				{Value: CompetitionType},
                {Value: Country},		
			]
		},
		FieldGroup#Details: {
			Data: [
				{Value: CompetitionId}
			]
		}
    }
);



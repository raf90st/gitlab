using from '../../srv/dfl-service';

annotate dflService.Seasons with @(
     UI: {
        Identification: [ {Value: SeasonId} ],
        //SelectionFields: [ CompetitionName, Country ],
        LineItem: [
            {Value: Season}
        ],
        HeaderInfo: {
            TypeName: '{i18n>Season}',
            TypeNamePlural: '{i18n>Seasons}',
            Title: {Value: Season},
            Description: {Value: Season}
        },
        Facets: [
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>General}', Target: '@UI.FieldGroup#General'},
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>Details}', Target: '@UI.FieldGroup#Details'}
		],
        FieldGroup#General: {
			Data: [
				{Value: Season}			
			]
		},
		FieldGroup#Details: {
			Data: [
				{Value: SeasonId}
			]
		}
    }
);



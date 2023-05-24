using from '../../srv/dfl-service';

annotate dflService.Clubs with @(
     UI: {
        Identification: [ {Value: ClubId} ],
        SelectionFields: [ LongName, CompetitionName, Season],
        LineItem: [
            {Value: LongName},
            {Value: CompetitionName},
            {Value: Season}
        ],
        HeaderInfo: {
            TypeName: '{i18n>Club}',
            TypeNamePlural: '{i18n>Clubs}',
            Title: {Value: LongName},
            Description: {Value: CompetitionName}
        },
        Facets: [
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>General}', Target: '@UI.FieldGroup#General'},
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>Details}', Target: '@UI.FieldGroup#Details'}
		],
        FieldGroup#General: {
			Data: [
				{Value: LongName},
                {Value: ThreeLetterCode}
			
			]
		},
		FieldGroup#Details: {
			Data: [
				{Value: ClubId},
                {Value: CompetitionId},
                {Value: StadiumId}
                
			]
		}
    }
);



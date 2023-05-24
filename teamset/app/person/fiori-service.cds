using from '../../srv/dfl-service';

annotate dflService.Person with @(
     UI: {
        Identification: [ 
            {Value: PersonId},
            {Value: FeedType} 
        ],
        SelectionFields: [ PersonId, PersonName, ClubName],
        LineItem: [

            {Value: PersonId},
            {Value: FirstName},
            {Value: LastName},
            {Value: BirthDate},
            {Value: ClubName}
            
        ],
        HeaderInfo: {
            TypeName: '{i18n>Person}',
            TypeNamePlural: '{i18n>Person}',
            Title: {Value: PersonName},
            Description: {Value: ClubName}
        },
        Facets: [
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>General}', Target: '@UI.FieldGroup#General'},
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>Details}', Target: '@UI.FieldGroup#Details'}
		],
        FieldGroup#General: {
			Data: [

                {Value: PersonId},
				{Value: PersonName},
				{Value: ClubName},
                {Value: PlayingPositionGerman}

			]
		},
		FieldGroup#Details: {
			Data: [

                {Value: BirthPlace},
                {Value: NationalityGerman},
                {Value: BirthDate},
                {Value: Height},
                {Value: Weight}
			]
		}
    }
);



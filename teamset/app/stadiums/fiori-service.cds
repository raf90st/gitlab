using from '../../srv/dfl-service';

annotate dflService.Stadiums with @(
     UI: {
        Identification: [ {Value: StadiumId} ],
        SelectionFields: [ Name, Country, ValidTo, City, Country, RoofedOver ],
        LineItem: [
            {Value: Name},
            {Value: Street},
            {Value: HouseNumber},
            {Value: PostalCode},
            {Value: City},
            {Value: Country},
            {Value: YearOfConstruction},
            {Value: RoofedOver}
        ],
        HeaderInfo: {
            TypeName: '{i18n>Stadium}',
            TypeNamePlural: '{i18n>Stadiums}',
            Title: {Value: Name},
            Description: {Value: City}
        },
        Facets: [
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>General}', Target: '@UI.FieldGroup#General'},
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>Details}', Target: '@UI.FieldGroup#Details'}
		],
        FieldGroup#General: {
			Data: [
				{Value: Name}			
			]
		},
		FieldGroup#Details: {
			Data: [
				{Value: StadiumId}
			]
		}
    }
);



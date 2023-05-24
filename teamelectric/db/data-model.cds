namespace tpa;

entity T_TRIPINFO {
    key TI_STARTDATE    	: Date;
    key TI_STARTTIME    	: Time;
    key TI_ENDDATE      	: Date;
    key TI_ENDTIME      	: Time;
    key TI_LICENSEPLATE 	: String(10);
        TI_STARTLOC     	: String(200);
//        TI_STARTCOORD   	: hana.ST_POINT(4326);
        TI_STARTCOORD   	: hana.ST_POINT(3857);
        TI_STARTLAT     	: Decimal(9, 6);
        TI_STARTLONG    	: Decimal(9, 6);
        TI_DESTLOC      	: String(200);
//        TI_STARTCOORD   	: hana.ST_POINT(4326;
        TI_DESTCOORD    	: hana.ST_POINT(3857);
        TI_DESTLAT      	: Decimal(9, 6);
        TI_DESTLONG     	: Decimal(9, 6);
        TI_DURATION     	: Time;
        TI_DISTANCE     	: Decimal(4, 1);
        TI_AVGSPEED     	: Decimal(4, 1);
        TI_KWH          	: Decimal(3, 1);
        TI_PERFORMANCE  	: Decimal(6, 3);
    	TI_STARTCOUNTRY		: String(50);
        TI_STARTSTATE		: String(50);
        TI_STARTCITY		: String(50);
        TI_STARTSTREET		: String(50);
        TI_STARTHOUSENUMBER	: String(10);
        TI_STARTPOSTALCODE	: String(5);
        TI_DESTCOUNTRY		: String(50);
        TI_DESTSTATE		: String(50);
        TI_DESTCITY			: String(50);
        TI_DESTSTREET		: String(50);
        TI_DESTHOUSENUMBER	: String(10);
        TI_DESTPOSTALCODE	: String(5);
};

//@cds.persistence.skip
entity T_CHARGEINFO {
        CI_DATASOURCE   	: String(1);
    key CI_ACTUALDATE   	: Date;
        CI_KWH          	: Decimal(7, 4);
    key CI_CHARGEDURATION	: Time;
        CI_NETCOST      	: Decimal(5, 2);
        CI_CURRENCY     	: String(3);
        CI_GROSSCOST    	: Decimal(7, 4);
    key CI_CHARGEID     	: String(50);
        CI_PROVIDER     	: String(50);
        CI_LOCATION     	: String(200);
    key CI_LICENSEPLATE 	: String(10);
    	CI_LATITUDE			: Decimal(9, 6);
    	CI_LONGITUDE		: Decimal(9, 6);
    	CI_COUNTRY			: String(50);
    	CI_STATE			: String(50);
    	CI_CITY				: String(50);
    	CI_STREET			: String(50);
    	CI_HOUSENUMBER		: String(10);
    	CI_POSTALCODE		: String(5);
};

entity T_CHARGEINFO_PRIVAT {
    key CI_ACTUALDATE   	: Date;
        CI_KWH          	: Decimal(7, 4);
    key CI_CHARGEDURATION	: Time;
        CI_NETCOST      	: Decimal(5, 2);
        CI_CURRENCY     	: String(3);
        CI_GROSSCOST    	: Decimal(7, 4);
    key CI_CHARGEID     	: String(50);
        CI_PROVIDER     	: String(50);
        CI_CONTRACTPARTNER	: String(50);
        CI_PRODUCT			: String(50);        
    key CI_LICENSEPLATE 	: String(10);
    	CI_LATITUDE			: Decimal(9, 6);
    	CI_LONGITUDE		: Decimal(9, 6);
    	CI_COUNTRY			: String(50);
    	CI_STATE			: String(50);
    	CI_CITY				: String(50);
    	CI_STREET			: String(50);
    	CI_HOUSENUMBER		: String(10);
    	CI_POSTALCODE		: String(5);
};

entity T_USERINFO {
	key	UI_LICENSEPLATE :	String(10);
		UI_VEHICLEUSER	:	String(30);
	key	UI_STARTDATE	:	Date;
		UI_ENDDATE		:	Date;
};

entity T_DATAQUALITY {
	key DQ_CHARGEID		:	String(20);
		DQ_LOCATION		:	String(200);
		DQ_CORRECTION	:	String(200);
};

entity T_PROVIDER_TEXT {
	key PI_DATASOURCE   :   String(1);
		PT_SHORT		:	String(20);
		PT_LONG			:	String(60);
};
	
entity T_LOG {
    key TimeStamp   : DateTime;
    key TableName   : String(50);
    key ChangeType  : String(200);
    formattedDate   : Date;
    NumberOfRecords : Integer;
}
	
	
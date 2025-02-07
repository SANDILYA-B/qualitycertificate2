sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'numberrange/test/integration/FirstJourney',
		'numberrange/test/integration/pages/numberrangeList',
		'numberrange/test/integration/pages/numberrangeObjectPage'
    ],
    function(JourneyRunner, opaJourney, numberrangeList, numberrangeObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('numberrange') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThenumberrangeList: numberrangeList,
					onThenumberrangeObjectPage: numberrangeObjectPage
                }
            },
            opaJourney.run
        );
    }
);
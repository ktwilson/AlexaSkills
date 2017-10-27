/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/


'use strict';

const Alexa = require('alexa-sdk');
const https = require('https');
const http = require('http');

const APP_ID = 'my-skill-app-id';  
const availItems = 'available data are temperature,humidity,dewpoint,barometer,forecast,wind,rain,month rain,today,sunrise,sunset';


const handlers = {
    'LaunchRequest': function () {
        if (this.event.session.application.applicationId != APP_ID)
            this.context.fail("Invalid Application ID");
        else {
            getWeather(['temperature','r'],msg=> {
                this.emit(':tell', msg);
            });
        }
    },
    'WeatherStation': function () {
        var item = 'temperature';
        
        if (this.event.session.application.applicationId != APP_ID)
            this.context.fail("Invalid Application ID");
        else {
            var intent = this.event.request.intent; 
            if (intent.slots) {
                var props = Object.keys(intent.slots);
                if (props.length) { 
                    item = intent.slots[props[0]].value;  
                    if (item !== undefined)
                        item = item.trim();
                }
                    
            }
         
            getWeather(item, msg=> {
                this.emit(':tell', msg);
            });
        }
         
    },
    
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

function getWeather(item,cb) {
    weatherService((ws)=> {
        var msg='<p>from sorek trail weather station</p> ';
        var val = ws[item];
        
        if (Array.isArray(item)) {
            item.forEach(prop=> {
                msg += '<p>' + prop + ' ' + ws[prop]  + '</p>';
            }); 
                
            
        }
        else {
            if (typeof(val) == 'object') {
                for(var prop in val)
                    msg += '<p>' + prop + ' ' + val[prop]  + '</p>';
            }
            else {
                if (val === undefined)
                    msg = availItems;
                else {
                    if (typeof(val) == 'number')
                        val = val.toFixed(0); 
                    msg += item + ' is ' + val;
                }
            }
        }
        
        cb(msg);
    });
}

function weatherService(cb) {
    https.get({
        host: 'smart-app.live',
        path:'/vpws/alexa'
    }, function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            var parsed = JSON.parse(body);
            cb(parsed);
        });
    });
}


exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handlers);
    alexa.execute();
};

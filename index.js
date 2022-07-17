#!/usr/bin/env node

const OAuth = require('oauth')
const got = require('got')
const { promisify } = require('util')
require('dotenv').config()
var http = require('http');
var nodeUrl = require('url');

var oa = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  process.env.TWITTER_CONSUMER_KEY,
  process.env.TWITTER_CONSUMER_SECRET,
  '1.0A', null, 'HMAC-SHA1'
);

http.createServer(function (request, response) {
  oa.getOAuthRequestToken(function (error, oAuthToken, oAuthTokenSecret, results) {
    var urlObj = nodeUrl.parse(request.url, true);
    console.log('urlObj', urlObj)
    var authURL = 'https://twitter.com/' +
      'oauth/authorize?oauth_token=' + oAuthToken;
    var handlers = {
      '/': function (request, response) {
        /**
         * Creating an anchor with authURL as href and sending as response
         */
        var body = '<a href="' + authURL + '"> Get Code </a>';
        response.writeHead(200, {
          'Content-Length': body.length,
          'Content-Type': 'text/html'
        });
        response.end(body);
      },
      '/callback': function (request, response) {
        /** Obtaining access_token */
        var getOAuthRequestTokenCallback = function (error, oAuthAccessToken,
          oAuthAccessTokenSecret, results) {
          if (error) {
            console.log(error);
            response.end(JSON.stringify({
              message: 'Error occured while getting access token',
              error: error
            }));
            return;
          }
          // console.log(oAuthAccessToken)
          // console.log(oAuthAccessTokenSecret)
          // oa.get('https://api.twitter.com/1.1/account/verify_credentials.json',
          //        oAuthAccessToken,
          //        oAuthAccessTokenSecret,
          //        function (error, twitterResponseData, result) {
          //            if (error) {
          //                console.log(error)
          //                response.end(JSON.stringify(error));
          //                return;
          //            }
          //            try {
          //                console.log(JSON.parse(twitterResponseData));
          //            } catch (parseError) {
          //                console.log(parseError);
          //            }
          //            console.log(twitterResponseData);
          //            response.end(twitterResponseData);
          //        });
          oa.get('https://api.twitter.com/1.1/statuses/show.json?id=1548692101831053316',
            oAuthAccessToken,
            oAuthAccessTokenSecret,
            function (error, twitterResponseData, result) {
              if (error) {
                console.log(error)
                response.end(JSON.stringify(error));
                return;
              }
              try {
                console.log(JSON.parse(twitterResponseData));
              } catch (parseError) {
                console.log(parseError);
              }
              console.log(twitterResponseData);
              response.end(twitterResponseData);
            });
        };

        oa.getOAuthAccessToken(urlObj.query.oauth_token, oAuthTokenSecret,
          urlObj.query.oauth_verifier,
          getOAuthRequestTokenCallback);

      },
      '/favicon.ico': function (request, response) {
        response.writeHead(200);
      }
    };
    handlers[urlObj.pathname](request, response);
  })

}).listen(3000);
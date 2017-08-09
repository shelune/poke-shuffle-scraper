var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');

var baseUrl = "https://bulbapedia.bulbagarden.net/wiki/";
var stage = "Zaffiro_Coast";

request(baseUrl + stage, function (error, response, body) {
  if (!error) {
    var $ = cheerio.load(body);
    $('.mw-body-content table.roundy tr').each(function () {
      var pokemon = { pokemonName: "", pokemonIcon: "", location: "" };
      var pokemonName = $(this).find('td:nth-of-type(3) a').text();
      request(baseUrl + pokemonName + '_(Pokémon)', function (errorSub, responseSub, bodySub) {
        if (!errorSub) {
          var $sub = cheerio.load(bodySub);
          var pokemonInfo = $sub('a[title="Pokémon Shuffle"]').closest('b').siblings('table')[0];
          if (pokemonInfo) {
            var pokemonBP = $sub(pokemonInfo).find('tr:first-of-type td:nth-of-type(4)').text();
            var pokemonSkill = $sub(pokemonInfo).find('tr:nth-of-type(2) th[colspan="2"]').text();

            console.log('RESULT: ', pokemonName + ' BP: ', pokemonBP, '. ', pokemonSkill);
          }
        }
      })
    });
  } else {
    console.log("We’ve encountered an error: " + error);
  }
});
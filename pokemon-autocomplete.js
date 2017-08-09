var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var stageTypes = {main: [], expert: [], special: [], mega: []};

var baseUrl = "http://bulbapedia.bulbagarden.net/wiki/";
var stagesArr = [
  'Expert_Stages',
  'Puerto_Blanco',
  'Sandy_Bazaar',
  'Night_Festival',
  'Isla_Azul',
  'Rainbow_Park',
  'Galerie_Rouge',
  'Sweet_Strasse',
  'Silbern_Museum',
  'Mt._Vinter',
  'Castle_Noapte',
  'Jungle_Verde',
  'Wacky_Workshop',
  'Pedra_Valley',
  "Albens_Town",
  'Roseus_Center',
  'Desert_Umbra',
  'Violeta_Palace',
  'Blau_Salon',
  'Graucus_Hall',
  'Nacht_Carnival',
  'Prasino_Woods',
  'Zaffiro_Coast'
];

_.map(stagesArr, phase => {
  let targetUrl = baseUrl + phase;
  request(targetUrl, function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body);
      $('table.roundy tr').each(function () {
        var pokemon = {pokemonName : "", pokemonIcon: "", location: ""};
        var pokemonStage = $(this).find('td:first-of-type').text();
        var pokemonName = $(this).find('td:nth-of-type(3) a').text();
        var pokemonIcon = $(this).find('td:nth-of-type(2) img').attr('src');
        var pokemonLocation = pokemonStage;
        var suffixArr = ['w', 's', 'c', 'o', 't', 'm', 'ha', 'p', 'r', 'f'];

        // M-zard X
        if (pokemonName.toLowerCase().startsWith('mega ')) {
          if (pokemonIcon.includes('-mx')) {
            pokemonName = pokemonName + '-X';
          }
          if (pokemonIcon.includes('-ms')) {
            pokemonName = pokemonName + '-S';
          }
          stageTypes.mega.push(pokemon);
        } else {
          // handle different formes
        }
        pokemon.pokemonName = pokemonName;
        pokemon.pokemonIcon = _.trim(pokemonIcon);
        if (pokemonLocation) {
          pokemon.location = _.trim(pokemonLocation);
        } else {
          pokemon.location = '';
        }

        if (!isNaN(pokemon.location) && pokemon.location.length > 0 && !pokemon.location.includes('EX')) {
          pokemon.location = _.trim(pokemon.location);
          stageTypes.main.push(pokemon);
        } else if (pokemon.location.includes('EX')) {
          pokemon.location = _.toString(pokemon.location.match(/\d+/g));
          stageTypes.expert.push(pokemon);
        }

      });

      fs.writeFile('stageCollection.json', JSON.stringify(stageTypes, null, 4), function(err){
          console.log('File successfully written! - Check your project directory for the stageCollection.json file');
      });
      console.log('stageTypes: ', stageTypes);
    } else {
      console.log("We’ve encountered an error: " + error);
    }
  });
});


function hasDupl(list, division, item) {
  return list[division].some(function(listItem) {
    return listItem.pokemonName === item.pokemonName && listItem.location === item.location
  });
}
